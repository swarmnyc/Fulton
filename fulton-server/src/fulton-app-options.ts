import * as bodyParser from 'body-parser';
import * as https from 'https';
import * as lodash from 'lodash';
import * as path from 'path';

import { ConnectionOptions, Repository } from 'typeorm';
import { ErrorMiddleware, Middleware, Request, Response } from './interfaces';
import { FultonClassLoader, defaultClassLoader } from './helpers/module-helpers';
import FultonLog, { FultonLoggerLevel, FultonLoggerOptions } from './fulton-log';
import { FultonRouter, FultonService } from './index';
import { Provider, TypeProvider, } from './helpers/type-helpers';

import Env from './helpers/env';
import Helper from './helpers/helper';

export class FultonAppOptions {
    // generate AuthClient collection
    // the client call have to have client authorisation token on auth
    // default is false
    oauthServerSupport: boolean;

    // generate api doc
    enabledApiDoc: boolean;

    // default is /api/docs
    apiDocPath: string;

    // for manage user, no default
    //userManager: IUserManager<IUser>

    // auth rotuers like google, facebook, password
    //authRouters: FultonAuthRouter[]

    // // default take token or cookie to User, router can overwrite
    // authenticates: FultonMiddleware[]

    // // check permission
    // defaultAuthorizes: FultonMiddleware[]

    //default is [FultonQueryStringParser]
    queryStringParsers: Middleware[]

    //default is [BodyParser]
    inputParsers: Middleware[]

    //for dot env path, default is ./.env
    dotenvPath: string;

    /**
     * Databases connection options, you can defien connection options on FultonApp.onInt(),  
     * and use procces.env[`${appName}.options.databases[{?:connectionName}].{optionName}`] to override data.
     * for example: FultonApp.options.databases[default].url = {new url}
     * and 
     * FultonApp.options.database.url is the sortcut of FultonApp.options.databases[default].url
     * 
     * if the map is empty, it will use typeorm.json, for more information see [typeorm](http://typeorm.io/)
     */
    databases: Map<string, ConnectionOptions> = new Map();

    /**
     * behavior for "/" request, only one of three methods active at the same time.
     */
    index: {
        /**
         * if true, log every http request.
         * default is procces.env[`${appName}.options.index.enabled`] or true
         */
        enabled: boolean;

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
    errorHandler: ErrorMiddleware;

    providers: Provider[] = [];

    routers: Provider[] = [];

    repositories: TypeProvider[] = [];

    services: Provider[] = [];

    /**
     * default is [bodyParser.json(), bodyParser.urlencoded({ extended: true })]
     */
    bodyParsers: Middleware[];

    /**
     * for automatic load modules, default is disabled, 
     * because we want to use Angular style, define types explicitly
     */
    loader: {
        /**
         * the directory of the app, the default router loader use the value ({appDir}/routers)
         * default is the folder of the executed file like if run "node ./src/main.js",
         * the value of appDir is the folder of main.js
         */
        appDir: string;

        /**
         * if true, Fulton will load routers based on routerDirs automaticly 
         */
        routerLoaderEnabled: boolean;

        /**
         * the folder that router-loader looks at, default value is ["routers"], 
         */
        routerDirs: string[];

        /**
         * the router loader, loads all routers under the folder of {appDir}/{routersDir}
         */
        routerLoader: FultonClassLoader<FultonRouter>

        /**
         * if true, Fulton will load services based on routerDirs automaticly 
         */
        serviceLoaderEnabled: boolean;

        /**
         * the folder that router-loader looks at, default value is ["services"], 
         */
        serviceDirs: string[];

        /**
         * the router loader, loads all routers under the folder of {appDir}/{routersDir}
         */
        serviceLoader: FultonClassLoader<FultonService>

        /**
         * if true, Fulton will load services based on routerDirs automaticly 
         */
        repositoryLoaderEnabled: boolean;

        /**
         * the folder that router-loader looks at, default value is ["repositories"], 
         */
        repositoryDirs: string[];

        /**
         * the router loader, loads all routers under the folder of {appDir}/{routersDir}
         */
        repositoryLoader: FultonClassLoader<Repository<any>>
    }

    logging: {
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
        defaultLoggerColorized: boolean;

        /**
         * if true, log every http request.
         * default is procces.env[`${appName}.options.logging.httpLogEnabled`] or false
         */
        httpLogEnabled: boolean;

        /**
         * the options for http logger, default is console
         * @example
         * option.httpLogOptions = {
         *      level: "debug",
         *      transports: []
         * }
         */
        httpLogOptions: FultonLoggerOptions;
    }

    staticFile: {
        enabled: boolean;
    }

    /**
     * the setting of http and https servers
     */
    server: {
        /**
         * default is procces.env[`${appName}.options.server.httpEnabled`] or true
         */
        httpEnabled: boolean,
        /**
         * default is procces.env[`${appName}.options.server.httpsEnabled`] or false
         */
        httpsEnabled: boolean,

        /**
         * default is procces.env[`${appName}.options.server.httpPort`] or 80
         */
        httpPort: number,

        /**
         * default is procces.env[`${appName}.options.server.httpsPort`] or 443
         */
        httpsPort: number,

        /**
         * have to provide if httpsEnabled is true.
         */
        sslOption?: https.ServerOptions,
    }

    constructor(private appName: string) {
        let prefix = `${this.appName}.options`;

        this.bodyParsers = [
            bodyParser.json({
                type: function (req) {
                    return lodash.includes(["application/json", "application/vnd.api+json"], req.headers['content-type'])
                }
            }),
            bodyParser.urlencoded({ extended: true })
        ];

        this.index = {
            enabled: Env.getBoolean(`${prefix}.index.enabled`, true)
        };

        this.logging = {
            defaultLevel: Env.get(`${prefix}.logging.defaultLevel`) as FultonLoggerLevel,
            defaultLoggerColorized: Env.getBoolean(`${prefix}.logging.defaultLoggerColorized`, true),
            httpLogEnabled: Env.getBoolean(`${prefix}.logging.httpLogEnabled`, false),
            httpLogOptions: null
        };

        this.errorHandler = defaultErrorHandler;

        this.loader = {
            appDir: path.dirname(process.mainModule.filename),

            routerLoaderEnabled: false,
            routerDirs: ["routers"],
            routerLoader: defaultClassLoader(FultonRouter),

            serviceLoaderEnabled: false,
            serviceDirs: ["services"],
            serviceLoader: defaultClassLoader(FultonService),

            repositoryLoaderEnabled: false,
            repositoryDirs: ["repositories"],
            repositoryLoader: defaultClassLoader(Repository)
        };

        this.server = {
            httpEnabled: Env.getBoolean(`${prefix}.server.httpEnabled`, true),
            httpsEnabled: Env.getBoolean(`${prefix}.server.httpsEnabled`, false),
            httpPort: Env.getInt(`${prefix}.server.httpPort`, 80),
            httpsPort: Env.getInt(`${prefix}.server.httpsPort`, 443)
        }

        this.staticFile = {
            enabled: Env.getBoolean(`${prefix}.staticFile.enabled`, true)
        }
    }

    loadDatabaseOptions() {
        let defaultReg = new RegExp(`^${this.appName}\\.options\\.database\\.(\\w+?)$`, "i");
        let namedReg = new RegExp(`^${this.appName}\\.options\\.databases\\[(\\w+?)\\]\\.(\\w+?)$`, "i");

        for (const key in process.env) {
            let connName, propName, value;
            let match = defaultReg.exec(key)
            if (match) {
                connName = "default";
                propName = match[1];
                value = process.env[key];
            } else if ((match = namedReg.exec(key))) {
                connName = match[1];
                propName = match[2];
                value = process.env[key];
            } else {
                continue;
            }

            let options: any;
            if (this.databases.has(connName)) {
                options = this.databases.get(connName);
            } else {
                options = {};
                this.databases.set(connName, options as ConnectionOptions);
            }

            if (Helper.isBoolean(value)) {
                options[propName] = Helper.getBoolean(value);
            } else if (Helper.isNumber(value)) {
                options[propName] = Helper.getFloat(value);
            } else {
                options[propName] = value;
            }
        }
    }
}

let defaultErrorHandler: ErrorMiddleware = (err: any, req: Request, res: Response, next: Middleware) => {
    FultonLog.error(`${req.method} ${req.url}\nrequest: %O\nerror: %s`, { httpHeaders: req.headers, httpBody: req.body }, err.stack);

    res.sendStatus(500);
}