import * as express from "express";
import { inject as inversifyInject, injectable as inversifyInjectable, optional as inversifyOptional, interfaces } from "inversify";
import { IUser, IUserService } from "./identity/interfaces";
import { IFultonApp } from "./fulton-app";
import { QueryParams } from "./interfaces";

/**
 * alias for inversify.injectable
 */
export const injectable = inversifyInjectable;

/**
 * alias for inversify.inject
 */
export const inject = inversifyInject;

/**
 * alias for inversify.optional
 */
export const optional = inversifyOptional;

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
export interface Request extends express.Request {
    user?: IUser
    fultonApp?: IFultonApp;
    userService?: IUserService<IUser>;
    container?: DiContainer;
    queryParams?: QueryParams;
}

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