import * as express from "express";
import * as http from 'http';
import * as https from 'https';

import { promisify } from "util"

import { Express, RequestHandler } from "express";
import { IContainer, ContainerBuilder } from "tsioc";

import { ILogger, IFultonContext } from "./cores/index";
import { IUser, FultonAuthRouter, IUserManager } from "./auths/index";
import { FultonRouter } from "./routers/FultonRouter";

export declare type Middleware = RequestHandler;

export declare type FultonIocContainer = IContainer;

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

    // // default take token or cookie to User, router can overwrite
    // authenticates?: FultonMiddleware[]

    // // check permission
    // defaultAuthorizes?: FultonMiddleware[]

    // regular routers, if null, will load all the routers under ./routers
    routers?: FultonRouter[]

    // middlewares
    // middlewares?: FultonMiddleware[]

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

    server?: {
        useHttp?: boolean,
        useHttps?: boolean,
        httpPort?: number,
        httpsPort?: number,
        sslKey?: Buffer,
        sslCert?: Buffer
    }
}

export abstract class FultonApp {
    isInitialized: boolean = false;
    app: Express;
    container: IContainer;
    options: FultonAppOptions

    constructor() {
    }

    async init(): Promise<void> {
        if (!this.isInitialized) {
            return;
        }

        this.app = express();

        let container = this.createContainer();

        if (container instanceof Promise) {
            this.container = await container;
        } else {
            this.container = container;
        }

        this.options = this.defaultOption();

        // load routers;

        await this.onInit(this.options, this.container);
        //do somethings

        this.isInitialized = true;
    }

    async start(): Promise<any> {
        if (!this.isInitialized) {
            await this.init();
        }

        var tasks = [];

        if (this.options.server.useHttp) {
            tasks.push(promisify<number>(http.createServer(this.app).listen)(this.options.server.httpPort))
            tasks.push(new Promise(async (resolve, reject) => {
                http.createServer(this.app).listen(this.options.server.httpPort);
                
            }));
        }

    }

    createContainer(): FultonIocContainer | Promise<FultonIocContainer> {
        return new ContainerBuilder().create();
    }

    // events
    protected abstract onInit(options: FultonAppOptions, container: FultonIocContainer): void | Promise<void>;


    defaultOption(): FultonAppOptions {
        return {
            server: {
                useHttp: true,
                useHttps: false,
                httpPort: 3000,
                httpsPort: 443
            }
        };
    }
}