import { FultonErrorObject, IEntityRunner, IEntityService, OperationOneResult, OperationResult, OperationStatus, QueryParams, Type, entity, inject, injectable } from '../interfaces';
import { MongoRepository, Repository, getMongoRepository, getRepository } from 'typeorm';

import { ColumnMetadata } from 'typeorm/metadata/ColumnMetadata';
import { EntityMetadata } from 'typeorm/metadata/EntityMetadata';
import { FultonError } from '../common/fulton-error';
import FultonLog from "../fulton-log";
import Helper from '../helpers/helper';
import { IFultonApp } from "../fulton-app";
import { IUser } from '../identity';
import { MongoEntityRunner } from "./runner/mongo-entity-runner";

@injectable()
export class EntityService<TEntity> implements IEntityService<TEntity> {
    @inject("FultonApp")
    protected app: IFultonApp;
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

    private getColumnMetadata(metadata: EntityMetadata, name: string): ColumnMetadata {
        if (name) {
            if ((name == "id" || name == "_id") && metadata.primaryColumns.length == 1) {
                return metadata.primaryColumns[0];
            } else {
                return metadata.columns.find((col) => col.propertyPath == name);
            }
        }
    }

    /** 
     * adjust filter, because some properties are miss type QueryString is always string, but some params int or date
     * support some mongo query operators https://docs.mongodb.com/manual/reference/operator/query/
     */
    private adjustFilter<T>(metadata: EntityMetadata, filter: any, targetColumn: ColumnMetadata) {
        //TODO: make adjustFilter to support embedded objects
        try {
            if (typeof filter == "object") {
                for (const name of Object.getOwnPropertyNames(filter)) {
                    let value = filter[name];

                    if (["$regex", "$where", "$text", "$like", "$option", "$expr"].includes(name)) {
                        // do nothing
                    } else if (name == "$or" || name == "$and" || name == "$not" || name == "$nor") {
                        // { filter: { $or: [ object, object ]}}
                        if (value instanceof Array) {
                            value.forEach((item) => this.adjustFilter(metadata, item, null));
                        }
                    } else if (name == "$elemMatch") {
                        // { filter: { tags: { $elemMatch: object }}}
                        this.adjustFilter(metadata, value, null)
                    } else if (["$size", "$minDistance", "$maxDistance"].includes(name)) {
                        // { filter: { tags: { $size: number }}}
                        filter[name] = this.convertType("number", value);
                        continue;
                    } else if (name == "$exists") {
                        // { filter: { tags: { $exists: boolean }}}
                        filter[name] = this.convertType("boolean", value);
                    } else if (name == "$all") {
                        if (value instanceof Array && value.length > 0) {
                            if (typeof value[0] == "object") {
                                // { filter: { tags: { $all: [ object, object, object] }}}
                                // might not work because embedded document don't have metadata.
                                value.forEach((item) => this.adjustFilter(metadata, item, targetColumn));
                            } else {
                                // { filter: { tags: { $all: [ value, value, value] }}}
                                filter[name] = value.map((item) => this.convertType(targetColumn, item));
                            }
                        }
                    } else if (["$in", "$nin"].includes(name)) {
                        // { filter: { name: { $in: [ value, value, value] }}}
                        if (value instanceof Array) {
                            filter[name] = value.map((item) => this.convertType(targetColumn, item));
                        }
                    } else if (["$eq", "$gt", "$gte", "$lt", "$lte", "$ne"].includes(name)) {
                        // { filter: { price: { $gte: value }}}
                        filter[name] = this.convertType(targetColumn, value);
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
                            filter[name] = value.map(convert);
                        }
                    } else {
                        let columnMetadata = this.getColumnMetadata(metadata, name);
                        if (columnMetadata) {
                            // { filter: { name: object }}
                            if (typeof value == "object") {
                                let targetMetadata = metadata;
                                if (columnMetadata.relationMetadata) {
                                    targetMetadata = columnMetadata.relationMetadata.inverseEntityMetadata;
                                } else if (metadata.relatedToMetadata[name]) {
                                    targetMetadata = this.app.entityMetadatas.get(metadata.relatedToMetadata[name]);
                                    columnMetadata = null;
                                }

                                this.adjustFilter(targetMetadata, value, columnMetadata);
                            } else {
                                // { filter: { name: value }}
                                filter[name] = this.convertType(columnMetadata, value);
                            }
                        }
                    }
                }
            }
        } catch (error) {
            throw new FultonError({ message: ["invalid query parameters", error.message] });
        }
    }

    /** 
     * adjust entity, because some properties are miss type like date is string after JSON.parse
     */
    protected adjustAndVerifyEntity(em: EntityMetadata | Type, entity: any): any {
        //TODO: valid and remove extra data
    }

    protected convertType(metadata: string | ColumnMetadata, value: any): any {
        if (metadata != null && value != null) {
            let type;
            if (metadata instanceof ColumnMetadata) {
                type = metadata.type;

                if (!type && metadata.isObjectId) {
                    type = "ObjectId";
                }
            } else {
                type = metadata;
            }

            if (type == null) {
                return value;
            }

            if ((type == "number" || type == Number) && typeof value != "number") {
                return parseFloat(value);
            }

            if ((type == "boolean" || type == Boolean) && typeof value != "boolean") {
                return Helper.getBoolean(value);
            }

            if ((type == "date" || type == "datetime" || type == Date) && !(value instanceof Date)) {
                if (Helper.isNumberString(value)) {
                    return new Date(parseFloat(value));
                } else {
                    return new Date(value);
                }
            }

            if (type == "ObjectId" && value.constructor.name != "ObjectID") {
                // EntityService is for sql and mongo, this writing is find without mongodb installed
                return new (require('bson').ObjectId)(value);
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