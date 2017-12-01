import { FultonRouter } from "./routers/FultonRouter";
import { ILogger, IFultonContext } from "./cores/index";
import { IUser, FultonAuthRouter, IUserManager } from "./auths/index";
import { Middleware } from "koa";
import { IContainer, ContainerBuilder } from "tsioc";
import * as Koa from "koa";

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
    authRouters?: FultonAuthRouter[]

    // default take token or cookie to User, router can overwrite
    authenticates?: FultonMiddleware[]

    // check permission
    defaultAuthorizes?: FultonMiddleware[]

    // regular routers, if null, will load all the routers under ./routers
    routers?: FultonRouter[]

    // middlewares
    middlewares?: FultonMiddleware[]

    //default is console logger 
    //or just use winston directly?
    logger?: ILogger

    //default is using output to logger
    errorHandler?: Middleware

    //default is [FultonQueryStringParser]
    queryStringParsers?: Middleware[]

    //default is [BodyParser]
    inputParsers?: Middleware[]

    //for dot env path, default is ./.env
    dotenvPath?: string;

    dbConnectionOptions?: any;
}

export abstract class FultonApp {
    koaApp: Koa;
    container: IContainer;
    options: FultonAppOptions

    constructor() {
    }

    async init(): Promise<any> {
        this.koaApp = new Koa();
        let container = this.createContainer();

        if (container instanceof Promise) {
            this.container = await container;
        } else {
            this.container = container;
        }

        this.options = {};

        // load routers;

        await this.onInit(this.options, this.container);
        //do somethings
    }

    start(): Promise<any> {
        return new Promise(async (resolve, reject) => {
            let follow = await this.init();

        });
    }

    createContainer(): IContainer | Promise<IContainer> {
        return new ContainerBuilder().create();
    }

    // events
    abstract onInit(options: FultonAppOptions, container: IContainer): Promise<any>
}