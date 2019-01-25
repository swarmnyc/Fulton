import { ObjectId } from 'bson';
import { getMongoRepository, MongoRepository } from "typeorm";
import { ColumnMetadata } from 'typeorm/metadata/ColumnMetadata';
import { EntityMetadata } from 'typeorm/metadata/EntityMetadata';
import { injectable } from '../../alias';
import { FultonError } from '../../common';
import { FultonStackError } from '../../common/fulton-error';
import { FindResult, QueryColumnOptions, QueryParams } from '../../types';
import { EntityRunner } from './entity-runner';
import * as lodash from 'lodash'

@injectable()
export class MongoEntityRunner extends EntityRunner {
    updateIdMetadata<T>(repository: MongoRepository<T>) {
        let metadata = repository.metadata

        // make metadata for mongo
        let idColumn = metadata.ownColumns.find((c) => c.propertyName == "id")

        if (idColumn && idColumn.isObjectId == false) {
            idColumn.isObjectId = true;
            idColumn.givenDatabaseName =
                idColumn.databaseNameWithoutPrefixes =
                idColumn.databaseName = "_id";

            metadata.generatedColumns = [idColumn]
            metadata.objectIdColumn = idColumn
        }
    }

    /**
     * use provided repository to find entities
     * @param repository
     * @param queryParams
     */
    protected async findCore<T>(repository: MongoRepository<T>, queryParams: QueryParams = {}): Promise<FindResult<T>> {
        let skip;
        let size;
        if (queryParams.pagination) {
            size = queryParams.pagination.size;
            if (queryParams.pagination.index && queryParams.pagination.size) {
                skip = queryParams.pagination.index * size;
            }
        }

        let cursor = repository.createEntityCursor(queryParams.filter)
        if (skip) cursor.skip(skip)
        if (size) cursor.limit(size)
        if (queryParams.sort) cursor.sort(queryParams.sort)
        if (queryParams.projection) cursor.project(queryParams.projection)

        const [data, count] = await Promise.all<any>([
            cursor.toArray(),
            repository.count(queryParams.filter),
        ]);

        if (data.length > 0 && queryParams.includes) {
            await this.processIncludes(repository, data, queryParams);
        }

        return { data: data, total: count };
    }

    /**
     * use provided repository to find one entity
     * @param repository
     * @param queryParams
     */
    protected async findOneCore<T>(repository: MongoRepository<T>, queryParams: QueryParams = {}): Promise<T> {
        let repo = (<any>repository as MongoRepository<T>);

        let cursor = repo.createEntityCursor(queryParams.filter)
        if (queryParams.sort) cursor.sort(queryParams.sort)
        if (queryParams.projection) cursor.project(queryParams.projection)

        const result = await cursor.limit(1).toArray()
        const data = result.length > 0 ? result[0] : null

        if (data && queryParams.includes) {
            await this.processIncludes(repo, data, queryParams);
        }

        return data
    }

    protected createCore<T extends any>(repository: MongoRepository<T>, entity: T): Promise<T> {
        if (entity[repository.metadata.objectIdColumn.propertyName]) {
            // TODO: should move this code to typeorm
            entity._id = entity[repository.metadata.objectIdColumn.propertyName];
            delete entity[repository.metadata.objectIdColumn.propertyName];
        }

        return repository.insertOne(entity).then((result) => {
            // TODO: should move this code to typeorm
            entity[repository.metadata.objectIdColumn.propertyName] = entity._id;
            delete entity._id;

            return entity
        });
    }

    protected createManyCore<T extends any>(repository: MongoRepository<T>, entities: T[]): Promise<T[]> {
        entities.forEach((entity) => {
            if (entity[repository.metadata.objectIdColumn.propertyName]) {
                // TODO: should move this code to typeorm
                entity._id = entity[repository.metadata.objectIdColumn.propertyName];
                delete entity[repository.metadata.objectIdColumn.propertyName];
            }
        })


        return repository.insertMany(entities).then(() => {
            // TODO: should move this code to typeorm
            entities.forEach((entity, i) => {
                entity[repository.metadata.objectIdColumn.propertyName] = entity._id;
                delete entity._id;
            })

            return entities
        });
    }

    protected updateCore<T extends any>(repository: MongoRepository<T>, id: any, update: T): Promise<any> {
        // no id inside of update
        delete update[repository.metadata.objectIdColumn.propertyName];

        return repository.updateOne({ _id: id }, this.convertUpdate(update)).then((result) => {
            if (result.matchedCount == 0) {
                return Promise.reject(new FultonError("unmatched_id"))
            }
        })
    }

    protected updateManyCore<T extends any>(repository: MongoRepository<T>, filter: any, update: T): Promise<number> {
        return repository.updateMany(filter, this.convertUpdate(update)).then((result) => {
            return result.matchedCount
        })
    }

    protected deleteCore<T>(repository: MongoRepository<T>, id: any): Promise<any> {
        return repository.deleteOne({ _id: id })
    }

    protected deleteManyCore<T extends any>(repository: MongoRepository<T>, query: any): Promise<number> {
        return repository.deleteMany(query).then((result) => {
            return result.deletedCount
        })
    }

    protected extendedConvertValue(metadata: string | ColumnMetadata, value: any, errorTracker: FultonStackError): any {
        if (metadata != null && value != null) {
            let type: any;
            if (metadata instanceof ColumnMetadata) {
                type = metadata.type;

                if (!type && metadata.isObjectId) {
                    type = "ObjectId"
                }
            } else {
                type = metadata;
            }

            if ((type == ObjectId || "ObjectId".same(type)) && value.constructor.name != "ObjectID") {
                try {
                    return new ObjectId(value);
                } catch  {
                    errorTracker.add("object_id", "must be an object id", true);
                }
            }
        }

        return value;
    }

    /**
     * adjust filter like change id to _id, change $like to {$regex, $options}
     */
    protected extendedAdjustFilter<T>(filter: any, name: string, value: string, targetColumn: ColumnMetadata, errorTracker: FultonStackError): void {
        if (name == "$like") {
            filter["$regex"] = value;
            filter["$options"] = "i";
            delete filter["$like"]

            return;
        }

        if (targetColumn && targetColumn.isObjectId && name != "_id") {
            filter._id = value;
            delete filter[name];

            return;
        }
    }

    protected processIncludes<T>(repository: MongoRepository<T>, data: T | T[], queryParams: QueryParams): Promise<any> {
        let includeProjection = queryParams.includeProjection || {}

        let task = Promise.resolve()

        queryParams.includes.forEach((include) => {
            task = task.then(() => {
                let nameChain = include.split(".")
                let repo = this.findIncludeRepo(repository, nameChain, 0)
                if (repo) {
                    return this.processIncludeInternal(repo, data, nameChain, includeProjection[include])
                }
            })
        })

        return task
    }


    protected adjustParams<T>(metadata: EntityMetadata, params: QueryParams = {}, onlyFilter: boolean = false): FultonError {
        if (!onlyFilter) {
            if (params.select) {
                params.projection = this.transformSelect(params.select);
            }

            if (params.sort) {
                this.adjustIdInOptions(metadata, params.sort);
            }

            if (params.projection) {
                this.adjustIdInOptions(metadata, params.projection);
            }

            let projection = this.mergeProjection(metadata, params.projection)
            if (projection) {
                params.projection = projection
            }
        }

        return super.adjustParams(metadata, params)
    }

    /**
     * adjust options like change id to _id
     */
    private adjustIdInOptions<T>(metadata: EntityMetadata, options: any) {
        // TODO: should move this code to typeorm
        let idName = metadata.objectIdColumn.propertyName;

        for (const name of Object.getOwnPropertyNames(options)) {
            if (name == idName) {
                // TODO: should move this code to typeorm
                options._id = options[name];
                delete options[idName]
            } else if (name == "id") {
                options._id = options[name];
                delete options["id"]
            }
        }
    }

    /**
     * transform select to projection
     * @param queryParams
     */
    private transformSelect(select: string[]): QueryColumnOptions {
        let options: QueryColumnOptions = {};

        for (const s of select) {
            options[s] = 1;
        }

        return options
    }

    /**
     * merge metadata to projection
     * @param queryParams
     */
    private mergeProjection(metadata: EntityMetadata, projection: QueryColumnOptions = {}): QueryColumnOptions {
        metadata.columns.forEach((c) => {
            if (!c.isSelect) {
                if (projection[c.propertyPath] && projection[c.propertyPath] != 0) {
                    // override the entity metadata
                    delete projection[c.propertyPath]
                } else {
                    // hide the column
                    projection[c.propertyPath] = 0;
                }
            }
        })

        if (Object.getOwnPropertyNames(projection).length == 0) {
            return null
        } else {
            return projection
        }
    }

    private findIncludeRepo(repository: MongoRepository<any>, nameChain: string[], index: number): MongoRepository<any> {
        let relType = repository.metadata.relatedToMetadata[nameChain[index]]
        if (relType == null) return null

        let relRepo = getMongoRepository(relType);
        if (index == nameChain.length - 1) {
            return relRepo
        } else {
            return this.findIncludeRepo(relRepo, nameChain, index + 1)
        }
    }

    private flatItems(arr: any[], data: any, nameChain: string[], index: number) {
        let refItem = data[nameChain[index]]

        if (refItem == null) return

        if (index == nameChain.length - 1) {
            if (refItem instanceof Array) {
                arr.push(...refItem)
            } else {
                arr.push(refItem)
            }
        } else {
            if (refItem instanceof Array) {
                refItem.forEach((i) => {
                    this.flatItems(arr, i, nameChain, index + 1)
                })
            } else {
                this.flatItems(arr, refItem, nameChain, index + 1)
            }
        }
    }

    private async processIncludeInternal<T>(repository: MongoRepository<T>, data: T | T[], columnNameChain: string[], projection: QueryColumnOptions): Promise<void> {
        //TODO: should cover more situations and better performance
        let relItems: any[] = []

        if (data instanceof Array) {
            data.forEach((d) => {
                this.flatItems(relItems, d, columnNameChain, 0)
            })
        } else {
            this.flatItems(relItems, data, columnNameChain, 0)
        }

        if (relItems.length == 0) return

        let ids = new Set();

        relItems.forEach((item) => ids.add(item[repository.metadata.objectIdColumn.propertyName] || item._id))

        let items = await this.find(repository, { filter: { "_id": { "$in": Array.from(ids) } }, projection: projection })

        relItems.forEach(relItem => {
            let id = relItem[repository.metadata.objectIdColumn.propertyName] || relItem._id
            let item = items.data.find((d: any) => {
                let rId = d[repository.metadata.objectIdColumn.propertyName] || d._id
                if (id.equals) {
                    return id.equals(rId)
                } else {
                    return id == rId
                }
            })

            if (item) {
                Object.assign(relItem, item)
                relItem.constructor = item.constructor
            }
        });
    }

    private convertUpdate(input: any): any {
        Object.getOwnPropertyNames(input).forEach((name) => {
            if (!name.startsWith("$")) {
                if (input["$set"] == null) {
                    input["$set"] = {}
                }

                input["$set"][name] = input[name]
                delete input[name]
            }
        })

        return input
    }
}
