import "reflect-metadata";
import "./extensions"

import { Repository } from "typeorm";
import { FultonStackError } from './common/fulton-error';
import { PathItemObject, OpenApiSpec } from "@loopback/openapi-spec";

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

export interface Dict {
    [key: string]: any
}

export interface RouterDocOptions {
    title?: string;
    description?: string;
}

export interface RouterActionDocOptions {
    title?: string;
    description?: string;
    custom?: ((path: PathItemObject, docs: OpenApiSpec) => void);
}

export interface FultonErrorDetailItem {
    code?: string;
    message?: string;
}

export interface FultonErrorDetail {
    [key: string]: FultonErrorDetailItem[];
}

export interface FultonErrorObject {
    code?: string;
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

export interface ITemplateService {
    geneate(contentOrFilePath: string, variables: any): string;
}

export interface INotificationService {
    send(...messages: NotificationMessage[]): Promise<void>
}

export interface NotificationMessage {
    email?: EmailMessage,

    // TODO: sms message
    sms?: any;

    // TODO: pushNotification
    pushNotification?: any;
}

export interface IEmailService {
    send(message: EmailMessage): Promise<void>
}

export interface EmailMessage {
    /**
     * the sender, if null, use the default sender.
     */
    from?: string;

    /**
     * the cc. if null, use the default cc.
     */
    cc?: string;

    /**
     * the bcc. if null, use the default bcc.
     */
    bcc?: string;

    /**
     * the to
     */
    to: string | string[];

    /**
     * if subjectTemplate is not null, app will generate subject by template
     */
    subject?: string;

    /**
     * the subject template, it can be text or file path
     */
    subjectTemplate?: string;

    /**
     * if bodyTemplate is not null, app will generate body by template
     */
    body?: string;

    /**
     * the body template, it can be text or file path
     */
    bodyTemplate?: string;

    /**
     * the variables for template
     */
    variables?: any;

    attachments?: any[];
}

export type HttpMethod = "all" | "get" | "post" | "patch" | "delete" | "head" | "put";

export type AppMode = "api" | "web-view" | "mixed";