import { FultonErrorObject, IEntityRunner, IEntityService, OperationOneResult, OperationResult, OperationStatus, QueryParams, inject } from '../interfaces';
import { IUser, Type, injectable } from "../index";
import { MongoRepository, Repository, getMongoRepository, getRepository } from 'typeorm';

import { ColumnMetadata } from 'typeorm/metadata/ColumnMetadata';
import { EntityMetadata } from 'typeorm/metadata/EntityMetadata';
import { FultonApp } from "../fulton-app";
import FultonLog from "../fulton-log";
import Helper from '../helpers/helper';
import { MongoEntityRunner } from "./runner/mongo-entity-runner";
import { entity } from '../re-export';

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
        this.adjustParams(this.mainRepository.metadata, queryParams);

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
            })
            .catch(this.errorHandler);
    }

    findOne(queryParams?: QueryParams): Promise<OperationOneResult<TEntity>> {
        return this.runner
            .findOne(this.mainRepository, queryParams)
            .then((data) => {
                return {
                    data: data
                }
            })
            .catch(this.errorHandler);
    }

    findById(id: any, queryParams?: QueryParams): Promise<OperationOneResult<TEntity>> {
        this.adjustParams(this.mainRepository.metadata, queryParams);

        id = this.convertId(this.mainRepository.metadata, id);

        return this.runner
            .findById(this.mainRepository, id, queryParams)
            .then((data) => {
                return {
                    data: data
                }
            })
            .catch(this.errorHandler);
    }

    create(entity: TEntity): Promise<OperationOneResult<TEntity>> {
        let error = this.adjustAndVerifyEntity(this.mainRepository.metadata, entity);
        if (error) {
            return Promise.reject(this.errorHandler(error));
        }

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
        let error = this.adjustAndVerifyEntity(this.mainRepository.metadata, entity);
        if (error) {
            return Promise.reject(this.errorHandler(error));
        }

        id = this.convertId(this.mainRepository.metadata, id);

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
        id = this.convertId(this.mainRepository.metadata, id);

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
     * convert id, because properties QueryString is always string, but id can be int or object id
     */
    protected convertId(em: EntityMetadata | Type, id: any): any {
        let metadata: EntityMetadata;

        if (em instanceof Function) {
            metadata = this.app.entityMetadatas.get(em);
        } else {
            metadata = em;
        }

        if (metadata.primaryColumns.length == 1) {
            // only supports the entity has one primary key.            
            return this.convertType(metadata.primaryColumns[0], id);
        }

        return id;
    }

    /** 
     * adjust filter, because some properties are miss type QueryString is always string, but some params int or date
     */
    protected adjustParams<T>(em: EntityMetadata | Type, params: QueryParams) {
        // only adjust if it needs
        if (params.needAdjust) {
            let metadata: EntityMetadata;

            if (em instanceof Function) {
                metadata = this.app.entityMetadatas.get(em);
            } else {
                metadata = em;
            }

            if (params.filter) {
                this.adjustFilter(metadata, params.filter, null);
            }

            delete params.needAdjust;
        }
    }

    private getPropertyType(metadata: EntityMetadata, name: string): any {
        if (name) {
            if (name == "id" && metadata.primaryColumns.length == 1) {
                return metadata.primaryColumns[0].type;
            } else {
                return metadata.columns.find((col) => col.propertyName == name || col.databaseName == name);
            }
        }
    }

    /** 
     * adjust filter, because some properties are miss type QueryString is always string, but some params int or date
     * support some mongo query operators https://docs.mongodb.com/manual/reference/operator/query/
     * not support embedded and related documents
     */
    private adjustFilter<T>(metadata: EntityMetadata, filter: any, parent: string) {
        if (typeof filter == "object") {
            for (const name of Object.getOwnPropertyNames(filter)) {
                let value = filter[name];

                if (name == "$or" || name == "$and" || name == "$not" || name == "$nor") {
                    // { filter: { $or: [ object, object ]}}
                    if (value instanceof Array) {
                        value.forEach((item) => this.adjustFilter(metadata, item, null));
                    }
                } else if (name == "$elemMatch") {
                    // { filter: { tags: { $elemMatch: object }}}
                    this.adjustFilter(metadata, value, null)
                } else {
                    if (name.startsWith("$")) {
                        if (parent == null) {
                            // these operators must have parent                        
                            continue;
                        }

                        if (["$regex", "$where", "$text", "$like", "$option", "$expr"].includes(name)) {
                            // do nothing
                        } else if (["$size", "$minDistance", "$maxDistance"].includes(name)) {
                            // { filter: { tags: { $size: number }}}
                            filter[parent][name] = this.convertType("number", value);
                            continue;
                        } else if (["$in", "$nin"].includes(name)) {
                            // { filter: { name: { $in: [ value, value, value] }}}
                            if (value instanceof Array) {
                                filter[parent][name] = value.map((item) => this.convertType(this.getPropertyType(metadata, parent), item));
                            }
                        } else if (["$eq", "$gt", "$gte", "$lt", "$lte", "$ne"].includes(name)) {
                            // { filter: { price: { $gte: value }}}
                            filter[parent][name] = this.convertType(this.getPropertyType(metadata, parent), value);
                        } else if (["$near", "$nearSphere", "$center", "$centerSphere", "$box", "$polygon", "$mod"].includes(name)) {
                            // { filter: { location : { $near : [ number, number ]}}}
                            // { filter: { location : { $box : [[ number, number ], [ number, number ]]}}}
                            let convert = (v: any): any => {
                                if (v instanceof Array) {
                                    return v.map(convert);
                                } else {
                                    return this.convertType("number", v)
                                }
                            }

                            if (value instanceof Array) {
                                filter[parent][name] = value.map(convert);
                            }
                        } else if (name == "$exists") {
                            // { filter: { tags: { $exists: boolean }}}
                            filter[parent][name] = this.convertType("boolean", value);
                        } else if (name == "$all") {
                            if (value instanceof Array && value.length > 0) {
                                if (typeof value[0] == "object") {
                                    // { filter: { tags: { $all: [ object, object, object] }}}
                                    value.forEach((item) => this.adjustFilter(metadata, item, null));
                                } else {
                                    // { filter: { tags: { $all: [ value, value, value] }}}
                                    filter[parent][name] = value.map((item) => this.convertType(this.getPropertyType(metadata, parent), item));
                                }
                            }
                        }
                    } else {
                        if (typeof value == "object") {
                            // { filter: { name: object }}
                            this.adjustFilter(metadata, value, name);
                        } else {
                            // { filter: { name: value }}
                            filter[name] = this.convertType(this.getPropertyType(metadata, name), value);
                        }
                    }
                }
            }
        }
    }

    /** 
     * adjust entity, because some properties are miss type like date is string after JSON.parse
     */
    protected adjustAndVerifyEntity(em: EntityMetadata | Type, entity: any): any {
        //TODO: valid and remove extra data


    }

    protected convertType(metadata: string | ColumnMetadata, value: any): any {
        if (metadata != null) {
            let type;
            if (metadata instanceof ColumnMetadata) {
                type = metadata.type;
            } else {
                type = metadata;
            }

            if ((type == "number" || type == Number) && typeof value != "number") {
                return parseFloat(value);
            }

            if ((type == "boolean" || type == Boolean) && typeof value != "boolean") {
                return Helper.getBoolean(value);
            }

            if ((type == "date" || type == "datetime" || type == Date) && !(value instanceof Date)) {
                if (Helper.isNumberString(value)) {

                }
                return (value);
            }
        }

        return value;
    }

    /**
     * handler operation fails
     * @param error 
     */
    protected errorHandler(error: any): OperationResult & OperationOneResult {
        FultonLog.error("MongoEntityService operation failed with error:\n", error);

        return {
            errors: {
                "message": [error.message as string]
            }
        }
    }
}