import * as express from 'express';
import * as https from 'https';
import * as lodash from 'lodash';
import * as path from 'path';
import * as winston from 'winston';

import { AppMode, ErrorMiddleware, Middleware, PathIdentifier } from './interfaces';
import { ConnectionOptions, Repository } from 'typeorm';
import { FultonClassLoader, defaultClassLoader } from './helpers/module-helpers';
import { FultonLoggerLevel, FultonLoggerOptions } from './fulton-log';
import { FultonRouter, FultonService, Type } from './index';
import { Provider, TypeProvider } from './helpers/type-helpers';
import { default404ErrorHandler, defaultErrorHandler, queryParamsParser } from './middlewares';

import { CorsOptions } from 'cors';
import Env from './helpers/env';
import Helper from './helpers/helper';
import { IdentityOptions } from './identity/identity-options';
import { ServeStaticOptions } from 'serve-static';

export class FultonAppOptions {
    // generate api doc
    //enabledApiDoc: boolean;

    // default is /api/docs
    // apiDocPath: string;

    /**
     * User manager and authentication based on passport
     */
    identity: IdentityOptions;

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
         * If true, log every http request.
         * The default is true.
         * It can be overrided by procces.env["{appName}.options.index.enabled"]
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
     * error and 404 middlewares, they will be placed on the last.
     */
    errorHandler: {
        /**
         * middlewares for error, default is [fultonDefaultErrorHandler]
         */
        errorMiddlewares?: ErrorMiddleware[],

        /**
         * middlewares for 404 error, default is [fultonDefault404ErrorHandler]
         */
        error404Middlewares?: Middleware[]
    }

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
     * @Entity()
     * class Food { }
     * 
     * @Repository(Food)
     * class FoodRepository extends MongoRepository<Food> {
     * }
     * ```
     */
    repositories: TypeProvider[] = [];

    /**
     * Define injections for the repositories
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
    services: Provider[] = [];

    /**
     * the entities for typeorm, the value will concatenate all database CollectionOptions.entities
     * you can directly defien enitiies on each CollectionOptions
     * typeorm will automatically road entities under ./entities
     */
    entities: Type[] = [];

    formatter: {
        /**
         * if true, add express.json() as a middleware
         * the default value is true
         */
        json: boolean;
        /**
         * if true, add fultonjsonapiParser() as a middleware
         * the default value is true
         */
        jsonApi: boolean;
        /**
         * if true, add express.urlencoded({ extended: true })() as a middleware
         * the default value is true
         */
        form: boolean;
        /**
         * other custom middlewares
         */
        customs: Middleware[];
    }

    /**
     * app level custom middlewares, they will be placed before routers
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
         * the default value is false
         * It can be overrided by procces.env["{appName}.options.loader.routerLoaderEnabled"]
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
        routerLoader: FultonClassLoader<FultonRouter>;

        /**
         * if true, Fulton will load services based on serviceDirs automatically 
         * the default value is false
         * It can be overrided by procces.env["{appName}.options.loader.serviceLoaderEnabled"]
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
        serviceLoader: FultonClassLoader<FultonService>;

        /**
         * if true, Fulton will load repositories based on repositoryDirs automatically
         * the default value is false
         * It can be overrided by procces.env["{appName}.options.loader.repositoryLoaderEnabled"] 
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
        repositoryLoader: FultonClassLoader<Repository<any>>;
    }

    /**
     * Logging optons
     */
    logging: {

        /**
         * the default logger logging level
         * default is "debug"
         * It can be overrided by procces.env["{appName}.options.logging.defaultLoggerLevel"]
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
         * the default value is true
         * It can be overrided by procces.env["{appName}.options.logging.defaultLoggerColorized"]
         */
        defaultLoggerColorized?: boolean;

        /**
         * if true, app will logs every http requests.
         * the default value is true
         * It can be overrided by procces.env["${appName}.options.logging.httpLoggerEnabled"]
         */
        httpLoggerEnabled: boolean;

        /**
         * the options for http logger, it is winston options 
         * this value will be ignored, if httpLogMiddlewares is not empty
         * 
         * ### default value
         * ```
         * option.httpLogOptions =  {
         *      console: {
         *          colorize: true,
         *          level: "info",
         *          showLevel: false,
         *          label: "Http"
         *      }
         * }
         * ```
         */
        httpLoggerOptions?: FultonLoggerOptions;

        /**
         * custom middlewares for http logging, like morgan or others
         * default is []
         */
        httpLoggerMiddlewares?: Middleware[];
    }

    /**
     * the options for serving static files
     */
    staticFile: {
        /**
         * if true, app will serve static files.
         * the default value is false
         * It can be overrided by procces.env["{appName}.options.staticFile.enabled]
         */
        enabled?: boolean;

        /**
         * the folders and options of static files.
         * the default value is [], this value will be ignored if middlewares is not empty.
         * 
         * ## equivalent
         * ```
         * // if path is null
         * app.use(express.static(folder, options))
         * 
         * // if path is not null
         * app.use(path, express.static(folder, options))
         * ```
         */
        folders?: {
            path?: PathIdentifier;
            folder: string;
            options?: ServeStaticOptions;
        }[]


        /**
         * custom middlewares for serving static files
         * default is []
         * ## equivalent
         * ```
         * // if path is null
         * app.use(middleware)
         * 
         * // if path is not null
         * app.use(path, middleware)
         * ```
         */
        middlewares?: {
            path?: PathIdentifier;
            middleware: Middleware;
        }[]
    }

    /**
     * app level cors middlewares
     */
    cors: {
        /**
         * if true, app will enable cors.
         * the default value is false
         * It can be overrided by procces.env["{appName}.options.cors.enabled]
         */
        enabled: boolean;

        /**
         * the options for cors.
         * the default value is null, 
         * this value will be ignored if middlewares is not empty.
         * 
         * ## equivalent
         * ```
         * app.use(cors.static(options))
         * ```
         */
        options?: CorsOptions;

        /**
         * custom middlewares for cors
         */
        middlewares?: Middleware[]
    }

    /**
     * the settings for http and https servers
     */
    server: {
        /**
         * if true, start a http server
         * the default value is true
         * It can be overrided by procces.env["{appName}.options.server.httpEnabled]
         */
        httpEnabled: boolean,

        /**
         * if true, start a https server
         * the default value is false
         * It can be overrided by procces.env["{appName}.options.server.httpsEnabled]
         */
        httpsEnabled: boolean,

        /**
         * the port for http
         * the default value is 80
         * It can be overrided by procces.env["{appName}.options.server.httpPort"]
         */
        httpPort: number,

        /**
         * the port for https 
         * the default value is 443
         * It can be overrided by procces.env["{appName}.options.server.httpsPort"]
         */
        httpsPort: number,

        /**
         * ssl options, must to provide if httpsEnabled is true.
         */
        sslOptions?: https.ServerOptions,

        /**
         * if true, app will start in cluster mode
         * the default value is false
         * It can be overrided by procces.env["{appName}.options.server.clusterEnabled]
         */
        clusterEnabled?: boolean

        /**
         * the number of worker for cluster
         * the default value is 0, which will use the number of cup cores
         * It can be overrided by procces.env["{appName}.options.server.clusterWorkerNumber]
         */
        clusterWorkerNumber?: number
    }

    compression: {
        //TODO: implement compression
    }

    constructor(private appName: string, private appMode: AppMode) {
        this.index = {
            enabled: true
        };

        this.logging = {
            defaultLoggerColorized: true,
            httpLoggerEnabled: true,
            httpLoggerOptions: {
                console: {
                    colorize: true,
                    level: "info",
                    showLevel: false,
                    label: "Http"
                }
            },
            httpLoggerMiddlewares: []
        };

        this.errorHandler = {
            errorMiddlewares: [defaultErrorHandler],
            error404Middlewares: [default404ErrorHandler]
        };

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
            httpsPort: 443,
            clusterEnabled: false,
            clusterWorkerNumber: 0
        };

        this.staticFile = {
            enabled: false,
            folders: [],
            middlewares: []
        };

        this.cors = {
            enabled: false,
            options: null,
            middlewares: []
        };

        this.formatter = {
            json: true,
            jsonApi: true,
            form: true,
            customs: []
        };

        this.identity = new IdentityOptions(this.appName, this.appMode);
    }

    /**
     * load options from environment to override the current options 
     */
    loadEnvOptions() {
        let prefix = `${this.appName}.options`;

        let envValues = {
            index: {
                enabled: Env.getBoolean(`${prefix}.index.enabled`)
            },
            logging: {
                defaultLoggerLevel: Env.get(`${prefix}.logging.defaultLoggerLevel`),
                defaultLoggerColorized: Env.getBoolean(`${prefix}.logging.defaultLoggerColorized`),
                httpLoggerEnabled: Env.getBoolean(`${prefix}.logging.httpLoggerEnabled`)
            },
            loader: {
                routerLoaderEnabled: Env.getBoolean(`${prefix}.loader.routerLoaderEnabled`),
                serviceLoaderEnabled: Env.getBoolean(`${prefix}.loader.serviceLoaderEnabled`),
                repositoryLoaderEnabled: Env.getBoolean(`${prefix}.loader.repositoryLoaderEnabled`)
            },
            server: {
                httpEnabled: Env.getBoolean(`${prefix}.server.httpEnabled`),
                httpsEnabled: Env.getBoolean(`${prefix}.server.httpsEnabled`),
                httpPort: Env.getInt(`${prefix}.server.httpPort`),
                httpsPort: Env.getInt(`${prefix}.server.httpsPort`),
                clusterEnabled: Env.getBoolean(`${prefix}.server.clusterEnabled`),
                clusterWorkerNumber: Env.getInt(`${prefix}.server.clusterWorkerNumber`)
            },
            staticFile: {
                enabled: Env.getBoolean(`${prefix}.staticFile.enabled`)
            },
            cors: {
                enabled: Env.getBoolean(`${prefix}.cors.enabled`)
            }
        } as FultonAppOptions;

        let customer = (a: any, b: any): any => {
            if (typeof a == "object") {
                if (a instanceof IdentityOptions) {
                    return a
                }

                return lodash.assignWith(a, b, customer);
            } else {
                return b == null ? a : b;
            }
        }

        lodash.assignWith(this, envValues, customer);

        this.identity.loadEnvOptions();
        this.loadEnvDatabaseOptions();
    }

    /**
     * load database options from environment to override the current database options 
     */
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