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

export interface QueryParams {
    /**
     * filter options
     */
    filter?: {
        [key: string]: any;
    },

    /**
     * sort options
     * true is ascending order
     * false is descending order
     */
    sort?: {
        [key: string]: boolean;
    },

    /**
     * projection options,
     * if undefined, all output all columns excepts @Colume({hide:true})
     */
    projection?: string[];


    /**
     * pagination options,
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
            sendResult?: any; // TODO: sendResult
        }
    }

}

declare module "typeorm/decorator/options/ColumnOptions" {
    interface ColumnOptions {
        /**
         * only EntityService.find() supports, don't not output this colume to client
         */
        hide?: boolean;
    }
}

declare module "typeorm/decorator/options/ColumnCommonOptions" {
    interface ColumnCommonOptions {
        /**
         * only EntityService.find() supports, don't not output this colume to client
         */
        hide?: boolean;
    }
}