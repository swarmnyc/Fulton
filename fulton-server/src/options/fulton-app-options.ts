import * as https from 'https';
import * as lodash from 'lodash';
import {
    AppMode,
    Middleware,
    Type
    } from '../interfaces';
import { CorsOptions } from './cors-options';
import { DatabaseOptions } from './databases-options';
import { DocOptions } from './doc-options';
import { Env } from '../helpers/env';
import { ErrorHandlerOptions } from './error-handler-options';
import { FormatterOptions } from './formatter-options';
import { IdentityOptions } from '../identity/identity-options';
import { IndexOptions } from './index-options';
import { LoaderOptions } from './loader-options';
import { LoggingOptions } from './logging-options';
import { Provider } from '../helpers';
import { StaticFilesOptions } from './static-file-options';

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
    loader = new LoaderOptions();

    /**
     * Logging options
     */
    logging = new LoggingOptions();

    /**
     * the options for serving static files
     */
    staticFile = new StaticFilesOptions();

    /**
     * app level cors middlewares
     */
    cors = new CorsOptions();

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
    docs = new DocOptions()

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
        this.server = {
            httpEnabled: true,
            httpsEnabled: false,
            httpPort: 3000,
            httpsPort: 443,
            clusterEnabled: false,
            clusterWorkerNumber: null
        };

        this.settings = {
            paginationSize: 20,
            zoneEnabled: true
        }
    }

    /**
     * load options from environment to override the current options 
     */
    init() {
        let prefix = `${this.appName}.options`;

        let envValues = {
            server: {
                httpEnabled: Env.getBoolean(`${prefix}.server.httpEnabled`),
                httpsEnabled: Env.getBoolean(`${prefix}.server.httpsEnabled`),
                httpPort: Env.getInt(`${prefix}.server.httpPort`),
                httpsPort: Env.getInt(`${prefix}.server.httpsPort`),
                clusterEnabled: Env.getBoolean(`${prefix}.server.clusterEnabled`),
                clusterWorkerNumber: Env.getInt(`${prefix}.server.clusterWorkerNumber`)
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

        this.identity.init();

        for (const name of Object.getOwnPropertyNames(this)) {
            var prop = lodash.get(this, name);

            if (prop && prop.init) {
                prop.init(this.appName);
            }
        }
    }
}