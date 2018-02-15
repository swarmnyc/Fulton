import { IEntityService, IEntityRunner, OperationOneResult, OperationResult, OperationStatus, QueryParams, inject } from "../interfaces";
import { IUser, Type, injectable } from "../index";
import { Repository, MongoRepository, getRepository, getMongoRepository } from 'typeorm';

import { FultonApp } from "../fulton-app";
import FultonLog from "../fulton-log";
import { MongoEntityRunner } from "./runner/mongo-entity-runner";

@injectable()
export class EntityService<TEntity> implements IEntityService<TEntity> {
    @inject(FultonApp)
    protected app: FultonApp;
    protected mainRepository: Repository<TEntity>
    private _runner: IEntityRunner

    constructor(entity: Type<TEntity>)
    constructor(mainRepository: Repository<TEntity>)
    constructor(input: Repository<TEntity> | Type<TEntity>) {
        if (input instanceof Repository) {
            this.mainRepository = input
        } else {
            this.mainRepository = this.getRepository(input);
        }
    }

    protected get runner(): IEntityRunner {
        if (this._runner == null) {
            if (this.mainRepository instanceof MongoRepository) {
                this._runner = this.app.container.get(MongoEntityRunner);
            } else {
                //TODO: Sql Entity Runner
            }
        }

        return this._runner;
    }

    get currentUser(): IUser {
        return this.app.userService.currentUser;
    }

    protected getRepository<T>(entity: Type<T>, connectionName?: string): Repository<T> {
        return getRepository(entity, connectionName)
    }

    protected getMongoRepository<T>(entity: Type<T>, connectionName?: string): MongoRepository<T> {
        return getMongoRepository(entity, connectionName)
    }

    find(queryParams?: QueryParams): Promise<OperationResult<TEntity>> {
        return this.runner
            .find(this.mainRepository, queryParams)
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

    findOne(queryParams?: QueryParams): Promise<OperationOneResult<TEntity>> {
        return this.runner
            .findOne(this.mainRepository, queryParams)
            .then((data) => {
                return {
                    data: data
                }
            }).catch(this.errorHandler);
    }

    findById(id: any, queryParams?: QueryParams): Promise<OperationOneResult<TEntity>> {
        return this.runner
            .findById(this.mainRepository, id, queryParams)
            .then((data) => {
                return {
                    data: data
                }
            }).catch(this.errorHandler);
    }

    create(entity: TEntity): Promise<OperationOneResult<TEntity>> {
        //TODO: valid and remove extra data        
        return this.runner
            .create(this.mainRepository, entity)
            .then((newEntity) => {
                return {
                    data: newEntity
                }
            })
            .catch(this.errorHandler);
    }

    update(id: any, entity: TEntity): Promise<OperationStatus> {
        //TODO: valid and remove extra data
        return this.runner
            .update(this.mainRepository, id, entity)
            .then((newEntity) => {
                return {
                    status: 202
                }
            })
            .catch(this.errorHandler);
    }

    delete(id: any): Promise<OperationStatus> {
        return this.runner
            .delete(this.mainRepository, id)
            .then((newEntity) => {
                return {
                    status: 202
                }
            })
            .catch(this.errorHandler);
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
}