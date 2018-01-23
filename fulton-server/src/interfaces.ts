import "reflect-metadata";

import * as express from "express";

import { injectable, inject, interfaces } from "inversify";
import { IUserService } from "./identify";

export const Injectable = injectable;

export const Inject = inject;

export type PathIdentifier = (string | RegExp | (string | RegExp)[]);

/**
 * alias for inversify.interfaces.Container
 */
export type FultonDiContainer = interfaces.Container;

export type NextFunction = express.NextFunction;

/**
 * extends express.Request
 */
export interface Request extends express.Request {
    userService?: IUserService;
    container?: FultonDiContainer;
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
