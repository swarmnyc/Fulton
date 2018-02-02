import * as express from "express";

import { IUser, IUserService } from "./identity";
import { inject, injectable, interfaces } from "inversify";

export const Injectable = injectable;

export const Inject = inject;

/**
 * alias for inversify.interfaces.Container
 */
export type DiContainer = interfaces.Container;

/**
 * extends express.NextFunction
 */
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
export interface Middleware extends express.RequestHandler { }

/**
 * alias for express.ErrorRequestHandler
 */
export interface ErrorMiddleware extends express.ErrorRequestHandler { }