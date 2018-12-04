import * as lodash from 'lodash';
import { Middleware } from "../alias";
import { Provider } from '../helpers';
import { IdentityOptions } from '../identity/identity-options';
import { AppMode, Type } from '../interfaces';
import { CacheOptions } from './cache-options';
import { CompressionOptions } from './compression-options';
import { CorsOptions } from './cors-options';
import { DatabaseOptions } from './databases-options';
import { DocOptions } from './doc-options';
import { ErrorHandlerOptions } from './error-handler-options';
import { FormatterOptions } from './formatter-options';
import { IndexOptions } from './index-options';
import { LoaderOptions } from './loader-options';
import { LoggingOptions } from './logging-options';
import { MiscellaneousOptions } from './miscellaneous-options';
import { NotificationOptions } from './notification-options';
import { Options } from './options';
import { SecurityOptions } from './security-options';
import { ServerOptions } from './server-options';
import { StaticFilesOptions } from './static-file-options';

export class FultonAppOptions {
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
     * app level cors middlewares
     */
    readonly cache = new CacheOptions(this.appName, this.appMode);

    /**
     * app level cors middlewares
     */
    readonly cors = new CorsOptions(this.appName, this.appMode);

    /**
     * compress request and response
     */
    readonly compression = new CompressionOptions(this.appName, this.appMode);

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
    readonly databases = new DatabaseOptions(this.appName, this.appMode);

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
    readonly docs = new DocOptions(this.appName, this.appMode);

    /**
     * the options of error and 404 middlewares, they will be placed on the last.
     */
    readonly errorHandler = new ErrorHandlerOptions(this.appName, this.appMode);

    /**
     * the options of request and response format
     */
    readonly formatter = new FormatterOptions(this.appName, this.appMode);

    /**
     * the options of user manager and authentication based on passport
     */
    readonly identity = new IdentityOptions(this.appName, this.appMode);

    /**
     * the options of notification.
     */
    readonly notification = new NotificationOptions(this.appName, this.appMode);

    /**
     * the options of behavior for "/" request, only one of three methods can be activated at the same time.
     */
    readonly index = new IndexOptions(this.appName, this.appMode);

    /**
     * the options of loading modules automatically, default is disabled, 
     * because we want to use Angular style, define types explicitly
     */
    readonly loader = new LoaderOptions(this.appName, this.appMode);

    /**
     * the options of Logging options
     */
    readonly logging = new LoggingOptions(this.appName, this.appMode);

    /**
     * the options of serving static files
     */
    readonly staticFile = new StaticFilesOptions(this.appName, this.appMode);

    /**
     * the options of require security.
     */
    readonly security = new SecurityOptions(this.appName, this.appMode);

    /**
     * the options of http and https servers
     */
    readonly server = new ServerOptions(this.appName, this.appMode);

    /**
     * the options of miscellaneous
     */
    readonly miscellaneous = new MiscellaneousOptions(this.appName, this.appMode);

    constructor(private appName: string, private appMode: AppMode) { }

    /**
     * init options and load values from environment
     */
    init() {
        for (const name of Object.getOwnPropertyNames(this)) {
            var prop: Options = lodash.get(this, name);

            if (prop && prop.init) {
                prop.init();
            }
        }
    }
}