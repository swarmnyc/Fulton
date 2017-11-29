import { IFultonContext } from "./cores/IFultonContext";
import { IFultonRouter, AuthFultonRouter } from "./routers/FultonRouter";
import { IUser } from "./auths/IUser";
import { IUserManager } from "./auths/IUserManager";
import { Middleware } from "koa";
import { Type } from "./cores/Type";
import * as Koa from "koa";
import { ILogger } from "./index";

export type FultonMiddleware = (context: IFultonContext, next: () => Promise<any>) => void

export interface FultonAppOptions {
    // generate AuthClient collection
    // the client call have to have client authorisation token on auth
    // default is false
    oauthServerSupport?: boolean;

    // generate api doc
    enabledApiDoc?: boolean;

    // default is /api/docs
    apiDocPath?: string;

    // for manage user, no default
    userManager?: IUserManager<IUser>

    // auth rotuers like google, facebook, password
    authRouters?: AuthFultonRouter[]

    // default take token or cookie to User, router can overwrite
    authenticates?: FultonMiddleware[]

    // check permission
    defaultAuthorizes?: FultonMiddleware[]

    // regular routers, if null, will load all the routers under ./routers
    routers?: IFultonRouter[]

    // middlewares
    middlewares?: FultonMiddleware[]

    //Dependency Injections
    privoiders?: Array<Type<any>>

    //default is console logger 
    //or just use winston directly?
    logger?: ILogger

    //default is using output to logger
    errorHandler?: Middleware

    //default is BodyParser
    inputParsers?: Middleware[]

    //for dot env path, default is ./.env
    dotenvPath?: string;
}

export abstract class FultonApp {
    koaApp: Koa;
    options: FultonAppOptions

    init(): void {
        this.koaApp = new Koa();

        this.options = {};
        this.onInit(this.options);
        //do somethings
    }

    start(): void {

    }

    // events
    abstract onInit(options: FultonAppOptions): void
}