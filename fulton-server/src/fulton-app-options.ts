import * as bodyParser from 'body-parser';
import * as https from 'https';
import * as lodash from 'lodash';
import * as path from 'path';

import { ConnectionOptions, Repository } from 'typeorm';
import { ErrorMiddleware, Middleware, Request, Response } from './interfaces';
import { FultonClassLoader, defaultClassLoader } from './helpers/module-helpers';
import FultonLog, { FultonLoggerLevel, FultonLoggerOptions } from './fulton-log';
import { FultonRouter, FultonService, Type } from './index';
import { Provider, TypeProvider, } from './helpers/type-helpers';

import Env from './helpers/env';
import Helper from './helpers/helper';

export class FultonAppOptions {
    // generate AuthClient collection
    // the client call have to have client authorisation token on auth
    // default is false
    //oauthServerSupport: boolean;

    // generate api doc
    //enabledApiDoc: boolean;

    // default is /api/docs
    // apiDocPath: string;

    // for manage user, no default
    //userManager: IUserManager<IUser>

    // auth rotuers like google, facebook, password
    //authRouters: FultonAuthRouter[]

    // // default take token or cookie to User, router can overwrite
    // authenticates: FultonMiddleware[]

    // // check permission
    // defaultAuthorizes: FultonMiddleware[]

    /**
     * Databases connection options, you can defien connection options on FultonApp.onInt(),  
     * and use 
     * `procces.env["{appName}.options.databases[{connectionName}].{optionName}"]` to override data.
     * 
     * for example: 
     * FultonApp.options.databases[default].url={url}
     * 
     * and 
     * `procces.env["{appName}.options.database.{optionName}"]` is the sortcut of 
     * `procces.env["{appName}.options.databases[default].{optionName}"]`
     * 
     * if the map is empty, it will use typeorm.json, for more information see [typeorm](http://typeorm.io/)
     */
    databases: Map<string, ConnectionOptions> = new Map();

    /**
     * behavior for "/" request, only one of three methods can be actived at the same time.
     */
    index: {
        /**
         * if true, log every http request.
         * 
         * default is procces.env["{appName}.options.index.enabled"] or false
         */
        enabled: boolean;

        /**
          * custom response middleware function
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

    /**
     * Define values or types injections
     * 
     * ### Example
     * 
     * ``` typescript
     * class MyApp extends FultonApp {
     *   onInit(options){
     *       options.providers = [
     *           { provide: "api_key", useValue: "your key" }
     *       ];
     * 
     *       options.services = [
     *           ApiService
     *       ];
     *   }
     * }
     * 
     * @Injectable() 
     * class ApiService {
     *  // apiKey is injected by container when it is created
     *  constructor( @Inject("api_key") private apiKey: string) 
     *  }
     * }
     * ```
     */
    providers: Provider[] = [];

    /**
     * Define injections for the routers
     * 
     * ```
     * class MyApp extends FultonApp {
     *   onInit(options){
     *       options.routers = [
     *           FoodRouter
     *       ];
     *       
     *       // turn on the router loader if you want app to load routers automatically 
     *       options.loader.routerLoaderEnabled = true;
     *   }
     * }
     * 
     * @router("/food")
     * class FoodRouter extends FultonRouter {
     * }
     * ```
     */
    routers: Provider[] = [];

    /**
     * Define injections for the repositories
     * 
     * ```
     * class MyApp extends FultonApp {
     *   onInit(options){
     *       options.repositories = [
     *           FoodRepository
     *       ];
     * 
     *       // turn on the repository loader if you want app to load repositories automatically 
     *       options.loader.repositoryLoaderEnabled = true;
     *   }
     * }
     * 
     * @Injectable() 
     * class ApiService {
     *  constructor( @Inject("api_key") private apiKey: string) 
     *  }
     * }
     * ```
     */
    repositories: TypeProvider[] = [];

    /**
     * Define injections for the repositories
     * 
     * ```
     * class MyApp extends FultonApp {
     *   onInit(options){
     *       options.repositories = [
     *           FoodRepository
     *       ];
     * 
     *       // turn on the repository loader if you want app to load repositories automatically 
     *       options.loader.repositoryLoaderEnabled = true;
     *   }
     * }
     * 
     * @Entity()
     * class Food { }
     * 
     * @Repository(Food)
     * class FoodRepository extends MongoRepository<Food> {
     * }
     * ```
     */
    services: Provider[] = [];

    /**
     * the entities for typeorm, the value will concatenate all database CollectionOptions.entities
     * you can directly defien enitiies on each CollectionOptions
     * typeorm will automatically road entities under ./entities
     */
    entities: Type[] = [];

    /**
     * middlewares for parse request.body
     * default is [bodyParser.json(), bodyParser.urlencoded({ extended: true })]
     */
    bodyParsers: Middleware[];

    /**
     * custom middlewares
     */
    middlewares: Middleware[] = [];

    /**
     * for loading modules automatically, default is disabled, 
     * because we want to use Angular style, define types explicitly
     */
    loader: {
        /**
         * the directory of the app, the default router loader use the value ({appDir}/routers)
         * default is the folder of the executed file like if run "node ./src/main.js",
         * the value of appDir is ./src/
         */
        appDir: string;

        /**
         * if true, Fulton will load routers based on routerDirs automatically 
         */
        routerLoaderEnabled: boolean;

        /**
         * the folders that router-loader looks at, default value is ["routers"], 
         */
        routerDirs: string[];

        /**
         * the router loader (a function), loads all routers under the folders of routerDirs
         * default is FultonClassLoader
         */
        routerLoader: FultonClassLoader<FultonRouter>

        /**
         * if true, Fulton will load services based on serviceDirs automatically 
         */
        serviceLoaderEnabled: boolean;

        /**
         * the folders that service-loader looks at, default value is ["services"], 
         */
        serviceDirs: string[];

        /**
         * the router loader (a function), loads all services under the folders of all serviceDirs
         * default is FultonClassLoader
         */
        serviceLoader: FultonClassLoader<FultonService>

        /**
         * if true, Fulton will load repositories based on repositoryDirs automatically 
         */
        repositoryLoaderEnabled: boolean;

        /**
         * the folders that router-loader looks at, default value is ["repositories"], 
         */
        repositoryDirs: string[];

        /**
         * the respository loader (a function), it loads all respositories under the folders of all repositoryDirs
         * default is FultonClassLoader
         */
        repositoryLoader: FultonClassLoader<Repository<any>>
    }

    /**
     * Logging optons
     */
    logging: {

        /**
         * the default logger logging level
         * default is procces.env["{appName}.options.logging.defaultLoggerLevel"] or "debug" 
         */
        defaultLoggerLevel?: FultonLoggerLevel;

        /**
         * if not null, reset winstion default logger with this value, the default value is null
         * 
         * ## example
         * ```
         * option.defaultLoggerOptions = {
         *      level: "debug",
         *      transports: [new winston.transports.Console()]
         * }
         * ```
         */
        defaultLoggerOptions?: FultonLoggerOptions;

        /**
         * enable default logger console transport colorized
         * default is procces.env["{appName}.options.logging.defaultLoggerColorized"] or true
         */
        defaultLoggerColorized?: boolean;

        /**
         * if true, app will logs every http requests.
         * default is procces.env["${appName}.options.logging.httpLoggerEnabled"] or false
         */
        httpLoggerEnabled: boolean;

        /**
         * the options for http logger, default is console, 
         * ignore, if httpLogMiddleware has values
         * ```
         * option.httpLogOptions = {
         *      level: "debug",
         *      transports: [new winston.transports.Console()]
         * }
         * ```
         */
        httpLoggerOptions?: FultonLoggerOptions;

        /**
         * custom middlewares for http logging, like morgan or others
         */
        httpLoggerMiddlewares?: Middleware[];
    }

    /**
     * the settings for serving static files
     */
    staticFile: {
        /**
         * if true, app will serve static files.
         * default is procces.env["{appName}.options.staticFile.enabled] or false
         */
        enabled: boolean;

        //TODO: implement it
    }

    /**
     * the settings for cors
     */
    cors: {
        /**
         * if true, app will enable cors.
         * default is procces.env["{appName}.options.cors.enabled] or false
         */
        enabled: boolean;

        //TODO: implement it
    }

    /**
     * the settings for http and https servers
     */
    server: {
        /**
         * if true, start a http server
         * default is procces.env["{appName}.options.server.httpEnabled] or true
         */
        httpEnabled: boolean,

        /**
         * if true, start a https server
         * default is procces.env["{appName}.options.server.httpsEnabled] or false
         */
        httpsEnabled: boolean,

        /**
         * the port for http
         * default is procces.env["{appName}.options.server.httpPort"] or 80
         */
        httpPort: number,

        /**
         * the port for https 
         * default is procces.env["{appName}.options.server.httpsPort"] or 443
         */
        httpsPort: number,

        /**
         * ssl options, must to provide if httpsEnabled is true.
         */
        sslOptions?: https.ServerOptions,
    }

    constructor(private appName: string) {
        this.index = {
            enabled: false
        };

        this.logging = {
            defaultLoggerColorized: true,
            httpLoggerEnabled: false,
            httpLoggerMiddlewares: []
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
            httpEnabled: true,
            httpsEnabled: false,
            httpPort: 80,
            httpsPort: 443
        }

        this.staticFile = {
            enabled: false
        }

        this.cors = {
            enabled: false
        }
    }

    loadEnvOptions() {
        let prefix = `${this.appName}.options`;

        this.index.enabled = Env.getBoolean(`${prefix}.index.enabled`, this.index.enabled)

        this.logging.defaultLoggerLevel = Env.get(`${prefix}.logging.defaultLoggerLevel`, this.logging.defaultLoggerLevel) as FultonLoggerLevel        
        this.logging.defaultLoggerColorized = Env.getBoolean(`${prefix}.logging.defaultLoggerColorized`, this.logging.defaultLoggerColorized)
        this.logging.httpLoggerEnabled = Env.getBoolean(`${prefix}.logging.httpLoggerEnabled`, this.logging.httpLoggerEnabled)

        this.loader.routerLoaderEnabled = Env.getBoolean(`${prefix}.loader.routerLoaderEnabled`, this.loader.routerLoaderEnabled)
        this.loader.serviceLoaderEnabled = Env.getBoolean(`${prefix}.loader.serviceLoaderEnabled`, this.loader.serviceLoaderEnabled)
        this.loader.repositoryLoaderEnabled = Env.getBoolean(`${prefix}.loader.repositoryLoaderEnabled`, this.loader.repositoryLoaderEnabled)

        this.server.httpEnabled = Env.getBoolean(`${prefix}.server.httpEnabled`, this.server.httpEnabled)
        this.server.httpsEnabled = Env.getBoolean(`${prefix}.server.httpsEnabled`, this.server.httpsEnabled)
        
        this.server.httpPort = Env.getInt(`${prefix}.server.httpPort`, this.server.httpPort)
        this.server.httpsPort = Env.getInt(`${prefix}.server.httpsPort`, this.server.httpsPort)


        this.staticFile.enabled = Env.getBoolean(`${prefix}.staticFile.enabled`, this.staticFile.enabled)
        this.cors.enabled = Env.getBoolean(`${prefix}.cors.enabled`, this.cors.enabled)

        this.loadEnvDatabaseOptions();
    }

    loadEnvDatabaseOptions() {
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