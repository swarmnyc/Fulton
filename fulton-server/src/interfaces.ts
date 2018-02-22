import "reflect-metadata";
import "./extensions"

import { Repository } from "typeorm";

export * from "./re-export"

export interface AbstractType<T=any> extends Function {
}

export interface Type<T=any> extends Function {
    new(...args: any[]): T;
}

export type TypeIdentifier<T=any> = (string | symbol | Type<T>);

export type PathIdentifier = (string | RegExp | (string | RegExp)[]);

export type RepositoryFactory<TEntity = any> = ((entity: Type<TEntity>) => Repository<TEntity>);

export type EntityServiceFactory<TEntity = any> = ((entity: Type<TEntity>) => IEntityService<TEntity>);

export interface RouterDocOptions {
    title?: string;
    description?: string;
    // TODO: RouterDocOptions
}

export interface RouterActionDocOptions {
    title?: string;
    description?: string;
}

export interface FultonErrorConstraints {
    [key: string]: string;
}

export interface FultonErrorItem {
    message?: string;
    constraints?: FultonErrorConstraints;
}

export interface FultonErrorDetail {
    [key: string]: FultonErrorItem;
}

export interface FultonErrorObject {
    message?: string;
    detail?: FultonErrorDetail;
}

/**
 * Entity Service provides basic CRUD
 */
export interface IEntityService<TEntity> {
    find(queryParams?: QueryParams): Promise<OperationResult<TEntity>>;

    findOne(queryParams?: QueryParams): Promise<OperationOneResult<TEntity>>;

    findById(id: any, QueryParams?: QueryParams): Promise<OperationOneResult<TEntity>>;

    create(entity: TEntity): Promise<OperationOneResult<TEntity>>;

    update(id: any, entity: TEntity): Promise<OperationStatus>;

    delete(id: any): Promise<OperationStatus>;
}

/** the real runner of entity service, it can be Mongo runner or Sql Runner */
export interface IEntityRunner {
    find<TEntity>(repository: Repository<TEntity>, queryParams?: QueryParams): Promise<[TEntity[], number]>;

    findOne<TEntity>(repository: Repository<TEntity>, queryParams?: QueryParams): Promise<TEntity>;

    findById<TEntity>(repository: Repository<TEntity>, id: any, queryParams?: QueryParams): Promise<TEntity>;

    create<TEntity>(repository: Repository<TEntity>, entity: TEntity): Promise<TEntity>;

    update<TEntity>(repository: Repository<TEntity>, id: any, entity: TEntity): Promise<void>;

    delete<TEntity>(repository: Repository<TEntity>, id: any): Promise<void>;
}

/**
 * for sorting and select, for example sort = {column1:1 , column2:-1 }
 */
export interface QueryColumnOptions {
    [key: string]: number;
}

export interface OperationStatus {
    status?: number;
    errors?: FultonErrorObject;
}

export interface OperationResultPagination {
    total?: number;
    index?: number;
    size?: number;
}

export interface OperationResult<T=any> {
    data?: T[];
    errors?: FultonErrorObject;
    pagination?: OperationResultPagination;
}

export interface OperationOneResult<T=any> {
    data?: T;
    errors?: FultonErrorObject;
}

export interface QueryParams {
    /**
     * filter options
     * 
     * ## examples
     * - ?filter[a]=123&filter[b]=456
     * - ?filter[name][$regex]=abc&filter[name][$options]=i
     * - ?filter[name][$like]=abc
     * - ?filter[$or][0][a]=1&filter[$or][1][b]=2
     */
    filter?: {
        [key: string]: any;
    },

    /**
     * sort options
     * 1 is ascending order
     * -1 is descending order
     * 
     * ## examples
     * two styles: 
     *  - ?sort=columnA,-columnB 
     *  - ?sort[columnA]=1&sort[columnB]=-1
     */
    sort?: QueryColumnOptions;

    /**
     * projection options, can be parsed by select (for show)
     * 1 is show
     * -1 is descending order
     * 
     * ## examples
     * two styles: 
     *  - ?projection=columnA,-columnB 
     *  - ?projection[columnA]=1&projection[columnB]=-1
     */
    projection?: QueryColumnOptions;

    /**
     * select options,
     * if undefined, all output all columns excepts @column({select:false})
     * ## examples
     * two styles: 
     *  - ?select=columnA,columnB 
     *  - ?select=columnA&select=columnB
     */
    select?: string[];

    /**
     * pagination options,
     * ## examples
     *  - ?includes=columnA,columnB 
     *  - ?includes=columnA&includes=columnB
     */
    includes?: string[];

    /**
     * pagination options,
     * ## examples
     *  - ?includes=columnA,columnB 
     *  - ?includes=columnA&includes=columnB
     */
    include?: string[];

    /**
     * pagination options,
     * ## examples
     *  - ?pagination[index]=1
     *  - ?pagination[size]=100
     */
    pagination?: {
        index?: number,
        size?: number,
    },
    needAdjust?: boolean;
}

export type HttpMethod = "all" | "get" | "post" | "patch" | "delete" | "head" | "put";

export type AppMode = "api" | "web-view" | "mixed";