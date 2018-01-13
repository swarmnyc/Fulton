import * as express from "express";
import * as http from 'http';
import * as https from 'https';
import * as path from 'path'

import { promisify } from "util"

import { Express, RequestHandler } from "express";
import { IContainer, ContainerBuilder } from "tsioc";

import { IFultonContext } from "./cores/index";
import { IUser, FultonAuthRouter, IUserManager } from "./auths/index";
import { FultonRouter } from "./routers/FultonRouter";
import { FultonLoggerOptions } from "./index";
import { FultonRouterLoader, defaultRouterLoader } from "./routers/router-helpers";
import { Provider, TypeProvider } from "./helpers/type-helpers";
import FultonLog from "./FultonLog";

export declare type Middleware = RequestHandler;

export declare type FultonDiContainer = IContainer;

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

    // middlewares
    // middlewares?: FultonMiddleware[]

    //default is using output to logger
    errorHandler?: Middleware

    //default is [FultonQueryStringParser]
    queryStringParsers?: Middleware[]

    //default is [BodyParser]
    inputParsers?: Middleware[]

    //for dot env path, default is ./.env
    dotenvPath?: string;

    dbConnectionOptions?: any;

    appName?: string;

    routers?: Provider[];

    /**
     * for automatic load modules, default is disabled, 
     * because we want to use Angular style, define types explicitly
     */
    loader?: {
        /**
         * the directory of the app, the default router loader use the value ({appDir}/routers)
         * default is the folder of the executed file like if run "node ./src/main.js",
         * the value of appDir is the folder of main.js
         */
        appDir?: string;

        /**
         * if true, Fulton will load routers based on routerDirs automaticly 
         */
        routerLoaderEnabled?: boolean;

        /**
         * the folder that router-loader looks at, default value is ["routers"], 
         */
        routerDirs?: string[];

        /**
         * the router loader, loads all routers under the folder of {appDir}/{routersDir}
         */
        routerLoader?: FultonRouterLoader
    }

    /**
     * default logger options which use winstion logger options, the default value is null
     * @example
     * option.defaultLoggerOptions = {
     *      level: "debug",
     *      transports: []
     * }
     */
    defaultLoggerOptions?: FultonLoggerOptions;

    /**
     * the setting of http and https servers
     */
    server?: {
        /**
         * default is true
         */
        useHttp?: boolean,
        /**
         * default is false
         */
        useHttps?: boolean,

        /**
         * default is 3000
         */
        httpPort?: number,

        /**
         * default is 443
         */
        httpsPort?: number,

        /**
         * have to provide if useHttps is true.
         */
        sslOption?: https.ServerOptions,
    }
}

export abstract class FultonApp {
    private isInitialized: boolean = false;
    private httpServer: http.Server;
    private httpsServer: https.Server;

    appName: string;

    /**
     * the instance of Express, create after init().
     */
    express: Express;
    container: FultonDiContainer;
    options: FultonAppOptions;

    constructor() {
        this.options = this.createDefaultOptions();
    }

    /**
     * initialize FultonApp. It will be called on start(), if the app isn't initialized;
     * it can be run many times, everytime call this will reset all the related objects
     */
    async init(): Promise<void> {
        this.express = express();

        this.container = await this.createDiContainer();

        await this.onInit(this.options, this.container);

        this.appName = this.options.appName;

        // for log
        if (this.options.defaultLoggerOptions) {
            FultonLog.configure(this.options.defaultLoggerOptions);
        }

        // for routers
        let routerTypes = this.options.routers;
        if (this.options.loader.routerLoaderEnabled) {
            let dirs = this.options.loader.routerDirs.map((dir) => path.join(this.options.loader.appDir, dir));
            let routers = await this.options.loader.routerLoader(dirs) as Provider[];
            routerTypes = routers.concat(routerTypes);
        }

        //await this.onInitRouters(routerTypes);

        this.isInitialized = true;
    }

    /**
     * start http server or https server. if it isn't initialized, it will call init(), too.
     */
    async start(): Promise<any> {
        if (!this.isInitialized) {
            await this.init();
        }

        if (this.httpServer || this.httpsServer) {
            throw new Error("app is still running");
        }

        var tasks = [];

        if (this.options.server.useHttp) {
            tasks.push(new Promise((resolve, reject) => {
                this.httpServer = http
                    .createServer(this.express)
                    .on("error", (error) => {
                        FultonLog.error(`${this.appName} failed to start http server on port ${this.options.server.httpPort}`);
                        this.httpServer = null;
                        reject(error);
                    })
                    .listen(this.options.server.httpPort, () => {
                        FultonLog.info(`${this.appName} is running http server on port ${this.options.server.httpPort}`)
                        resolve()
                    });

            }));
        }

        if (this.options.server.useHttps) {
            tasks.push(new Promise((resolve, reject) => {
                this.httpsServer = https
                    .createServer(this.options.server.sslOption, this.express)
                    .on("error", (error) => {
                        FultonLog.error(`${this.appName} failed to start https server on port ${this.options.server.httpsPort}`);
                        this.httpsServer = null;
                        reject(error);
                    })
                    .listen(this.options.server.httpsPort, () => {
                        FultonLog.info(`${this.appName} is running https server on port ${this.options.server.httpsPort}`);
                        resolve()
                    });
            }));
        }

        return Promise.all(tasks);
    }

    /**
     * stop http server or https server
     */
    stop(): Promise<any> {
        var tasks = [];

        if (this.httpServer) {
            tasks.push(new Promise((resolve, reject) => {
                this.httpServer.close(() => {
                    FultonLog.info(`${name} stoped http server`);
                    resolve();
                })
            }));
        }

        if (this.httpsServer) {
            tasks.push(new Promise((resolve, reject) => {
                this.httpServer.close(() => {
                    FultonLog.info(`${name} stoped https server`);
                    resolve();
                })
            }));
        }

        return Promise.all(tasks);
    }

    createDiContainer(): FultonDiContainer | Promise<FultonDiContainer> {
        return new ContainerBuilder().create();
    }

    createDefaultOptions(): FultonAppOptions {
        return {
            appName: "FultonApp",
            routers: [],
            loader: {
                appDir: path.dirname(process.mainModule.filename),
                routerDirs: ["routers"],
                routerLoaderEnabled: false,
                routerLoader: defaultRouterLoader,

            },
            server: {
                useHttp: true,
                useHttps: false,
                httpPort: 3000,
                httpsPort: 443
            }
        };
    }

    // events
    protected abstract onInit(options: FultonAppOptions, container: FultonDiContainer): void | Promise<void>;

    protected onInitRouters(routers: FultonRouter[]): void | Promise<void> {

    }
}