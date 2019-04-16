import { validate, ValidationError } from 'class-validator';
import * as lodash from 'lodash';
import { getMongoRepository, getRepository, MongoRepository, Repository } from 'typeorm';
import { ColumnMetadata } from 'typeorm/metadata/ColumnMetadata';
import { EntityMetadata } from 'typeorm/metadata/EntityMetadata';
import { injectable } from '../alias';
import { FultonError, FultonStackError } from '../common/fulton-error';
import { fultonDebug } from '../helpers/debug';
import { ICacheService, IEntityService, OperationManyResult, QueryParams, Type, UpdateQuery } from '../types';
import { DiKeys } from '../keys';
import { Service } from '../services';
import { EntityRunner } from './runner/entity-runner';

// the strategy of cache is caching all query result by query params and create and update and delete will mark dirty. 
// if dirty is true, the query will not use cached data.
export type QueryExecutor = () => Promise<any>

export class CacheServiceWrapper {
    isDirty: boolean = false
    constructor(public service: ICacheService, private entityType: Type) { }

    fetch(queryParams: QueryParams, operation: string, executor?: QueryExecutor): Promise<any> {
        if (this.service && queryParams && queryParams.cache) {
            let cacheKey = this.getCacheKey(operation, queryParams)

            if (this.isDirty) {
                this.isDirty = false
                return this.addCache(executor(), cacheKey, queryParams.cache)
            } else {
                return this.service.get(cacheKey).then((object) => {
                    fultonDebug("entity-cache", () => `fetch cache - ${this.service.namespace}:${cacheKey}:${object ? "found" : "not found"}`)

                    if (object) {
                        return this.convertObject(operation, object)
                    }

                    return this.addCache(executor(), cacheKey, queryParams.cache)
                })
            }
        } else {
            return executor()
        }
    }

    getCacheKey(type: string, queryParams: QueryParams): string {
        return type + ":" + JSON.stringify({
            filter: queryParams.filter,
            sort: queryParams.sort,
            select: queryParams.select,
            include: queryParams.include,
            includes: queryParams.includes,
            projection: queryParams.projection,
            pagination: queryParams.pagination
        })
    }

    addCache(promise: Promise<any>, key: string, maxAge: number | boolean): Promise<any> {
        promise.then((result) => {
            maxAge = (typeof maxAge == "boolean") ? null : maxAge

            fultonDebug("entity-cache", () => `add cache - ${this.service.namespace}:${key} for ${maxAge || "default"}`)

            this.service.set(key, result, maxAge)
        })

        return promise
    }

    private convertObject(operation: string, object: any): any {
        if (this.service.isTypeLost) {
            // memory cache doesn't lose type
            if (operation == "find") {
                if (object && object.data instanceof Array) {
                    object.data.forEach((item: any) => {
                        item.constructor = this.entityType
                    });
                }
            } else {
                object.constructor = this.entityType
            }
        }

        return object
    }
}

@injectable()
export class EntityService<TEntity> extends Service implements IEntityService<TEntity> {
    protected mainRepository: Repository<TEntity>
    protected runner: EntityRunner;
    protected cache: CacheServiceWrapper;

    constructor(entity: Type<TEntity>, connectionName?: string)
    constructor(mainRepository: Repository<TEntity>)
    constructor(input: Repository<TEntity> | Type<TEntity>, connectionName: string = "default") {
        super()

        if (input instanceof Repository) {
            this.mainRepository = input
        } else {
            this.mainRepository = this.getRepository(input, connectionName);
        }
    }

    onInit() {
        if (this.mainRepository instanceof MongoRepository) {
            this.runner = this.app.container.get(DiKeys.MongoEntityRunner);
            this.runner.entityMetadatas = this.app.entityMetadatas;
        } else {
            //TODO: Sql Entity Runner
        }

        this.cache = new CacheServiceWrapper(this.app.getCacheService(`EntityService:${this.entityType.name}`), this.entityType)
    }

    /**
     * validate the entity
     * @param entity 
     * @param type [optional] if the entity is plain object, then type is required
     */
    static validateEntity<T>(entity: T, type?: Type<T>): Promise<void> {
        if (type) entity.constructor = type

        return EntityService.validateCore(entity, new FultonStackError("invalid_input"))
    }

    validateEntity<T>(entity: T, type?: Type<T>): Promise<void> {
        return EntityService.validateEntity(entity, type)
    }

    get entityType(): Type {
        return this.mainRepository.target as Type;
    }

    protected getRepository<T>(entity: Type<T>, connectionName?: string): Repository<T> {
        return getRepository(entity, connectionName)
    }

    protected getMongoRepository<T>(entity: Type<T>, connectionName?: string): MongoRepository<T> {
        return getMongoRepository(entity, connectionName)
    }

    find(queryParams?: QueryParams): Promise<OperationManyResult<TEntity>> {
        if (queryParams && queryParams.needAdjust == null) {
            queryParams.needAdjust = true
        }

        return this.cache.fetch(queryParams, "find", () => {
            return this.runner
                .find(this.mainRepository, queryParams)
                .then((result) => {
                    let index = lodash.get(queryParams, "pagination.index") || 0
                    let size = lodash.get(queryParams, "pagination.size") || result.total
                    let total = result.total
                    let hasMore = total > (size * (index + 1))
                    return {
                        data: result.data,
                        pagination: {
                            total,
                            index,
                            size,
                            hasMore
                        }
                    }
                })
        })
    }

    findOne(queryParams?: QueryParams): Promise<TEntity> {
        if (queryParams && queryParams.needAdjust == null) {
            queryParams.needAdjust = true
        }

        return this.cache.fetch(queryParams, "findOne", () => {
            return this.runner.findOne(this.mainRepository, queryParams)
        })
    }

    findById(id: any, queryParams?: QueryParams): Promise<TEntity> {
        if (id == null) throw new FultonError("invalid_parameter", "id cannot be null")

        if (queryParams == null) {
            queryParams = {
                needAdjust: true
            }
        } else if (queryParams.needAdjust == null) {
            queryParams.needAdjust = true
        }

        queryParams.filter = {
            id: id
        }

        return this.cache.fetch(queryParams, "findOne", () => {
            return this.runner.findOne(this.mainRepository, queryParams)
        })
    }

    count(queryParams?: QueryParams): Promise<number> {
        return this.cache.fetch(queryParams, "count", () => {
            return this.runner.count(this.mainRepository, queryParams)
        })
    }

    create(input: TEntity | Partial<TEntity>): Promise<TEntity> {
        return this
            .convertAndVerifyEntity(this.mainRepository.metadata, input)
            .then((entity) => {
                this.cache.isDirty = true
                return this.runner.create(this.mainRepository, entity)
            })
    }

    createMany(input: Partial<TEntity>[]): Promise<TEntity[]> {
        let verify = input.map((item) => this.convertAndVerifyEntity(this.mainRepository.metadata, item))

        return Promise.all(verify).then((entities) => {
            this.cache.isDirty = true
            return this.runner.createMany(this.mainRepository, entities)
        })
    }

    update(id: any, input: Partial<TEntity> | UpdateQuery<TEntity>): Promise<void> {
        return this
            .convertAndVerifyEntity(this.mainRepository.metadata, input)
            .then((entity) => {
                this.cache.isDirty = true
                return this.runner.update(this.mainRepository, id, entity)
            })
    }

    updateMany(filter: any, input: Partial<TEntity> | UpdateQuery<TEntity>): Promise<number> {
        return this
            .convertAndVerifyEntity(this.mainRepository.metadata, input)
            .then((entity) => {
                this.cache.isDirty = true
                return this.runner.updateMany(this.mainRepository, filter, entity)
            })
    }

    delete(id: any): Promise<void> {
        this.cache.isDirty = true
        return this.runner.delete(this.mainRepository, id)
    }

    deleteMany(filter: any): Promise<number> {
        this.cache.isDirty = true
        return this.runner.deleteMany(this.mainRepository, filter)
    }

    updateIdMetadata() {
        this.runner.updateIdMetadata(this.mainRepository)
    }

    /** 
     * adjust entity, because some properties are miss type like date is string after JSON.parse
     */
    protected convertAndVerifyEntity(em: EntityMetadata | Type, input: any): Promise<any> {
        let metadata: EntityMetadata;
        let errorTracker = new FultonStackError("invalid_input");

        if (em instanceof Function) {
            metadata = this.app.entityMetadatas.get(em);
        } else {
            metadata = em;
        }

        let entity = this.convertEntity(metadata, input, errorTracker);

        if (errorTracker.hasError()) {
            return Promise.reject(errorTracker);
        }

        return EntityService.validateCore(entity, errorTracker);
    }

    private static validateCore(entity: any, errorTracker: FultonStackError): Promise<any> {
        return validate(entity, { skipMissingProperties: true })
            .then((errors) => {
                if (errors.length == 0) {
                    if (errorTracker.hasError()) {
                        return Promise.reject(errorTracker);
                    } else {
                        return entity;
                    }
                } else {
                    return Promise.reject(EntityService.convertValidationError(errorTracker, errors, null));
                }
            });
    }

    /** Convert Value base on the type or ColumnMetadata */
    protected convertValue(metadata: string | ColumnMetadata, value: any): any {
        return this.runner.convertValue(metadata, value, null);
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
                    entity[column.propertyName] = this.runner.convertValue(column, value, errorTracker);
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

        // add $operation back
        Object.getOwnPropertyNames(input).forEach((name) => {
            if (name.startsWith("$")) {
                entity[name] = input[name]
            }
        })

        return entity
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
                rel[keyColumn.propertyName] = this.runner.convertValue(keyColumn, input[keyColumn.propertyName], errorTracker);
            } else {
                errorTracker.add("undefined", `should not be null or undefined`, true)
            }

            errorTracker.pop();
        }

        return rel
    }

    /**
     * convert ValidationError from package class-validator to FultonError
     */
    private static convertValidationError(fultonError: FultonError, errors: ValidationError[], parent: string): FultonError {
        for (const error of errors) {
            let property = parent ? `${parent}.${error.property}` : error.property

            if (error.children && error.children.length > 0) {
                this.convertValidationError(fultonError, error.children, property);
            }

            if (error.constraints) {
                for (const key in error.constraints) {
                    fultonError.addDetail(property, key, error.constraints[key]);
                }
            }
        }

        return fultonError;
    }
}