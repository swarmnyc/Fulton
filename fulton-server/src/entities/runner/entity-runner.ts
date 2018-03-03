import { FindResult, QueryParams, Type, injectable } from '../../interfaces';
import { FultonError, FultonStackError } from "../../common";

import { ColumnMetadata } from "typeorm/metadata/ColumnMetadata";
import { EntityMetadata } from 'typeorm/metadata/EntityMetadata';
import { Helper } from '../../helpers';
import { Repository } from "typeorm";

let funcReg = /^((?:num)|(?:int)|(?:date)|(?:bool)|(?:ObjectId))\((.+)\)$/

/** the real runner of entity service, it can be Mongo runner or Sql Runner */
@injectable()
export abstract class EntityRunner {
    entityMetadatas: Map<Type, EntityMetadata>;

    find<TEntity>(repository: Repository<TEntity>, queryParams?: QueryParams): Promise<FindResult<TEntity>> {
        let errors = this.adjustParams(repository.metadata, queryParams);
        if (errors) {
            return Promise.reject(errors);
        }

        return this.findCore(repository, queryParams)
    }


    findOne<TEntity>(repository: Repository<TEntity>, queryParams?: QueryParams): Promise<TEntity> {
        let errors = this.adjustParams(repository.metadata, queryParams);
        if (errors) {
            return Promise.reject(errors);
        }

        return this.findOneCore(repository, queryParams)
    }

    create<TEntity>(repository: Repository<TEntity>, entity: TEntity): Promise<TEntity> {
        return this.createCore(repository, entity)
    }

    update<TEntity>(repository: Repository<TEntity>, id: any, entity: TEntity): Promise<void> {
        id = this.convertId(repository.metadata, id);

        if (!id) {
            return Promise.reject(new FultonError("invalid id"));
        }

        return this.updateCore(repository, id, entity);
    }

    delete<TEntity>(repository: Repository<TEntity>, id: any): Promise<void> {
        id = this.convertId(repository.metadata, id);

        if (!id) {
            return Promise.reject(new FultonError("invalid id"));
        }

        return this.deleteCore(repository, id)
    }

    /** 
     * adjust filter, because some properties are miss type QueryString is always string, but some params int or date
     */
    protected adjustParams<T>(metadata: EntityMetadata, params: QueryParams): FultonError {
        // only adjust if it needs
        if (params && params.needAdjust) {
            let errorTracker = new FultonStackError("invalid query parameters");

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
     * adjust filter, because some properties are miss type QueryString is always string, but some params int or date
     * support some mongo query operators https://docs.mongodb.com/manual/reference/operator/query/
     */
    adjustFilter<T>(metadata: EntityMetadata, filter: any, targetColumn: ColumnMetadata, errorTracker: FultonStackError, level: number = 0): void {
        if (typeof filter != "object") {
            return;
        }

        for (const name of Object.getOwnPropertyNames(filter)) {
            let value = filter[name];
            if (value == null) {
                continue;
            }

            errorTracker.push(name);

            let match;
            if (typeof value == "string" && (match = funcReg.exec(value))) {
                // functions like num(), date(), bool(), ObjectId()
                let type = match[1].toLocaleLowerCase()
                let val = match[2]

                filter[name] = this.convertValue(type, val, errorTracker);
            } else if (["$regex", "$where", "$text", "$like", "$option", "$expr"].includes(name)) {
                // entity service do nothing, but runner might have
                this.extendedAdjustFilter(filter, name, value, targetColumn, errorTracker);
            } else if (["$or", "$and", "$not", "$nor"].includes(name)) {
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
                filter[name] = this.convertValue("number", value, errorTracker);
            } else if (name == "$exists") {
                // { filter: { tags: { $exists: boolean }}}
                filter[name] = this.convertValue("boolean", value, errorTracker);
            } else if (name == "$all") {
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
            } else if (["$in", "$nin"].includes(name)) {
                // { filter: { name: { $in: [ value, value, value] }}}
                if (value instanceof Array) {
                    filter[name] = errorTracker.map(value, (item) => this.convertValue(targetColumn, item, errorTracker));
                }
            } else if (["$eq", "$gt", "$gte", "$lt", "$lte", "$ne"].includes(name)) {
                // { filter: { price: { $gte: value }}}
                filter[name] = this.convertValue(targetColumn, value, errorTracker);
            } else if (["$near", "$nearSphere", "$center", "$centerSphere", "$box", "$polygon", "$mod"].includes(name)) {
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
            } else {
                let embeddedMetadata = metadata ? metadata.findEmbeddedWithPropertyPath(name) : null;

                if (embeddedMetadata) {
                    let targetMetadata = this.entityMetadatas.get(embeddedMetadata.type as Type);
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
                                targetMetadata = this.entityMetadatas.get(metadata.relatedToMetadata[name]);
                                columnMetadata = null;
                                level = level + 1;
                            }

                            this.adjustFilter(targetMetadata, value, columnMetadata, errorTracker, level);
                        } else {
                            // { filter: { name: value }}
                            filter[name] = this.convertValue(columnMetadata, value, errorTracker);
                        }

                        if (level == 0) {
                            // call runner in case it have to do some things
                            this.extendedAdjustFilter(filter, name, filter[name], columnMetadata, errorTracker);
                        }
                    } else {
                        // for embeded object, but cannot find the metadata
                        this.adjustFilter(null, value, null, errorTracker, level + 1);
                    }
                }
            }

            errorTracker.pop();
        }
    }

    /** Convert Value base on the type or ColumnMetadata */
    convertValue(metadata: string | ColumnMetadata, value: any, errorTracker: FultonStackError): any {
        let newValue = value;
        if (metadata != null && value != null) {
            let type;
            if (metadata instanceof ColumnMetadata) {
                type = metadata.type;
            } else {
                type = metadata;
            }

            if (type == null) {
                // try use extended convertValue
                newValue = this.extendedConvertValue(metadata, value, errorTracker);
            } else if ((type == "number" || type == "num" || type == "int" || type == Number) && typeof value != "number") {
                newValue = parseFloat(value);
                if (isNaN(newValue)) {
                    if (errorTracker) {
                        errorTracker.add(`must be a number`, true);
                    }

                    newValue = null;
                }
            } else if ((type == "boolean" || type == "bool" || type == Boolean) && typeof value != "boolean") {
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

    protected abstract updateCore<TEntity>(repository: Repository<TEntity>, id: any, entity: TEntity): Promise<void>;

    protected abstract deleteCore<TEntity>(repository: Repository<TEntity>, id: any): Promise<void>;

    protected getColumnMetadata(metadata: EntityMetadata, name: string): ColumnMetadata {
        if (metadata && name) {
            if ((name == "id" || name == "_id")) {
                return metadata.primaryColumns[0];
            } else {
                return metadata.ownColumns.find((col) => col.propertyName == name);
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