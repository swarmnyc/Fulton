import { validate, ValidationError } from 'class-validator';
import * as lodash from 'lodash';
import { getMongoRepository, getRepository, MongoRepository, Repository } from 'typeorm';
import { ColumnMetadata } from 'typeorm/metadata/ColumnMetadata';
import { EntityMetadata } from 'typeorm/metadata/EntityMetadata';
import { FultonError, FultonStackError } from '../common/fulton-error';
import { FultonLog } from '../fulton-log';
import { IUser } from '../identity';
import { IEntityService, OperationManyResult, OperationOneResult, OperationResult, QueryParams, Type, ICacheService } from '../interfaces';
import { DiKeys } from '../keys';
import { injectable } from '../re-export';
import { Service } from '../services';
import { EntityRunner } from './runner/entity-runner';

@injectable()
export class EntityService<TEntity> extends Service implements IEntityService<TEntity> {
    protected mainRepository: Repository<TEntity>
    protected runner: EntityRunner;
    protected cacheService: ICacheService;

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

        this.cacheService = this.app.getCacheService(this.mainRepository.target.toString())
    }

    get entityType(): Type {
        return this.mainRepository.target as Type;
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

    find(queryParams?: QueryParams): Promise<OperationManyResult<TEntity>> {
        if (queryParams && queryParams.needAdjust == null) {
            queryParams.needAdjust = true
        }

        return this.runner
            .find(this.mainRepository, queryParams)
            .then((result) => {
                return {
                    data: result.data,
                    pagination: {
                        total: result.total,
                        index: lodash.get(queryParams, "pagination.index") || 0,
                        size: lodash.get(queryParams, "pagination.size") || result.total
                    }
                }
            })
    }

    findOne(queryParams?: QueryParams): Promise<TEntity> {
        if (queryParams && queryParams.cache) {

        }

        if (queryParams && queryParams.needAdjust == null) {
            queryParams.needAdjust = true
        }

        return this.runner
            .findOne(this.mainRepository, queryParams)
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

        return this.runner
            .findOne(this.mainRepository, queryParams)
    }

    count(queryParams?: QueryParams): Promise<number> {
        return this.runner
            .count(this.mainRepository, queryParams)
    }

    create(input: TEntity | Partial<TEntity>): Promise<TEntity> {
        return this.convertAndVerifyEntity(this.mainRepository.metadata, input)
            .then((entity) => {
                return this.runner
                    .create(this.mainRepository, entity)
            })
    }

    update(id: any, input: TEntity | Partial<TEntity>): Promise<void> {
        return this
            .convertAndVerifyEntity(this.mainRepository.metadata, input)
            .then((entity) => {
                return this.runner
                    .update(this.mainRepository, id, entity)
            })
    }

    delete(id: any): Promise<void> {
        return this.runner
            .delete(this.mainRepository, id)
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

        return this.verifyEntity(entity, errorTracker);
    }

    private verifyEntity(entity: any, errorTracker: FultonStackError): Promise<any> {
        return validate(entity, { skipMissingProperties: true })
            .then((errors) => {
                if (errors.length == 0) {
                    if (errorTracker.hasError()) {
                        return Promise.reject(errorTracker);
                    } else {
                        return entity;
                    }
                } else {
                    return Promise.reject(this.convertValidationError(errorTracker, errors, null));
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
    private convertValidationError(fultonError: FultonError, errors: ValidationError[], parent: string): FultonError {
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