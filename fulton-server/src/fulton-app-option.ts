import * as https from 'https';

import { ErrorMiddleware, Middleware } from './interfaces';
import { FultonLoggerLevel, FultonRouter, FultonService } from './index';

import { FultonClassLoader } from './helpers/module-helpers';
import { FultonLoggerOptions } from './fulton-log';
import { Provider } from './helpers/type-helpers';

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

    //default is [FultonQueryStringParser]
    queryStringParsers?: Middleware[]

    //default is [BodyParser]
    inputParsers?: Middleware[]

    //for dot env path, default is ./.env
    dotenvPath?: string;

    dbConnectionOptions?: any;

    /**
     * behavior for "/" request, only one of three methods active at the same time.
     */
    index?: {
        /**
         * if true, log every http request.
         * default is procces.env[`${appName}.options.index.indexEnabled`] or true
         */
        indexEnabled?: boolean;

        /**
          * custom response function
          */
        handler?: Middleware;

        /**
         * response the index file, like index.html
         */
        filepath?: string;

        /**
         * response the static message
         */
        message?: string;
    }

    /**
     * default is using output to logger
     */
    errorHandler?: ErrorMiddleware;

    providers?: Provider[];

    routers?: Provider[];

    services?: Provider[];

    /**
     * default is [bodyParser.json(), bodyParser.urlencoded({ extended: true })]
     */
    bodyParsers?: Middleware[];

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

    logging?: {
        defaultLevel?: FultonLoggerLevel;
        /**
         * if not null, reset winstion default logger with this value, the default value is null
         * @example
         * option.defaultLoggerOptions = {
         *      level: "debug",
         *      transports: []
         * }
         */
        defaultOptions?: FultonLoggerOptions;

        /**
         * is default log transport collorized
         * default is procces.env[`${appName}.options.logging.httpLogEnabled`] or true
         */
        defaultLoggerColorized?: boolean;

        /**
         * if true, log every http request.
         * default is procces.env[`${appName}.options.logging.httpLogEnabled`] or false
         */
        httpLogEnabled?: boolean;

        /**
         * the options for http logger, default is console
         * @example
         * option.httpLogOptions = {
         *      level: "debug",
         *      transports: []
         * }
         */
        httpLogOptions?: FultonLoggerOptions;
    }

    staticFile?: {
        staticFileEnabled?: boolean;
    }

    /**
     * the setting of http and https servers
     */
    server?: {
        /**
         * default is procces.env[`${appName}.options.server.useHttp`] or true
         */
        useHttp?: boolean,
        /**
         * default is procces.env[`${appName}.options.server.useHttps`] or false
         */
        useHttps?: boolean,

        /**
         * default is procces.env[`${appName}.options.server.httpPort`] or 80
         */
        httpPort?: number,

        /**
         * default is procces.env[`${appName}.options.server.httpsPort`] or 443
         */
        httpsPort?: number,

        /**
         * have to provide if useHttps is true.
         */
        sslOption?: https.ServerOptions,
    }
}