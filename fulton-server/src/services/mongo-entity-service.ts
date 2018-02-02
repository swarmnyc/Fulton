import { Service, injectable, IUser, OperationResult, QueryColumnStates, Type } from "../index";
import { MongoRepository, getMongoRepository } from "typeorm";
import { IEntityService, inject, QueryParams, OperationOneResult, OperationStatus } from "../interfaces";
import { FultonApp } from "../fulton-app";
import { EntityMetadataHelper } from "../helpers/entity-metadata-helper";
import FultonLog from "../fulton-log";

interface IncludeOptions {
    [key: string]: IncludeOptions | false
}

/**
 * A mongo implement for high level CURD, it contains many features that a pure MongoRepository doesn't have, like support Fulton.QueryParams, error handler, includes etc. 
 * 
 * two ways of extends
 * ## example 1: use default repository 
 * 
 * ```
 * @injectable()
 * class HotdogEntityService extends MongoEntityService<Hotdog>{
 *    constructor(){
 *        super(Hotdog) // just give a type, so it can find the repository.
 *    }
 * }
 * ```
 * 
 * ## example 2: use your HotdogRepository 
 * 
 * @Repo(Hotdog)
 * class HotdogRepository extends MongoRepository<Hotdog> {
 * }
 * 
 * // remember add HotdogRepository to options.repositories, so it can be injectable.
 * 
 * @injectable()
 * class HotdogEntityService extends MongoEntityService<Hotdog>{
 *    constructor(repository HotdogRepository) { 
 *        super(repository)
 *    }
 * }
 * 
 */
@injectable()
export class MongoEntityService<TEntity> implements IEntityService<TEntity> {
    @inject(FultonApp)
    protected app: FultonApp;
    protected mainRepository: MongoRepository<TEntity>

    constructor(entity: Type<TEntity>)
    constructor(mainRepository: MongoRepository<TEntity>)
    constructor(input: MongoRepository<TEntity> | Type<TEntity>) {
        if (input instanceof MongoRepository) {
            this.mainRepository = input
        } else {
            this.mainRepository = this.getRepository(input);
        }
    }

    get currentUser(): IUser {
        return this.app.userService.currentUser;
    }

    protected getRepository<T>(entity: Type<T>, connectionName?: string): MongoRepository<T> {
        return getMongoRepository(entity, connectionName)
    }

    find(queryParams: QueryParams): Promise<OperationResult<TEntity>> {
        return this.findInternal(this.mainRepository, queryParams)
            .then((data) => {
                return {
                    data: data[0],
                    pagination: {
                        total: data[1],
                        index: queryParams.pagination.index,
                        size: queryParams.pagination.size
                    }
                }
            }).catch(this.errorHandler);
    }

    findOne(queryParams: QueryParams): Promise<OperationOneResult<TEntity>> {
        return this.findOneInternal(this.mainRepository, queryParams)
            .then((data) => {
                return {
                    data: data
                }
            }).catch(this.errorHandler);
    }

    create(entity: TEntity): Promise<OperationOneResult<TEntity>> {
        //TODO: valid and remove extra data
        return this.mainRepository
            .insertOne(entity)
            .then((result) => {
                // TODO: should move this code to typeorm
                let e: any = entity;
                e[this.mainRepository.metadata.objectIdColumn.propertyName] = e[this.mainRepository.metadata.objectIdColumn.databaseName];
                delete e[this.mainRepository.metadata.objectIdColumn.databaseName];

                return {
                    data: entity
                }
            })
            .catch(this.errorHandler);
    }

    update(id: string, entity: TEntity, replace?: boolean): Promise<OperationStatus> {
        //TODO: valid and remove extra data
        return this.mainRepository
            .updateOne({ _id: id }, replace ? entity : { $set: entity })
            .then((result) => {
                return {
                    status: 202
                }
            })
            .catch(this.errorHandler);
    }

    delete(id: string): Promise<OperationStatus> {
        return this.mainRepository
            .deleteOne({ _id: id })
            .then((result) => {
                return {
                    status: 202
                }
            })
            .catch(this.errorHandler);
    }

    /**
     * use provided repository to find entities
     * @param repository 
     * @param queryParams 
     */
    protected async findInternal<T>(repository: MongoRepository<T>, queryParams: QueryParams): Promise<[T[], number]> {
        this.transformQueryParams(repository, queryParams);

        let skip;

        if (queryParams.pagination) {
            if (queryParams.pagination.index && queryParams.pagination.size) {
                skip = queryParams.pagination.index * queryParams.pagination.size;
            }
        }

        // let select = this.transformSelect(queryParams);

        let data = await repository.findAndCount({
            where: queryParams.filter,
            skip: skip,
            take: queryParams.pagination.size,
            order: queryParams.sort as any
        });

        if (data[0].length > 0 && queryParams.includes) {
            await this.processIncludes(repository, data[0], queryParams.includes);
        }

        return data;
    }

    /**
     * use provided repository to find one entity
     * @param repository 
     * @param queryParams 
     */
    protected async findOneInternal<T>(repository: MongoRepository<T>, queryParams: QueryParams): Promise<T> {
        this.transformQueryParams(repository, queryParams);

        //let select = this.transformSelect(queryParams);

        let data = await repository.findOne({
            where: queryParams.filter,
            order: queryParams.sort as any
        });

        if (data && queryParams.includes) {
            await this.processIncludes(repository, data, queryParams.includes);
        }

        return data
    }

    protected processIncludes<T>(repository: MongoRepository<T>, data: T | T[], includes: string[]): Promise<any> {
        let includeOptions = this.transformIncludes(includes);

        if (data instanceof Array) {
            let tasks = data.map((d) => {
                return this.processIncludeInternal(repository, d, includeOptions);
            })

            return Promise.all(tasks);
        } else {
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
    protected transformSelect<T>(repository: MongoRepository<T>, queryParams: QueryParams): QueryColumnStates {
        // TODO: typeorm has bug on prjection on mongodb
        return;
    }

    /**
     * handler operation fails
     * @param error 
     */
    protected errorHandler(error: any) {
        FultonLog.error("MongoEntityService operation failed with error:\n%O", error);

        return {
            errors: {
                "message": [error.message as string]
            }
        }
    }

    /**
     * transform like change id to _id, change $like to {$regex, $options} 
     */
    private transformFilter<T>(repository: MongoRepository<T>, target: any) {
        let idName = repository.metadata.objectIdColumn.propertyName;
        let databaseName = repository.metadata.objectIdColumn.databaseName;

        for (const name of Object.getOwnPropertyNames(target)) {
            let value = target[name];
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
        //TODO: should cover more situations and better proformance
        let tasks = Object.getOwnPropertyNames(options).map((columnName): Promise<any> => {
            let columnMetadata = repository.metadata.findRelationWithPropertyPath(columnName);

            if (columnMetadata == null) {
                return;
            }

            let refId = target[columnMetadata.inverseSidePropertyPath];
            if (refId == null) {
                return;
            }

            let columnRepo = this.getRepository(columnMetadata.type as Type);

            let exec = async (id: string): Promise<any> => {
                let ref = await this.findOneInternal(columnRepo, { filter: { "_id": refId } });

                // includes sub-columns
                if (options[columnName]) {
                    await this.processIncludeInternal(columnRepo, ref, options[columnName] as IncludeOptions);
                }

                return ref;
            }

            let execP;
            if (refId instanceof Array) {
                execP = Promise.all(refId.map(exec));
            } else {
                execP = exec(refId);
            }

            return execP.then(data => {
                target[columnName] = data;
            });
        });

        return Promise.all(tasks);
    }
}