
import { MongoRepository, getMongoRepository, Repository } from "typeorm";
import { IEntityRunner, QueryParams, QueryColumnStates, injectable } from "../../interfaces";
import { Type } from "../../helpers";
import { repository } from '../repository-decorator';
import { ObjectId } from 'bson';

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
    async find<T>(repository: Repository<T>, queryParams: QueryParams = {}): Promise<[T[], number]> {
        let repo = (<any>repository as MongoRepository<T>);
        this.transformQueryParams(repo, queryParams);

        let skip;
        let size;
        if (queryParams.pagination) {
            size = queryParams.pagination.size;
            if (queryParams.pagination.index && queryParams.pagination.size) {
                skip = queryParams.pagination.index * size;
            }
        }

        // let select = this.transformSelect(queryParams);

        let data = await repo.findAndCount({
            where: queryParams.filter,
            skip: skip,
            take: size,
            order: queryParams.sort as any
        });

        if (data[0].length > 0 && queryParams.includes) {
            await this.processIncludes(repo, data[0], queryParams.includes);
        }

        return data;
    }

    /**
     * use provided repository to find one entity
     * @param repository 
     * @param queryParams 
     */
    async findOne<T>(repository: Repository<T>, queryParams: QueryParams = {}): Promise<T> {
        let repo = (<any>repository as MongoRepository<T>);
        this.transformQueryParams(repo, queryParams);

        //let select = this.transformSelect(queryParams);

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
        //let select = this.transformSelect(queryParams);
        if (repository.metadata.objectIdColumn.type == "number" ||
            repository.metadata.objectIdColumn.type == Number) {
            id = parseInt(id);
        }

        queryParams.filter = {
            id: id
        }

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
     * transform like change id to _id, change $like to {$regex, $options} 
     */
    protected transformQueryParams<T>(repository: MongoRepository<T>, queryParams: QueryParams): void {
        if (queryParams.filter) {
            this.transformFilter(repository, queryParams.filter);
        }

        // TODO: should move this code to typeorm
        let idName = repository.metadata.objectIdColumn.propertyName;
        let databaseName = repository.metadata.objectIdColumn.databaseName;
        if (queryParams.sort) {
            if (queryParams.sort[idName]) {
                queryParams.sort[databaseName] = queryParams.sort[idName];
                delete queryParams.sort[idName]
            } else if (queryParams.sort["id"]) {
                queryParams.sort[databaseName] = queryParams.sort["id"];
                delete queryParams.sort["id"]
            }
        }
    }

    /**
     * transform select to mongo projection
     * @param queryParams 
     */
    private transformSelect<T>(repository: MongoRepository<T>, queryParams: QueryParams): QueryColumnStates {
        // TODO: typeorm has bug on projection on mongodb
        return;
    }

    /**
     * transform like change id to _id, change $like to {$regex, $options} 
     */
    private transformFilter<T>(repository: MongoRepository<T>, target: any) {
        let idName = repository.metadata.objectIdColumn.propertyName;
        let databaseName = repository.metadata.objectIdColumn.databaseName;

        for (const name of Object.getOwnPropertyNames(target)) {
            let value = target[name];

            if (value instanceof ObjectId) {
                continue;
            }

            if (name == idName) {
                // TODO: should move this code to typeorm
                target[databaseName] = value;
                delete target[idName]
            } else if (name == "id") {
                target[databaseName] = value;
                delete target["id"]
            } else if (name == "$like") {
                target["$regex"] = value;
                target["$options"] = "i";
                delete target["$like"]
            } else if (typeof value == "object") {
                this.transformFilter(repository, value);
            }
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

                let ids = relItems.map((item) => item[relRepo.metadata.objectIdColumn.propertyName]);

                fetchTask = this.find(relRepo, { filter: { "_id": { "$in": ids } } }).then((result) => {
                    let refs = result[0];
                    if (refs.length == 0) {
                        return [];
                    } else {
                        return Promise.all(refs.map(fetchSubInclude)).then(() => {
                            return refs;
                        });
                    }
                });
            } else {
                let id = relItems[relRepo.metadata.objectIdColumn.propertyName];

                fetchTask = this.findOne(relRepo, { filter: { "_id": id } }).then(fetchSubInclude);
            }

            return fetchTask.then(data => {
                target[columnName] = data;
            });
        });

        return Promise.all(tasks);
    }
}