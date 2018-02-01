import { FultonService, Injectable, IUser, OperationReault, QueryColumnStates, Type } from "../index";
import { MongoRepository, getMongoRepository } from "typeorm";
import { IEntityService, Inject, QueryParams, OperationOneReault, OperationStatus } from "../interfaces";
import { FultonApp } from "../fulton-app";
import { EntityMetadataHelper } from "../helpers/entity-metadata-helper";
import FultonLog from "../fulton-log";

@Injectable()
export class MongoEntityService<TEntity> implements IEntityService<TEntity> {
    @Inject(FultonApp)
    protected app: FultonApp;

    constructor(protected repository: MongoRepository<TEntity>) {
    }

    private get metadataHelper(): EntityMetadataHelper {
        return this.app["entityMetadataHelper"];
    }

    get currentUser(): IUser {
        return this.app.userService.currentUser;
    }

    protected getRepository<T>(entity: Type<T>, connectionName?: string): MongoRepository<T> {
        return getMongoRepository(entity, connectionName)
    }

    find(queryParams: QueryParams): Promise<OperationReault<TEntity>> {
        return this.findInternal(this.repository, queryParams);
    }

    findOne(queryParams: QueryParams): Promise<OperationOneReault<TEntity>> {
        return this.findOneInternal(this.repository, queryParams);
    }

    create(entity: TEntity): Promise<OperationOneReault<TEntity>> {
        return this.repository
            .insertOne(entity)
            .then((result) => {
                // TODO: should move this code to typeorm
                let e: any = entity;
                e[this.repository.metadata.objectIdColumn.propertyName] = e[this.repository.metadata.objectIdColumn.databaseName];
                delete e[this.repository.metadata.objectIdColumn.databaseName];

                return {
                    status: "ok",
                    data: entity
                }
            })
            .catch(this.errorHandler);
    }

    update(id: string, entity: TEntity, replace?: boolean): Promise<OperationStatus> {
        return this.repository
            .updateOne({ _id: id }, replace ? entity : { $set: entity })
            .then((result) => {
                return {
                    status: "ok"
                }
            })
            .catch(this.errorHandler);
    }

    delete(id: string): Promise<OperationStatus> {
        return this.repository
            .deleteOne({ _id: id })
            .then((result) => {
                return {
                    status: "ok"
                }
            })
            .catch(this.errorHandler);
    }

    /**
     * use provided repository to find entities
     * @param repository 
     * @param queryParams 
     */
    protected async findInternal<T>(repository: MongoRepository<T>, queryParams: QueryParams): Promise<OperationReault<T>> {
        try {
            this.transformQueryParams(repository, queryParams);

            let skip, take, index;

            if (queryParams.pagination) {
                index = queryParams.pagination.index || 0;
                take = queryParams.pagination.size;

                if (index && take) {
                    skip = index * take;
                }
            }

            // let select = this.transformSelect(queryParams);

            let data = await repository.findAndCount({
                where: queryParams.filter,
                skip: skip,
                take: take,
                order: queryParams.sort as any
            });

            if (queryParams.includes) {
                await this.processIncludes(data[0], queryParams.includes);
            }

            return {
                data: data[0],
                pagination: {
                    total: data[1],
                    index: index,
                    size: take
                }
            }
        } catch (error) {
            return this.errorHandler(error);
        }
    }

    /**
     * use provided repository to find one entity
     * @param repository 
     * @param queryParams 
     */
    protected async findOneInternal<T>(repository: MongoRepository<T>, queryParams: QueryParams): Promise<OperationOneReault<T>> {
        try {
            this.transformQueryParams(repository, queryParams);

            //let select = this.transformSelect(queryParams);

            let data = await repository.findOne({
                where: queryParams.filter,
                order: queryParams.sort as any
            });

            if (queryParams.includes) {
                await this.processIncludes(data, queryParams.includes);
            }

            return {
                data: data
            }
        } catch (error) {
            return this.errorHandler(error);
        }
    }

    protected processIncludes<T>(data: T | T[], columns: string[]): Promise<any> {
        // TODO: includes
        return;
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
        FultonLog.error("MongoEntityService operation failed", error);

        return {
            status: "error",
            errors: {
                "message": error.message
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
}