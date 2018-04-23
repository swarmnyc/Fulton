import * as express from 'express';
import * as https from 'https';
import * as lodash from 'lodash';
import * as path from 'path';
import * as winston from 'winston';

import { AppMode, ErrorMiddleware, Middleware, PathIdentifier, Type } from '../interfaces';
import { ConnectionOptions, Repository } from 'typeorm';
import { FultonClassLoader, Provider, TypeProvider, defaultClassLoader } from '../helpers';
import { FultonLoggerLevel, FultonLoggerOptions } from '../fulton-log';
import { default404ErrorHandler, defaultErrorHandler } from '../middlewares/error-handlers';

import { CorsOptions } from 'cors';
import { Env } from '../helpers/env';
import { Helper } from '../helpers/helper';
import { IdentityOptions } from '../identity/identity-options';
import { InfoObject } from '@loopback/openapi-spec';
import { Router } from '../routers/router';
import { ServeStaticOptions } from 'serve-static';
import { Service } from '../services/service';

export class FultonAppOptions {
    /**
     * User manager and authentication based on passport
     */
    identity: IdentityOptions;

    /**
     * Databases connection options, you can define connection options on FultonApp.onInt(),  
     * and use 
     * `process.env["{appName}.options.databases.{connectionName}.{optionName}"]` to override data.
     * 
     * for example: 
     * FultonApp.options.databases.default.url={url}
     * 
     * and 
     * `process.env["{appName}.options.database.{optionName}"]` is the shortcut of 
     * `process.env["{appName}.options.databases.default.{optionName}"]`
     * 
     * if the map is empty, it will use typeorm.json, for more information see [typeorm](http://typeorm.io/)
     */
    databases: Map<string, ConnectionOptions> = new Map();

    /**
     * behavior for "/" request, only one of three methods can be activated at the same time.
     */
    index: {
        /**
         * If true, log every http request.
         * The default is true.
         * It can be overridden by process.env["{appName}.options.index.enabled"]
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
     * @injectable() 
     * class ApiService {
     *  // apiKey is injected by container when it is created
     *  constructor( @inject("api_key") private apiKey: string) 
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
     * class FoodRouter extends Router {
     * }
     * ```
     */
    routers: Provider[] = [];

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
     * @injectable() 
     * class ApiService {
     *  // apiKey is injected by container when it is created
     *  constructor( @inject("api_key") private apiKey: string) 
     *  }
     * }
     * ```
     */
    services: Provider[] = [];

    /**
     * the entities for typeorm, the value will concatenate all database CollectionOptions.entities
     * you can directly define entities on each CollectionOptions
     * typeorm will automatically road entities under ./entities
     */
    entities: Type[] = [];

    formatter: {
        /**
         * if true, add express.json() as a middleware
         * the default value is true
         */
        json?: boolean;
        /**
         * if true, add fulton Jsonapi() as a middleware
         * if true, have to run `npm install jsonapi-serializer`
         * the default value is false
         */
        jsonApi?: boolean;

        /**
         * if true, add express.urlencoded({ extended: true })() as a middleware
         * the default value is true
         */
        form?: boolean;

        /**
         * it true, add queryParamsParser as a middleware
         */
        queryParams?: boolean;
        /**
         * other custom middlewares
         */
        customs?: Middleware[];
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
         * It can be overridden by process.env["{appName}.options.loader.routerLoaderEnabled"]
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
        routerLoader: FultonClassLoader<Router>;

        /**
         * if true, Fulton will load services based on serviceDirs automatically 
         * the default value is false
         * It can be overridden by process.env["{appName}.options.loader.serviceLoaderEnabled"]
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
        serviceLoader: FultonClassLoader<Service>;
    }

    /**
     * Logging options
     */
    logging: {

        /**
         * the default logger logging level
         * default is "debug"
         * It can be overridden by process.env["{appName}.options.logging.defaultLoggerLevel"]
         */
        defaultLoggerLevel?: FultonLoggerLevel;

        /**
         * if not null, reset winston default logger with this value, the default value is null
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
         * It can be overridden by process.env["{appName}.options.logging.defaultLoggerColorized"]
         */
        defaultLoggerColorized?: boolean;

        /**
         * if true, app will logs every http requests.
         * the default value is true
         * It can be overridden by process.env["${appName}.options.logging.httpLoggerEnabled"]
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
         * It can be overridden by process.env["{appName}.options.staticFile.enabled]
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
         * It can be overridden by process.env["{appName}.options.cors.enabled]
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
     * use swagger to serve docs, see https://swagger.io/specification/.
     * 
     * if the docsFilePath is empty, then Fulton will generate docs dynamically.
     * 
     * you can add a listener on didInitDocs event to modify generated docs
     * ### for example
     * ```
     * this.events.on("didInitDocs", (docs:OpenApiSpec)=>{
     *   // modify the docs
     * });
     * ```
     */
    docs: {
        /**
         * if true, app will enable docs.
         * the default value is false
         * It can be overridden by process.env["{appName}.options.docs.enabled]
         */
        enabled?: boolean;

        /**
         * the path for docs
         * the default value is /docs
         */
        path?: PathIdentifier;

        /** 
         * the access key for the docs, if provided, to access the docs needs key on the url
         * for example `http://localhost:3000/docs?key=the-key`
         * the default value is empty
        */
        accessKey?: string;

        /**
         * use the specific swagger format json file, if you don't want to use Fulton generate docs
         * the default value is empty
         */
        docsFilePath?: string;

        /**        
         * the information of the app. default values are from package.json
         */
        info?: InfoObject;
    }

    /**
     * the settings for http and https servers
     */
    server: {
        /**
         * if true, start a http server
         * the default value is true
         * It can be overridden by process.env["{appName}.options.server.httpEnabled]
         */
        httpEnabled: boolean,

        /**
         * if true, start a https server
         * the default value is false
         * It can be overridden by process.env["{appName}.options.server.httpsEnabled]
         */
        httpsEnabled: boolean,

        /**
         * the port for http
         * the default value is 3000
         * It can be overridden by process.env["{appName}.options.server.httpPort"]
         */
        httpPort: number,

        /**
         * the port for https 
         * the default value is 443
         * It can be overridden by process.env["{appName}.options.server.httpsPort"]
         */
        httpsPort: number,

        /**
         * ssl options, must to provide if httpsEnabled is true.
         */
        sslOptions?: https.ServerOptions,

        /**
         * if true, app will start in cluster mode
         * the default value is false
         * It can be overridden by process.env["{appName}.options.server.clusterEnabled]
         */
        clusterEnabled?: boolean

        /**
         * the number of worker for cluster
         * the default value is 0, which will use the number of cup cores
         * It can be overridden by process.env["{appName}.options.server.clusterWorkerNumber]
         */
        clusterWorkerNumber?: number
    }

    compression: {
        //TODO: implement compression
    }

    notification: {
        email?: {
            templatingFn?: ((template:string, variables: any) => void),
            sendFn?: (() => void),
            smtp?: {
                host?: string,
                port?: string,
                secure?: string,
                auth?: {
                    username?: string,
                    password?: string,
                },
                sender?: {
                    email?: string,
                    name?: string,
                }
            }
        },
        sms?: {
            //TODO: sms notification
        }
    }

    settings: {
        /**
         * the size of a page for pagination.
         * the default value is 20
         */
        paginationSize?: number,
        /**
         * use zone.js for context management.
         * the default value is true
         */
        zoneEnabled?: boolean
    }

    constructor(private appName: string, private appMode: AppMode) {
        this.index = {
            enabled: true,
            message: `${appName} works.`
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
            routerLoader: defaultClassLoader(Router),

            serviceLoaderEnabled: false,
            serviceDirs: ["services"],
            serviceLoader: defaultClassLoader(Service),
        };

        this.server = {
            httpEnabled: true,
            httpsEnabled: false,
            httpPort: 3000,
            httpsPort: 443,
            clusterEnabled: false,
            clusterWorkerNumber: null
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
            jsonApi: false,
            form: true,
            queryParams: true,
            customs: []
        };

        this.settings = {
            paginationSize: 20,
            zoneEnabled: true
        }

        // TODO: get more information
        let info = require(global.process.cwd() + "/package.json");

        this.docs = {
            enabled: false,
            path: "/docs",
            info: {
                title: info.displayName || info.name,
                description: info.description,
                version: info.version
            }
        }

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
                serviceLoaderEnabled: Env.getBoolean(`${prefix}.loader.serviceLoaderEnabled`)
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
            if (a == null && b == null) {
                // lodash don't understand null
                return undefined
            }

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
        let namedReg = new RegExp(`^${this.appName}\\.options\\.databases\\.(\\w+?)\\.(\\w+?)$`, "i");

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

            if (Helper.isBooleanString(value)) {
                options[propName] = Helper.getBoolean(value);
            } else if (Helper.isNumberString(value)) {
                options[propName] = Helper.getFloat(value);
            } else {
                options[propName] = value;
            }
        }
    }
}