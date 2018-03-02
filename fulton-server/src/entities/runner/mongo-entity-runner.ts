import { QueryColumnOptions, QueryParams, injectable, FindResult, IEntityRunner } from '../../interfaces';
import { MongoRepository, Repository, getMongoRepository } from "typeorm";

import { ObjectId } from 'bson';
import { Type } from "../../interfaces";
import { EntityMetadata } from 'typeorm/metadata/EntityMetadata';
import { ColumnMetadata } from 'typeorm/metadata/ColumnMetadata';
import { FultonStackError } from '../../common/fulton-error';
import { fultonDebug } from '../../helpers/debug';

interface IncludeOptions {
    [key: string]: IncludeOptions | false
}

@injectable()
export class MongoEntityRunner implements IEntityRunner {
    /**
     * use provided repository to find entities
     * @param repository 
     * @param queryParams 
     */
    async find<T>(repository: Repository<T>, queryParams: QueryParams = {}): Promise<FindResult<T>> {
        let repo = (<any>repository as MongoRepository<T>);
        this.adjustQueryParams(repo, queryParams);

        let skip;
        let size;
        if (queryParams.pagination) {
            size = queryParams.pagination.size;
            if (queryParams.pagination.index && queryParams.pagination.size) {
                skip = queryParams.pagination.index * size;
            }
        }

        fultonDebug("Query on %s QueryParams %O", repository.metadata.name, queryParams)

        let cursor = repo.createEntityCursor(queryParams.filter)
        if (skip) cursor.skip(skip)
        if (size) cursor.limit(size)
        if (queryParams.sort) cursor.sort(queryParams.sort)
        if (queryParams.projection) cursor.project(queryParams.projection)

        const [data, count] = await Promise.all<any>([
            cursor.toArray(),
            repo.count(queryParams.filter),
        ]);

        if (data.length > 0 && queryParams.includes) {
            await this.processIncludes(repo, data[0], queryParams.includes);
        }

        return { data: data, total: count };
    }

    /**
     * use provided repository to find one entity
     * @param repository 
     * @param queryParams 
     */
    async findOne<T>(repository: Repository<T>, queryParams: QueryParams = {}): Promise<T> {
        let repo = (<any>repository as MongoRepository<T>);
        this.adjustQueryParams(repo, queryParams);

        // TODO: typeorm has bug on projection on mongodb        
        let data = await repo.findOne({
            where: queryParams.filter,
            order: queryParams.sort as any
        });

        if (data && queryParams.includes) {
            await this.processIncludes(repo, data, queryParams.includes);
        }

        return data
    }

    /**
     * use provided repository to find one entity
     * @param repository 
     * @param queryParams 
     */
    async findById<T>(repository: Repository<T>, id: any, queryParams: QueryParams = {}): Promise<T> {
        queryParams.filter = {
            _id: id
        }

        queryParams.sort = null;
        queryParams.pagination = null;

        return this.findOne(repository, queryParams);
    }

    create<T extends any>(repository: Repository<T>, entity: T): Promise<T> {
        if (entity[repository.metadata.objectIdColumn.propertyName]) {
            // TODO: should move this code to typeorm
            entity._id = entity[repository.metadata.objectIdColumn.propertyName];
            delete entity[repository.metadata.objectIdColumn.propertyName];
        }

        return (<any>repository as MongoRepository<T>)
            .insertOne(entity)
            .then((result) => {
                // TODO: should move this code to typeorm
                entity[repository.metadata.objectIdColumn.propertyName] = entity._id;
                delete entity._id;

                return entity
            });
    }

    update<T>(repository: Repository<T>, id: any, entity: T, replace?: boolean): Promise<any> {
        return (<any>repository as MongoRepository<T>)
            .updateOne({ _id: id }, replace ? entity : { $set: entity })
    }

    delete<T>(repository: Repository<T>, id: any): Promise<any> {
        return (<any>repository as MongoRepository<T>)
            .deleteOne({ _id: id })
    }

    convertValue(metadata: string | ColumnMetadata, value: any, errorTracker: FultonStackError): any {
        if (metadata != null && value != null) {
            let type;
            if (metadata instanceof ColumnMetadata) {
                type = metadata.type;

                if (!type && metadata.isObjectId) {
                    type = "ObjectId"
                }
            } else {
                type = metadata;
            }

            if (type == "ObjectId" && value.constructor.name != "ObjectID") {
                try {
                    return new ObjectId(value);
                } catch  {
                    errorTracker.add("must be an object id", true);
                }
            }
        }

        return value;
    }

    /**
     * adjust filter like change id to _id, change $like to {$regex, $options} 
     */
    adjustFilter<T>(filter: any, name: string, value: string, targetColumn: ColumnMetadata, errorTracker: FultonStackError): void {
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

    protected processIncludes<T>(repository: MongoRepository<T>, data: T | T[], includes: string[]): Promise<any> {
        let includeOptions = this.transformIncludes(includes);

        if (data instanceof Array) {
            let tasks = data.map((d) => {
                return this.processIncludeInternal(repository, d, includeOptions);
            })

            return Promise.all(tasks);
        } else if (data) {
            return this.processIncludeInternal(repository, data, includeOptions);
        }
    }

    /**
     * adjust like change id to _id, change $like to {$regex, $options} 
     */
    protected adjustQueryParams<T>(repository: MongoRepository<T>, queryParams: QueryParams): void {
        if (queryParams.select) {
            queryParams.projection = this.transformSelect(queryParams.select);
        }

        if (queryParams.sort) {
            this.adjustIdInOptions(repository, queryParams.sort);
        }

        if (queryParams.projection) {
            this.adjustIdInOptions(repository, queryParams.projection);
        }

        queryParams.projection = this.mergeProjection(repository, queryParams.projection)
    }

    /**
     * adjust options like change id to _id
     */
    private adjustIdInOptions<T>(repository: MongoRepository<T>, options: any) {
        // TODO: should move this code to typeorm        
        let idName = repository.metadata.objectIdColumn.propertyName;

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
    private mergeProjection<T>(repository: MongoRepository<T>, projection: QueryColumnOptions): QueryColumnOptions {
        let newProjection: any = projection || {}

        console.log("newProjection", newProjection)

        repository.metadata.columns.forEach((c) => {
            if (!c.isSelect) {
                newProjection[c.propertyPath] = newProjection[c.propertyPath] || 0
            }
        })

        if (Object.getOwnPropertyNames(newProjection).length == 0) {
            return null
        } else {
            return newProjection
        }
    }

    /**
     * transform ["author", "author.tag"] to { author: { tag: false }}
     * @param includes 
     */
    private transformIncludes(includes: string[]): IncludeOptions {
        let options: IncludeOptions = {};

        for (const include of includes) {
            let columns = include.split(".");
            let target = options;

            for (let i = 1; i <= columns.length; i++) {
                let column = columns[i - 1];
                if (i == columns.length) {
                    target[column] = false;
                } else {
                    if (target[column]) {
                        target = target[column] as IncludeOptions;
                    } else {
                        target = target[column] = {} as IncludeOptions;
                    }
                }
            }

        }

        return options;
    }

    private processIncludeInternal(repository: MongoRepository<any>, target: any, options: IncludeOptions): Promise<any> {
        //TODO: should cover more situations and better performance
        let tasks = Object.getOwnPropertyNames(options).map((columnName): Promise<any> => {
            let relatedToMetadata = repository.metadata.relatedToMetadata;

            if (relatedToMetadata == null || relatedToMetadata[columnName] == null) {
                return;
            }

            let relItems = target[columnName];
            if (relItems == null) {
                return;
            }

            let relType = relatedToMetadata[columnName];
            let relRepo = getMongoRepository(relType);

            let fetchSubInclude = async (ref: any): Promise<any> => {
                // includes sub-columns
                if (options[columnName]) {
                    await this.processIncludeInternal(relRepo, ref, options[columnName] as IncludeOptions);
                }

                return ref;
            }

            let fetchTask;
            if (relItems instanceof Array) {
                if (relItems.length == 0) {
                    return;
                }

                let ids = relItems.map((item) => item[relRepo.metadata.objectIdColumn.propertyName] || item._id);

                fetchTask = this.find(relRepo, { filter: { "_id": { "$in": ids } } }).then((result) => {
                    let refs = result.data;
                    if (refs.length == 0) {
                        return [];
                    } else {
                        return Promise.all(refs.map(fetchSubInclude)).then(() => {
                            return refs;
                        });
                    }
                });
            } else {
                let id = relItems[relRepo.metadata.objectIdColumn.propertyName] || relItems._id;

                fetchTask = this.findOne(relRepo, { filter: { "_id": id } }).then(fetchSubInclude);
            }

            return fetchTask.then(data => {
                target[columnName] = data;
            });
        });

        return Promise.all(tasks);
    }
}