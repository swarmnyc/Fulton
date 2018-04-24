import * as lodash from 'lodash';
import { AppMode, Middleware, Type } from '../interfaces';
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
import { MiscellaneousOptions } from './miscellaneous-options';
import { NotificationOptions } from './notification-options';
import { Provider } from '../helpers';
import { ServerOptions } from './server-options';
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
    docs = new DocOptions();

    /**
     * the settings for http and https servers
     */
    server = new ServerOptions();

    notification = new NotificationOptions();

    miscellaneous = new MiscellaneousOptions();

    //TODO: implement compression
    compression = {};

    constructor(private appName: string, private appMode: AppMode) {}

    /**
     * init options and load values from environment
     */
    init() {
        this.identity.init();

        for (const name of Object.getOwnPropertyNames(this)) {
            var prop = lodash.get(this, name);

            if (prop && prop.init) {
                prop.init(this.appName);
            }
        }
    }
}