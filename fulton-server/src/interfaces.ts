import "reflect-metadata";

import * as https from 'https';

import { FultonClassLoader } from "./helpers/module-helpers";
import { FultonLoggerOptions } from "./FultonLog";
import { FultonRouter } from "./routers";
import { FultonService } from "./services";
import { Provider } from "./helpers/type-helpers";
import { RequestHandler } from "express";
import { interfaces } from "inversify";

export { injectable, inject } from "inversify";

export declare type Middleware = RequestHandler;

export declare type FultonDiContainer = interfaces.Container;


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
    //userManager?: IUserManager<IUser>

    // auth rotuers like google, facebook, password
    //authRouters?: FultonAuthRouter[]

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

    providers?: Provider[];

    routers?: Provider[];

    services?: Provider[];

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
        routerLoader?: FultonClassLoader<FultonRouter>

        /**
         * if true, Fulton will load services based on routerDirs automaticly 
         */
        serviceLoaderEnabled?: boolean;

        /**
         * the folder that router-loader looks at, default value is ["services"], 
         */
        serviceDirs?: string[];

        /**
         * the router loader, loads all routers under the folder of {appDir}/{routersDir}
         */
        serviceLoader?: FultonClassLoader<FultonService>
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