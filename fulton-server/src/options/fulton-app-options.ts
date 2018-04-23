import * as https from 'https';
import * as lodash from 'lodash';
import {
    AppMode,
    Middleware,
    PathIdentifier,
    Type
    } from '../interfaces';
import { CorsOptions } from 'cors';
import { DatabaseOptions } from './databases-options';
import { Env } from '../helpers/env';
import { ErrorHandlerOptions } from './error-handler-options';
import { FormatterOptions } from './formatter-options';
import { FultonLoggerLevel, FultonLoggerOptions } from '../fulton-log';
import { IdentityOptions } from '../identity/identity-options';
import { IndexOptions } from './index-options';
import { InfoObject } from '@loopback/openapi-spec';
import { LoaderOptions } from './loader-options';
import { Provider } from '../helpers';
import { ServeStaticOptions } from 'serve-static';

export class FultonAppOptions {
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

    /**
     * app level custom middlewares, they will be placed before routers
     */
    middlewares: Middleware[] = [];

    /**
     * User manager and authentication based on passport
     */
    identity = new IdentityOptions(this.appName, this.appMode);

    /**
     * Databases connection options, you can define connection options on FultonApp.onInt(),  
     * and use 
     * `env["{appName}.options.databases.{connectionName}.{optionName}"]` to override data.
     * 
     * for example: 
     * FultonApp.options.databases.default.url={url}
     * 
     * and 
     * `env["{appName}.options.database.{optionName}"]` is the shortcut of 
     * `env["{appName}.options.databases.default.{optionName}"]`
     */
    databases = new DatabaseOptions();

    /**
     * behavior for "/" request, only one of three methods can be activated at the same time.
     */
    index = new IndexOptions();

    /**
     * error and 404 middlewares, they will be placed on the last.
     */
    errorHandler = new ErrorHandlerOptions();

    /**
     * request and response format
     */
    formatter = new FormatterOptions();

    /**
     * for loading modules automatically, default is disabled, 
     * because we want to use Angular style, define types explicitly
     */
    loader = new LoaderOptions()

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
            templatingFn?: ((template: string, variables: any) => void),
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
    }

    /**
     * load options from environment to override the current options 
     */
    loadEnvOptions() {
        let prefix = `${this.appName}.options`;

        let envValues = {
            logging: {
                defaultLoggerLevel: Env.get(`${prefix}.logging.defaultLoggerLevel`),
                defaultLoggerColorized: Env.getBoolean(`${prefix}.logging.defaultLoggerColorized`),
                httpLoggerEnabled: Env.getBoolean(`${prefix}.logging.httpLoggerEnabled`)
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

        for (const name of Object.getOwnPropertyNames(this)) {
            var prop = lodash.get(this, name);

            if (prop && prop.init) {
                prop.init(this.appName);
            }
        }
    }
}