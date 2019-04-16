import { OpenApiSpec, PathItemObject } from "@loopback/openapi-spec";

import { Repository } from "typeorm";
import { Request } from "./alias";

export interface AbstractType<T=any> extends Function {
}

export interface Type<T=any> extends Function {
	new(...args: any[]): T;
}

export type TypeIdentifier<T=any> = (string | symbol | Type<T>);

export type PathIdentifier = (string | RegExp | (string | RegExp)[]);

export type RepositoryFactory<TEntity = any> = ((entity: Type<TEntity>) => Repository<TEntity>);

export type EntityServiceFactory<TEntity = any> = ((entity: Type<TEntity>, connectionName?: string) => IEntityService<TEntity>);

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

/** https://docs.mongodb.com/manual/reference/operator/update */
export type UpdateQuery<T> = {
	$inc?: { [P in keyof T]?: number } | { [key: string]: number };
	$min?: { [P in keyof T]?: number } | { [key: string]: number };
	$max?: { [P in keyof T]?: number } | { [key: string]: number };
	$mul?: { [P in keyof T]?: number } | { [key: string]: number };
	$set?: Partial<T> | { [key: string]: any };
	$setOnInsert?: Partial<T> | { [key: string]: any };
	$unset?: { [P in keyof T]?: 1 | -1 } | { [key: string]: 1 | -1 };
	$rename?: { [key: string]: keyof T } | { [key: string]: string };
	$currentDate?: { [P in keyof T]?: (true | { $type: 'date' | 'timestamp' }) } | { [key: string]: (true | { $type: 'date' | 'timestamp' }) };
	$addToSet?: Partial<T> | { [key: string]: any };
	$pop?: { [P in keyof T]?: -1 | 1 } | { [key: string]: -1 | 1 };
	$pull?: Partial<T> | { [key: string]: any };
	$push?: Partial<T> | { [key: string]: any };
	$pushAll?: Partial<T> | { [key: string]: Array<any> };
	$each?: Partial<T> | { [key: string]: Array<any> };
	$bit?: { [P in keyof T]?: any } | { [key: string]: any };
};

/**
 * Entity Service provides basic CRUD
 */
export interface IEntityService<TEntity> {
	find(queryParams?: QueryParams): Promise<OperationManyResult<TEntity>>;

	findOne(queryParams?: QueryParams): Promise<TEntity>;

	findById(id: any, QueryParams?: QueryParams): Promise<TEntity>;

	count(queryParams?: QueryParams): Promise<number>;

	create(entity: Partial<TEntity>): Promise<TEntity>;

	createMany(entity: Partial<TEntity>[]): Promise<TEntity[]>;

	update(id: any, update: Partial<TEntity> | UpdateQuery<TEntity>): Promise<void>;

	updateMany(filter: any, update: Partial<TEntity> | UpdateQuery<TEntity>): Promise<number>;

	delete(id: any): Promise<void>;

	deleteMany(filter: any): Promise<number>;

	readonly entityType: Type<TEntity>;
}

/**
 * for sorting and select, for example sort = {column1:1 , column2:0 }
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
	hasMore?: boolean;
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
     * 0 is hide
     *
     * ## examples
     * two styles:
     *  - ?projection=columnA,-columnB
     *  - ?projection[columnA]=1&projection[columnB]=0
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
     *  - ?include=columnA,columnB
     *  - ?include=columnA&include=columnB
     */
	include?: string[];

	/**
     * projection options for includes
     */
	includeProjection?: {
		[key: string]: QueryColumnOptions;
	}

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

    /**
     * If true, use cache with default duration. If false or 0, no cache. if it is number and bigger than 0, get values and set the values with the number (mill-second)
     */
	cache?: boolean | number,
	needAdjust?: boolean;
}

export interface ITemplateService {
	generate(contentOrFilePath: string, variables: any): string;
}

export interface ISecurityService {
	verify(req: Request): Promise<boolean>;
}

export interface INotificationService {
	send(...messages: NotificationMessage[]): Promise<void>
}

export interface NotificationMessage {
	email?: EmailMessage;

	sms?: SmsMessage;

	pushNotification?: PushNotificationMessage;
}

export interface IEmailService {
	send(message: EmailMessage): Promise<void>
}

export type PushNotificationProvider = "firebase" | "aws" | "other"

export interface IPushNotificationService {
	send(payload: any): Promise<void>
}

export type SmsNotificationProvider = "aws" | "other"

export interface ISmsNotificationService {
	send(payload: any): Promise<void>
}

export type CacheProvider = "memory" | "redis" | "other"

export interface ICacheServiceFactory {
	getCacheService(namespace: string): ICacheService
	resetAll(): void
}

export interface ICacheService {
	isTypeLost: boolean
	readonly namespace: string;
	get(key: string): Promise<any>
	set(key: string, value: any, maxArg?: number): Promise<void>
	delete(key: string): Promise<void>
	reset(): Promise<void>
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

export interface SmsMessage {
	message: string
	phoneNumber: string
}

export interface PushNotificationMessage {
	// TODO: add generic properties
	[key: string]: any
}

export type HttpMethod = "all" | "get" | "post" | "patch" | "delete" | "head" | "put";

export type AppMode = "api" | "web-view" | "mixed";
