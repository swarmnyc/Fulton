import { FindResult, QueryParams, Type, UpdateQuery } from '../../types';
import { injectable } from '../../alias';

import { FultonError, FultonStackError } from "../../common";

import { ColumnMetadata } from "typeorm/metadata/ColumnMetadata";
import { EntityMetadata } from 'typeorm/metadata/EntityMetadata';
import { Helper } from '../../helpers';
import { Repository } from "typeorm";
import { fultonDebug } from '../../helpers/debug';
import { EmbeddedMetadata } from "typeorm/metadata/EmbeddedMetadata";

let nameChainReg = /^(.+?)\.(.*)$/
let funcReg = /^((?:num)|(?:int)|(?:date)|(?:bool)|(?:ObjectId))\((.+)\)$/

/** the real runner of entity service, it can be Mongo runner or Sql Runner */
@injectable()
export abstract class EntityRunner {
    entityMetadatas: Map<Type, EntityMetadata>;

    abstract updateIdMetadata<TEntity>(repository: Repository<TEntity>): void;

    find<TEntity>(repository: Repository<TEntity>, queryParams?: QueryParams): Promise<FindResult<TEntity>> {
        let error = this.adjustParams(repository.metadata, queryParams);
        if (error) {
            return Promise.reject(error);
        }

        fultonDebug("entity", "find on %s QueryParams:\n %O\t", repository.metadata.name, queryParams)

        return this.findCore(repository, queryParams)
    }


    findOne<TEntity>(repository: Repository<TEntity>, queryParams?: QueryParams): Promise<TEntity> {
        let error = this.adjustParams(repository.metadata, queryParams);
        if (error) {
            return Promise.reject(error);
        }

        fultonDebug("entity", "findOne on %s QueryParams:\n %O\t", repository.metadata.name, queryParams)

        return this.findOneCore(repository, queryParams)
    }

    count<TEntity>(repository: Repository<TEntity>, queryParams?: QueryParams): Promise<number> {
        let error = this.adjustParams(repository.metadata, queryParams);
        if (error) {
            return Promise.reject(error);
        }

        fultonDebug("entity", "count on %s QueryParams:\n %O\t", repository.metadata.name, queryParams)

        return repository.count(queryParams ? queryParams.filter : null)
    }

    create<TEntity>(repository: Repository<TEntity>, entity: TEntity): Promise<TEntity> {
        return this.createCore(repository, entity)
    }

    createMany<TEntity>(repository: Repository<TEntity>, entities: TEntity[]): Promise<TEntity[]> {
        return this.createManyCore(repository, entities)
    }

    update<TEntity>(repository: Repository<TEntity>, id: any, update: Partial<TEntity> | UpdateQuery<TEntity>): Promise<void> {
        id = this.convertId(repository.metadata, id);

        if (!id) {
            return Promise.reject(new FultonError("invalid id"));
        }

        return this.updateCore(repository, id, update);
    }

    updateMany<TEntity>(repository: Repository<TEntity>, filter: any, update: any): Promise<number> {
        let error = this.adjustParams(repository.metadata, { filter: filter, needAdjust: true });
        if (error) {
            return Promise.reject(error);
        }

        return this.updateManyCore(repository, filter, update);
    }

    delete<TEntity>(repository: Repository<TEntity>, id: any): Promise<void> {
        id = this.convertId(repository.metadata, id);

        if (!id) {
            return Promise.reject(new FultonError("invalid id"));
        }

        return this.deleteCore(repository, id)
    }

    deleteMany<TEntity>(repository: Repository<TEntity>, filter: any): Promise<number> {
        let error = this.adjustParams(repository.metadata, { filter: filter, needAdjust: true });
        if (error) {
            return Promise.reject(error);
        }

        return this.deleteManyCore(repository, filter);
    }

    /** 
     * adjust filter, because some properties are miss type QueryString is always string, but some params int or date
     */
    protected adjustParams<T>(metadata: EntityMetadata, params: QueryParams): FultonError {
        // only adjust if it needs
        if (params && params.needAdjust) {
            let errorTracker = new FultonStackError("invalid_query_parameters");

            if (params.filter) {
                errorTracker.push("filter");
                this.adjustFilter(metadata, params.filter, null, errorTracker);
                errorTracker.pop();
            }

            delete params.needAdjust;

            if (errorTracker.hasError()) {
                return errorTracker;
            }
        }
    }

    /** 
     * adjust filter, because some properties are miss type QueryString is always string, but some params int or date
     * support some mongo query operators https://docs.mongodb.com/manual/reference/operator/query/
     */
    adjustFilter<T>(metadata: EntityMetadata | EmbeddedMetadata, filter: any, targetColumn: ColumnMetadata, errorTracker: FultonStackError, level: number = 0): void {
        if (typeof filter != "object") {
            return;
        }

        Object.getOwnPropertyNames(filter).forEach((name) => {
            let value = filter[name];
            if (value == null) return;

            errorTracker.push(name);

            if (name.startsWith("$")) {
                // for operators
                switch (name) {
                    case "$regex": case "$where": case "$text": case "$like": case "$option": case "$expr":
                        // entity service do nothing, but runner might have
                        this.extendedAdjustFilter(filter, name, value, targetColumn, errorTracker);
                        break;
                    case "$or": case "$and": case "$not": case "$nor":
                        // { filter: { $or: [ object, object ]}}
                        if (value instanceof Array) {
                            errorTracker.forEach(value, (item) => {
                                this.adjustFilter(metadata, item, null, errorTracker);
                            });
                        }
                        break;
                    case "$elemMatch":
                        // { filter: { tags: { $elemMatch: object }}}
                        this.adjustFilter(metadata, value, null, errorTracker)
                        break;
                    case "$size": case "$minDistance": case "$maxDistance":
                        // { filter: { tags: { $size: number }}}
                        filter[name] = this.convertValue("number", value, errorTracker);
                        break;
                    case "$exists":
                        // { filter: { tags: { $exists: boolean }}}
                        filter[name] = this.convertValue("boolean", value, errorTracker);
                        break;
                    case "$all":
                        if (value instanceof Array && value.length > 0) {
                            if (typeof value[0] == "object") {
                                // { filter: { tags: { $all: [ object, object, object] }}}
                                // might not work because embedded document don't have metadata.
                                errorTracker.forEach(value, (item, i) => this.adjustFilter(metadata, item, targetColumn, errorTracker));
                            } else {
                                // { filter: { tags: { $all: [ value, value, value] }}}
                                filter[name] = errorTracker.map(value, (item) => this.convertValue(targetColumn, item, errorTracker));
                            }
                        }
                        break;
                    case "$in": case "$nin":
                        // { filter: { name: { $in: [ value, value, value] }}}
                        if (value instanceof Array) {
                            filter[name] = errorTracker.map(value, (item) => this.convertValue(targetColumn, item, errorTracker));
                        }
                        break;
                    case "$eq": case "$gt": case "$gte": case "$lt": case "$lte": case "$ne":
                        // { filter: { price: { $gte: value }}}
                        filter[name] = this.convertValue(targetColumn, value, errorTracker);
                        break;
                    case "$near": case "$nearSphere": case "$center": case "$centerSphere": case "$box": case "$polygon": case "$mod":
                        // { filter: { location : { $near : [ number, number ]}}}
                        // { filter: { location : { $box : [[ number, number ], [ number, number ]]}}}
                        let convert = (v: any): any => {
                            if (v instanceof Array) {
                                return errorTracker.map(v, convert);
                            } else {
                                return this.convertValue("number", v, errorTracker)
                            }
                        }

                        if (value instanceof Array) {
                            filter[name] = errorTracker.map(value, convert);
                        }
                        break;
                }
            } else {
                let originName = name
                let chainMatch = nameChainReg.exec(name)
                if (chainMatch) {
                    // "for name1.name2"
                    name = chainMatch[1]

                    value = {
                        [chainMatch[2]]: value
                    }
                }

                let embeddedMetadata: EmbeddedMetadata;

                if (metadata instanceof EntityMetadata) {
                    embeddedMetadata = metadata ? metadata.findEmbeddedWithPropertyPath(name) : null
                }

                if (embeddedMetadata) {
                    // for embedded object column
                    let targetMetadata = this.entityMetadatas.get(embeddedMetadata.type as Type) || embeddedMetadata;
                    if (targetMetadata) {
                        this.adjustFilter(targetMetadata, value, null, errorTracker, level + 1);

                        if (chainMatch) {
                            // rollback the update
                            filter[originName] = value[chainMatch[2]]
                        }
                    }
                } else {
                    // for normal column
                    let columnMetadata = this.getColumnMetadata(metadata, name);
                    if (columnMetadata) {
                        // { filter: { name: object }}
                        if (typeof value == "object") {
                            // skip non-literal object or array like bson.ObjectId, 
                            if (value.constructor.name == "Object" || value.constructor.name == "Array") {
                                let targetMetadata = metadata;
                                if (columnMetadata.relationMetadata) {
                                    // for sql relationships
                                    targetMetadata = columnMetadata.relationMetadata.inverseEntityMetadata;
                                    level = level + 1;
                                } else if (metadata instanceof EntityMetadata && metadata.relatedToMetadata[name]) {
                                    // for mongo relationships
                                    targetMetadata = this.entityMetadatas.get(metadata.relatedToMetadata[name]);
                                    columnMetadata = null;
                                    level = level + 1;
                                }

                                this.adjustFilter(targetMetadata, value, columnMetadata, errorTracker, level);

                                if (chainMatch) {
                                    // rollback the update
                                    filter[originName] = value[chainMatch[2]]
                                }
                            }
                        } else {
                            // { filter: { name: value }}
                            filter[originName] = this.convertValue(columnMetadata, value, errorTracker);
                        }

                        if (level == 0) {
                            // call runner in case it have to do some things
                            this.extendedAdjustFilter(filter, name, filter[name], columnMetadata, errorTracker);
                        }
                    } else if (typeof value == "object") {
                        // for embedded object, but cannot find the metadata
                        this.adjustFilter(null, value, null, errorTracker, level + 1);
                    } else if (typeof value == "string") {
                        // try to convert string
                        filter[originName] = this.convertValue(columnMetadata, value, errorTracker);
                    }
                }
            }

            errorTracker.pop();
        })
    }

    /** Convert Value base on the type or ColumnMetadata */
    convertValue(metadata: string | ColumnMetadata, value: any, errorTracker: FultonStackError): any {
        let newValue = value;
        let match;
        if (typeof value == "string" && (match = funcReg.exec(value))) {
            // functions like num(), date(), bool(), ObjectId()
            metadata = match[1].toLocaleLowerCase()
            value = match[2]
        }

        if (metadata != null && value != null) {
            let type;
            if (metadata instanceof ColumnMetadata) {
                type = metadata.type;
            } else {
                type = metadata;
            }

            if (typeof type == "string") type = type.toLocaleLowerCase()

            if (type == null) {
                // try use extended convertValue
                newValue = this.extendedConvertValue(metadata, value, errorTracker);
            } else if ((type == "number" || type == "num" || type == "int" || type == Number) && typeof value != "number") {
                newValue = parseFloat(value);
                if (isNaN(newValue)) {
                    if (errorTracker) {
                        errorTracker.add("number", `must be a number`, true);
                    }

                    newValue = null;
                }
            } else if ((type == "boolean" || type == "bool" || type == Boolean) && typeof value != "boolean") {
                newValue = Helper.getBoolean(value);

                if (newValue == null && errorTracker) {
                    errorTracker.add("boolean", `must be a boolean`, true);
                }
            } else if ((type == "date" || type == "datetime" || type == Date) && !(value instanceof Date)) {
                if (Helper.isNumberString(value)) {
                    newValue = new Date(parseFloat(value));
                } else {
                    newValue = new Date(value);
                }

                if (isNaN(newValue.valueOf())) {
                    if (errorTracker) {
                        errorTracker.add("date", `must be a date`, true);
                    }

                    newValue = null;
                }
            } else {
                // try use runner to convertValue
                newValue = this.extendedConvertValue(metadata, value, errorTracker);
            }
        }

        return newValue;
    }

    protected extendedAdjustFilter<T>(filter: any, name: string, value: string, targetColumn: ColumnMetadata, errorTracker: FultonStackError): void {
    }

    protected extendedConvertValue(metadata: string | ColumnMetadata, value: any, errorTracker: FultonStackError): any {
    }

    protected abstract findCore<TEntity>(repository: Repository<TEntity>, queryParams?: QueryParams): Promise<FindResult<TEntity>>

    protected abstract findOneCore<TEntity>(repository: Repository<TEntity>, queryParams?: QueryParams): Promise<TEntity>;

    protected abstract createCore<TEntity>(repository: Repository<TEntity>, entity: TEntity): Promise<TEntity>;

    protected abstract createManyCore<TEntity>(repository: Repository<TEntity>, entities: TEntity[]): Promise<TEntity[]>;

    protected abstract updateCore<TEntity>(repository: Repository<TEntity>, id: any, update: any): Promise<void>;

    protected abstract updateManyCore<TEntity>(repository: Repository<TEntity>, query: any, update: any): Promise<number>;

    protected abstract deleteCore<TEntity>(repository: Repository<TEntity>, id: any): Promise<void>;

    protected abstract deleteManyCore<TEntity>(repository: Repository<TEntity>, query: any): Promise<number>;

    protected getColumnMetadata(metadata: EntityMetadata | EmbeddedMetadata, name: string): ColumnMetadata {
        if (metadata && name) {
            if (metadata instanceof EntityMetadata) {
                if ((name == "id" || name == "_id")) {
                    return metadata.primaryColumns[0];
                } else {
                    return metadata.ownColumns.find((col) => col.propertyName == name);
                }
            } else {
                return metadata.columns.find((col) => col.propertyName == name);
            }
        }
    }

    /** 
     * convert id, because properties QueryString is always string, but id can be int or object id
     */
    protected convertId(em: EntityMetadata | Type, id: any): any {
        let metadata: EntityMetadata;

        if (em instanceof Function) {
            metadata = this.entityMetadatas.get(em);
        } else {
            metadata = em;
        }

        if (metadata.primaryColumns.length > 0) {
            return this.convertValue(metadata.primaryColumns[0], id, null);
        }

        return id;
    }
}