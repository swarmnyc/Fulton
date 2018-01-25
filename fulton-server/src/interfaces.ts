import "reflect-metadata";

import * as express from "express";

import { injectable, inject, interfaces } from "inversify";
import { IUserService, IUser } from "./identify";
import { FultonApp } from "./fulton-app";

export const Injectable = injectable;

export const Inject = inject;

export type PathIdentifier = (string | RegExp | (string | RegExp)[]);

/**
 * alias for inversify.interfaces.Container
 */
export type FultonDiContainer = interfaces.Container;

export type NextFunction = express.NextFunction;

declare global {
    namespace Express {
        interface Request {
            fultonApp?: FultonApp;
            userService?: IUserService<IUser>;
            container?: FultonDiContainer;
        }
    }
}

/**
 * extends express.Request
 */
export interface Request extends express.Request {
}

/**
 * extends express.Response
 */
export interface Response extends express.Response {
    sendResult?: any; // TODO: sendResult
}

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

export type HttpMethod = "all" | "get" | "post" | "patch" | "delete" | "head" | "put";

export type AppMode = "api" | "web-view" | "mixed";
