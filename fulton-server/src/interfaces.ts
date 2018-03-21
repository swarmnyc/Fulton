import "reflect-metadata";
import "./extensions"

import { Repository } from "typeorm";
import { EntityMetadata } from 'typeorm/metadata/EntityMetadata';
import { ColumnMetadata } from 'typeorm/metadata/ColumnMetadata';
import { FultonStackError } from './common/fulton-error';

export * from "./re-export"

export enum DiKeys {
    EntityServiceFactory = "__EntityServiceFactory__",
    FultonApp = "__FultonApp__",
    MongoEntityRunner = "__MongoEntityRunner__",
}

export enum EventKeys {
    didInit = "didInit",
    didInitCors = "didInitCors",
    didInitDatabases = "didInitDatabases",
    didInitDiContainer = "didInitDiContainer",
    didInitDocs = "didInitDocs",
    didInitErrorHandler = "didInitErrorHandler",
    didInitFormatter = "didInitFormatter",
    didInitHttpLogging = "didInitHttpLogging",
    didInitIdentity = "didInitIdentity",
    didInitIndex = "didInitIndex",
    didInitJsonApi = "didInitJsonApi",
    didInitLogging = "didInitLogging",
    didInitMiddlewares = "didInitMiddlewares",
    didInitProviders = "didInitProviders",
    didInitRepositories = "didInitRepositories",
    didInitRouters = "didInitRouters",
    didInitServer = "didInitServer",
    didInitServices = "didInitServices",
    didInitStaticFile = "didInitStaticFile",
    onInitJsonApi = "onInitJsonApi",
}

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
    [key: string]: string | FultonErrorItem | FultonErrorConstraints;
}

export interface FultonErrorObject {
    message?: string;
    detail?: FultonErrorDetail;
}

export interface FindResult<TEntity> {
    /** the data of the result */
    data: TEntity[],
    /** the real total before pagination */
    total: number
}

/**
 * Entity Service provides basic CRUD
 */
export interface IEntityService<TEntity> {
    find(queryParams?: QueryParams): Promise<OperationManyResult<TEntity>>;

    findOne(queryParams?: QueryParams): Promise<OperationOneResult<TEntity>>;

    findById(id: any, QueryParams?: QueryParams): Promise<OperationOneResult<TEntity>>;

    count(queryParams?: QueryParams): Promise<OperationOneResult<number>>;

    create(entity: TEntity): Promise<OperationOneResult<TEntity>>;

    update(id: any, entity: TEntity): Promise<OperationResult>;

    delete(id: any): Promise<OperationResult>;
}

/**
 * for sorting and select, for example sort = {column1:1 , column2:-1 }
 */
export interface QueryColumnOptions {
    [key: string]: number;
}

export interface OperationResult {
    status?: number;
    error?: FultonErrorObject;
}

export interface OperationResultPagination {
    total?: number;
    index?: number;
    size?: number;
}

export interface OperationManyResult<T=any> extends OperationResult {
    data?: T[];
    pagination?: OperationResultPagination;
}

export interface OperationOneResult<T=any> extends OperationResult {
    data?: T;
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