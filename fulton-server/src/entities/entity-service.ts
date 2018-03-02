import * as lodash from 'lodash';

import { DiKeys, FultonErrorObject, IEntityRunner, IEntityService, OperationOneResult, OperationResult, OperationStatus, QueryParams, Type, entity, inject, injectable } from '../interfaces';
import { FultonError, FultonStackError } from '../common/fulton-error';
import { MongoRepository, Repository, getMongoRepository, getRepository } from 'typeorm';
import { ValidationError, validate } from "class-validator";

import { ColumnMetadata } from 'typeorm/metadata/ColumnMetadata';
import { EmbeddedMetadata } from 'typeorm/metadata/EmbeddedMetadata';
import { EntityMetadata } from 'typeorm/metadata/EntityMetadata';
import { FultonLog } from "../fulton-log";
import { Helper } from '../helpers/helper';
import { IFultonApp } from "../fulton-app";
import { IUser } from '../identity';
import { MongoEntityRunner } from "./runner/mongo-entity-runner";

@injectable()
export class EntityService<TEntity> implements IEntityService<TEntity> {
    @inject(DiKeys.FultonApp)
    protected app: IFultonApp;
    protected mainRepository: Repository<TEntity>
    private _runner: IEntityRunner;

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
                this._runner = this.app.container.get(DiKeys.MongoEntityRunner);
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
        let errors = this.adjustParams(this.mainRepository.metadata, queryParams);
        if (errors) {
            return Promise.resolve(errors);
        }

        return this.runner
            .find(this.mainRepository, queryParams)
            .then((result) => {
                return {
                    data: result.data,
                    pagination: {
                        total: result.total,
                        index: lodash.get(queryParams, "pagination.index") || 0,
                        size: lodash.get(queryParams, "pagination.index") || result.total
                    }
                }
            })
            .catch(this.errorHandler);
    }

    findOne(queryParams?: QueryParams): Promise<OperationOneResult<TEntity>> {
        let errors = this.adjustParams(this.mainRepository.metadata, queryParams);
        if (errors) {
            return Promise.resolve(errors);
        }

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
        let errors = this.adjustParams(this.mainRepository.metadata, queryParams);
        if (errors) {
            return Promise.resolve(errors);
        }

        id = this.convertId(this.mainRepository.metadata, id);

        if (!id) {
            return Promise.resolve(new FultonError("invalid id"));
        }

        return this.runner
            .findById(this.mainRepository, id, queryParams)
            .then((data) => {
                return {
                    data: data
                }
            })
            .catch(this.errorHandler);
    }

    create(input: TEntity): Promise<OperationOneResult<TEntity>> {
        return this.convertAndVerifyEntity(this.mainRepository.metadata, input)
            .then((entity) => {
                return this.runner
                    .create(this.mainRepository, entity)
                    .then((newEntity) => {
                        return {
                            data: newEntity
                        }
                    })
            })
            .catch(this.errorHandler);
    }

    update(id: any, input: TEntity): Promise<OperationStatus> {
        id = this.convertId(this.mainRepository.metadata, id);

        if (!id) {
            return Promise.resolve(new FultonError("invalid id"));
        }

        return this
            .convertAndVerifyEntity(this.mainRepository.metadata, input)
            .then((entity) => {
                return this.runner
                    .update(this.mainRepository, id, entity)
                    .then((newEntity) => {
                        return { status: 202 }
                    })
            })
            .catch(this.errorHandler);
    }

    delete(id: any): Promise<OperationStatus> {
        id = this.convertId(this.mainRepository.metadata, id);

        if (!id) {
            return Promise.resolve(new FultonError("invalid id"));
        }

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

        if (metadata.primaryColumns.length > 0) {
            return this.convertValue(metadata.primaryColumns[0], id);
        }

        return id;
    }

    /** 
     * adjust filter, because some properties are miss type QueryString is always string, but some params int or date
     */
    protected adjustParams<T>(em: EntityMetadata | Type, params: QueryParams): FultonError {
        // only adjust if it needs
        if (params && params.needAdjust) {
            let errorTracker = new FultonStackError("invalid query parameters");
            let metadata: EntityMetadata;

            if (em instanceof Function) {
                metadata = this.app.entityMetadatas.get(em);
            } else {
                metadata = em;
            }

            if (params.filter) {
                errorTracker.push("filter");
                this.adjustFilter(metadata, params.filter, null, errorTracker);
                errorTracker.pop();
            }

            delete params.needAdjust;

            if (errorTracker.hasErrors()) {
                return errorTracker;
            }
        }
    }

    /** 
     * adjust entity, because some properties are miss type like date is string after JSON.parse
     */
    protected convertAndVerifyEntity(em: EntityMetadata | Type, input: any): Promise<any> {
        let metadata: EntityMetadata;
        let errorTracker = new FultonStackError("invalid input");

        if (em instanceof Function) {
            metadata = this.app.entityMetadatas.get(em);
        } else {
            metadata = em;
        }

        let entity = this.convertEntity(metadata, input, errorTracker);

        if (errorTracker.hasErrors()) {
            return Promise.reject(errorTracker);
        }

        return this.verifyEntity(entity, errorTracker);
    }

    private verifyEntity(entity: any, errorTracker: FultonStackError): Promise<any> {
        return validate(entity, { skipMissingProperties: true })
            .then((errors) => {
                if (errors.length == 0) {
                    if (errorTracker.hasErrors()) {
                        return Promise.reject(errorTracker);
                    } else {
                        return entity;
                    }
                } else {
                    return Promise.reject(this.convertValidationError(errorTracker, errors, null));
                }
            });
    }

    protected convertValue(metadata: string | ColumnMetadata, value: any): any {
        return this.convertValueCore(metadata, value, null);
    }

    /**
     * handler operation fails
     * @param error 
     */
    protected errorHandler(error: any): OperationResult & OperationOneResult {
        FultonLog.warn("EntityService operation failed with error:\n", error);

        if (error instanceof FultonError) {
            return error
        } else {
            return {
                errors: {
                    message: error.message
                }
            }
        }
    }

    private getColumnMetadata(metadata: EntityMetadata, name: string): ColumnMetadata {
        if (name) {
            if ((name == "id" || name == "_id")) {
                return metadata.primaryColumns[0];
            } else {
                return metadata.ownColumns.find((col) => col.propertyName == name);
            }
        }
    }

    /** 
     * adjust filter, because some properties are miss type QueryString is always string, but some params int or date
     * support some mongo query operators https://docs.mongodb.com/manual/reference/operator/query/
     */
    private adjustFilter<T>(metadata: EntityMetadata, filter: any, targetColumn: ColumnMetadata, errorTracker: FultonStackError, level: number = 0): void {
        if (typeof filter != "object") {
            return;
        }

        for (const name of Object.getOwnPropertyNames(filter)) {
            let value = filter[name];
            if (value == null) {
                continue;
            }

            errorTracker.push(name);

            if (["$regex", "$where", "$text", "$like", "$option", "$expr"].includes(name)) {
                // entity service do nothing, but runner might have
                this.runner.adjustFilter(filter, name, value, targetColumn, errorTracker);
            } else if (name == "$or" || name == "$and" || name == "$not" || name == "$nor") {
                // { filter: { $or: [ object, object ]}}
                if (value instanceof Array) {
                    errorTracker.forEach(value, (item) => {
                        this.adjustFilter(metadata, item, null, errorTracker);
                    });
                }
            } else if (name == "$elemMatch") {
                // { filter: { tags: { $elemMatch: object }}}
                this.adjustFilter(metadata, value, null, errorTracker)
            } else if (["$size", "$minDistance", "$maxDistance"].includes(name)) {
                // { filter: { tags: { $size: number }}}
                filter[name] = this.convertValueCore("number", value, errorTracker);
            } else if (name == "$exists") {
                // { filter: { tags: { $exists: boolean }}}
                filter[name] = this.convertValueCore("boolean", value, errorTracker);
            } else if (name == "$all") {
                if (value instanceof Array && value.length > 0) {
                    if (typeof value[0] == "object") {
                        // { filter: { tags: { $all: [ object, object, object] }}}
                        // might not work because embedded document don't have metadata.
                        errorTracker.forEach(value, (item, i) => this.adjustFilter(metadata, item, targetColumn, errorTracker));
                    } else {
                        // { filter: { tags: { $all: [ value, value, value] }}}
                        filter[name] = errorTracker.map(value, (item) => this.convertValueCore(targetColumn, item, errorTracker));
                    }
                }
            } else if (["$in", "$nin"].includes(name)) {
                // { filter: { name: { $in: [ value, value, value] }}}
                if (value instanceof Array) {
                    filter[name] = errorTracker.map(value, (item) => this.convertValueCore(targetColumn, item, errorTracker));
                }
            } else if (["$eq", "$gt", "$gte", "$lt", "$lte", "$ne"].includes(name)) {
                // { filter: { price: { $gte: value }}}
                filter[name] = this.convertValueCore(targetColumn, value, errorTracker);
            } else if (["$near", "$nearSphere", "$center", "$centerSphere", "$box", "$polygon", "$mod"].includes(name)) {
                // { filter: { location : { $near : [ number, number ]}}}
                // { filter: { location : { $box : [[ number, number ], [ number, number ]]}}}
                let convert = (v: any): any => {
                    if (v instanceof Array) {
                        return errorTracker.map(v, convert);
                    } else {
                        return this.convertValueCore("number", v, errorTracker)
                    }
                }

                if (value instanceof Array) {
                    filter[name] = errorTracker.map(value, convert);
                }
            } else {
                let embeddedMetadata = metadata.findEmbeddedWithPropertyPath(name);

                if (embeddedMetadata) {
                    let targetMetadata = this.app.entityMetadatas.get(embeddedMetadata.type as Type);
                    if (targetMetadata) {
                        this.adjustFilter(targetMetadata, value, null, errorTracker);
                    }
                } else {
                    let columnMetadata = this.getColumnMetadata(metadata, name);
                    if (columnMetadata) {
                        // { filter: { name: object }}
                        if (typeof value == "object") {
                            let targetMetadata = metadata;
                            if (columnMetadata.relationMetadata) {
                                // for sql relationships
                                targetMetadata = columnMetadata.relationMetadata.inverseEntityMetadata;
                                level = level + 1;
                            } else if (metadata.relatedToMetadata[name]) {
                                // for mongo relationships
                                targetMetadata = this.app.entityMetadatas.get(metadata.relatedToMetadata[name]);
                                columnMetadata = null;
                                level = level + 1;
                            }

                            this.adjustFilter(targetMetadata, value, columnMetadata, errorTracker, level);
                        } else {
                            // { filter: { name: value }}
                            filter[name] = this.convertValueCore(columnMetadata, value, errorTracker);
                        }

                        if (level == 0) {
                            // call runner in case it have to do some things
                            this.runner.adjustFilter(filter, name, filter[name], columnMetadata, errorTracker);
                        }
                    }
                }
            }

            errorTracker.pop();
        }
    }

    private convertEntity(metadata: EntityMetadata, input: any, errorTracker: FultonStackError): any {
        let entity: any = new (metadata.target as Type)();

        for (const column of metadata.ownColumns) {
            let value = input[column.propertyName];

            if (value != null) {
                errorTracker.push(column.propertyName);

                if (metadata.relatedToMetadata[column.propertyName]) {
                    // related to property, only id
                    let relatedMetadata = this.app.entityMetadatas.get(metadata.relatedToMetadata[column.propertyName]);

                    if (column.isArray) {
                        entity[column.propertyName] = errorTracker.map(value, (rel, i) => {
                            return this.pickId(relatedMetadata, rel, errorTracker);
                        });
                    } else {
                        entity[column.propertyName] = this.pickId(relatedMetadata, value, errorTracker);
                    }
                } else {
                    entity[column.propertyName] = this.convertValueCore(column, value, errorTracker);
                }

                errorTracker.pop();
            }
        }

        // process embedded document
        for (const embeddedMetadata of metadata.embeddeds) {
            let value = input[embeddedMetadata.propertyName];

            if (value == null) {
                continue;
            }

            // if cannot find the type, do nothing.
            let targetMetadata = this.app.entityMetadatas.get(embeddedMetadata.type as Type);
            if (targetMetadata) {
                errorTracker.push(embeddedMetadata.propertyName);
                if (embeddedMetadata.isArray) {
                    entity[embeddedMetadata.propertyName] = errorTracker.map(value, (rel, i) => {
                        return this.convertEntity(targetMetadata, rel, errorTracker);
                    });
                } else {
                    entity[embeddedMetadata.propertyName] = this.convertEntity(targetMetadata, value, errorTracker);
                }

                errorTracker.pop();
            }
        }

        return entity
    }

    private convertValueCore(metadata: string | ColumnMetadata, value: any, errorTracker: FultonStackError): any {
        let newValue = value;
        if (metadata != null && value != null) {
            let type;
            if (metadata instanceof ColumnMetadata) {
                type = metadata.type;
            } else {
                type = metadata;
            }

            if (type == null) {
                // try use runner to convertValue
                newValue = this.runner.convertValue(metadata, value, errorTracker);
            } else if ((type == "number" || type == Number) && typeof value != "number") {
                newValue = parseFloat(value);
                if (isNaN(newValue)) {
                    if (errorTracker) {
                        errorTracker.add(`must be a number`, true);
                    }

                    newValue = null;
                }
            } else if ((type == "boolean" || type == Boolean) && typeof value != "boolean") {
                newValue = Helper.getBoolean(value);

                if (newValue == null && errorTracker) {
                    errorTracker.add(`must be a boolean`, true);
                }
            } else if ((type == "date" || type == "datetime" || type == Date) && !(value instanceof Date)) {
                if (Helper.isNumberString(value)) {
                    newValue = new Date(parseFloat(value));
                } else {
                    newValue = new Date(value);
                }

                if (isNaN(newValue.valueOf())) {
                    if (errorTracker) {
                        errorTracker.add(`must be a date`, true);
                    }

                    newValue = null;
                }
            } else {
                // try use runner to convertValue
                newValue = this.runner.convertValue(metadata, value, errorTracker);
            }

        }

        return newValue;
    }

    private pickId(metadata: EntityMetadata, input: any, errorTracker: FultonStackError): any {
        let rel: any = {};

        for (const keyColumn of metadata.primaryColumns) {
            if (keyColumn.embeddedMetadata) {
                continue;
            }

            errorTracker.push(keyColumn.propertyName);

            let id = input[keyColumn.propertyName] || input[keyColumn.databaseName];
            if (id) {
                rel[keyColumn.propertyName] = this.convertValueCore(keyColumn, input[keyColumn.propertyName], errorTracker);
            } else {
                errorTracker.add(`should not be null or undefined`, true)
            }

            errorTracker.pop();
        }

        return rel
    }

    /**
     * convert ValidationError from package class-validator to FultonError
     */
    private convertValidationError(fultonError: FultonError, errors: ValidationError[], parent: string): FultonError {
        for (const error of errors) {
            let property = parent ? `${parent}.${error.property}` : error.property

            if (error.children && error.children.length > 0) {
                this.convertValidationError(fultonError, error.children, property);
            }

            if (error.constraints) {
                fultonError.addErrors(property, error.constraints);
            }
        }

        return fultonError;
    }
}