import "reflect-metadata";

import * as express from "express";

import { IUser, IUserService } from "./identity";
import { inject, injectable, interfaces } from "inversify";

import { FultonApp } from "./fulton-app";

export const Injectable = injectable;

export const Inject = inject;

export type PathIdentifier = (string | RegExp | (string | RegExp)[]);

/**
 * alias for inversify.interfaces.Container
 */
export type FultonDiContainer = interfaces.Container;

export interface NextFunction extends express.NextFunction { }

/**
 * extends express.Request
 */
export interface Request extends express.Request { }

/**
 * extends express.Response
 */
export interface Response extends express.Response { }

/**
 * alias for express.RequestHandler
 */
export interface Middleware extends express.RequestHandler {
    (req: Request, res: Response, next: NextFunction): any;
}

/**
 * alias for express.ErrorRequestHandler
 */
export interface ErrorMiddleware extends express.ErrorRequestHandler {
    (err: any, req: Request, res: Response, next: NextFunction): any;
}

export interface RouterDocOptions {
    title?: string;
    description?: string;
    // TODO: RouterDocOptions
}

export interface RouterActionDocOptions {
    title?: string;
    description?: string;
}


export interface FultonErrorObject {
    [key: string]: string[];
}

export interface IEntityService<TEntity> {
    find(queryParams: QueryParams): Promise<OperationReault<TEntity>>;

    findOne(queryParams: QueryParams): Promise<OperationOneReault<TEntity>>;

    create(): Promise<TEntity>;

    update(): Promise<TEntity>;

    delete(): Promise<TEntity>;
}

/**
 * for sorting and select, for example sort = {column1:1 , column2:-1 }
 */
export interface QueryColumnStates {
    [key: string]: number;
}

export interface OperationReault<T=any> {
    data?: T[];
    errors?: FultonErrorObject;
    pagination?: {
        total?: number;
        index?: number;
        size?: number;
    }
}

export interface OperationOneReault<T=any> {
    data?: T;
    errors?: FultonErrorObject;
    pagination?: {
        total?: number;
        index?: number;
        size?: number;
    }
}

export interface JsonApiOptions {
    // TODO: JsonApiOptions
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
     * true is ascending order
     * false is descending order
     * 
     * ## examples
     * two styles: 
     *  - ?sort=columeA,-columeB 
     *  - ?sort[columeA]=1|true&sort[columeB]=-1|false
     */
    sort?: QueryColumnStates,

    /**
     * select options,
     * if undefined, all output all columns excepts @Colume({hide:true})
     * ## examples
     * two styles: 
     *  - ?select=columeA,columeB 
     *  - ?select=columeA&select=columeB
     */
    select?: string[];

    /**
     * pagination options,
     * ## examples
     *  - ?includes=columeA,columeB 
     *  - ?includes=columeA&includes=columeB
     */
    includes?: string[];

    /**
     * pagination options,
     * ## examples
     *  - ?pagination[index]=1
     *  - ?pagination[size]=100
     */
    pagination?: {
        index?: number,
        size?: number,
    }
}

export type HttpMethod = "all" | "get" | "post" | "patch" | "delete" | "head" | "put";

export type AppMode = "api" | "web-view" | "mixed";


// custom types for helping development;
declare global {
    namespace Express {
        interface Request {
            fultonApp?: FultonApp;
            userService?: IUserService<IUser>;
            container?: FultonDiContainer;
            queryParams?: QueryParams;
        }

        interface Response {
        }
    }

}

// declare module "typeorm/decorator/options/ColumnOptions" {
//     interface ColumnOptions {
//         /**
//          * only EntityService.find() supports, don't not output this colume to client
//          */
//         hide?: boolean;
//     }
// }

// declare module "typeorm/decorator/options/ColumnCommonOptions" {
//     interface ColumnCommonOptions {
//         /**
//          * only EntityService.find() supports, don't not output this colume to client
//          */
//         hide?: boolean;
//     }
// }