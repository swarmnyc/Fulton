import * as cors from 'cors';
import * as express from "express";
import * as http from 'http';
import * as https from 'https';
import * as lodash from 'lodash';
import * as path from 'path';
import * as winston from 'winston';

import { AppMode, DiContainer, DiKeys, ErrorMiddleware, EventKeys, Middleware, RepositoryFactory, Request, Response, Type, TypeIdentifier } from './interfaces';
import { ClassProvider, FactoryProvider, FunctionProvider, Provider, TypeProvider, ValueProvider } from "./helpers/type-helpers";
import { Connection, Repository } from 'typeorm';
import { IUser, IUserService } from "./identity/interfaces";

import { EntityMetadata } from 'typeorm/metadata/EntityMetadata';
import { EntityMetadataHelper } from "./helpers/entity-metadata-helper";
import { Env } from "./helpers/env";
import { EventEmitter } from 'events';
import { Express } from "express";
import { FultonAppOptions } from "./fulton-app-options";
import { FultonLog } from "./fulton-log";
import { MimeTypes } from './constants';
import { Router } from "./routers/router";
import { Service } from "./services";
import { defaultHttpLoggerHandler } from "./middlewares/http-logger";
import { fultonDebug } from "./helpers/debug";

// don't load too modules classes here, it will cause cyclical dependencies and cause very hard to debug and wired Error.

export interface IFultonApp {
    readonly appName: string;

    express: Express;

    container: DiContainer;

    options: FultonAppOptions;

    events: EventEmitter;

    userService: IUserService<IUser>;

    httpServer: http.Server;

    httpsServer: https.Server;

    connections: Connection[];

    entityMetadatas: Map<Type, EntityMetadata>;

    routers: Router[];

    getLocalData(key: string): any;

    setLocalData(key: string, value: any): void;
}

/**
 * The app of Fulton Server, it is the main class of Fulton Server
 * 
 * `onInit` is the required function when extends from FultonApp
 */
export abstract class FultonApp implements IFultonApp {
    private isInitialized: boolean = false;

    /**
     * app name, use in output, parser. default is class name.
     */
    appName: string;

    /**
     * the instance of Express, created during init().
     */
    express: Express;

    /**
     * Dependency Injection container, created during init()
     */
    container: DiContainer;

    /**
     * options for Fulton
     */
    options: FultonAppOptions;

    /**
     * the EventEmitter, every init{name} will emit didInit{name} event
     * 
     * ## example
     * ```
     * app.events.on("didInitRouters", (app:FultonApp)=>{});
     * ```
     */
    events: EventEmitter;

    /**
     * user service, created during init() if options.identity.enabled = true.
     */
    userService: IUserService<IUser>;

    /**
     * the instance of http server of nodejs, created during start()
     */
    httpServer: http.Server;

    /**
     * the instance of https server of nodejs, created during start()
     */
    httpsServer: https.Server;

    /**
     * database connections, created during init();
     */
    connections: Connection[];

    /**
     * the metadatas of the entities, which added after initDatabases
     */
    entityMetadatas: Map<Type, EntityMetadata>;

    /**
     * routers, created during initRouters();
     */
    routers: Router[];

    /**
     * @param mode There are some different default values for api and web-view. 
     */
    constructor(public readonly mode: AppMode = "api") {
        this.appName = this.constructor.name;
        this.options = new FultonAppOptions(this.appName, mode);
        this.events = new EventEmitter();
        this.entityMetadatas = new Map();
        this.connections = [];
        this.routers = [];
    }

    /**
     * get data from res.locals[key], and use Zone to manage context
     */
    getLocalData(key: string): any {
        if (this.options.settings.zoneEnabled) {
            let res: Response = Zone.current.get("res");
            if (res) {
                return res.locals[key];
            }
        }
    }

    /**
     * set data from res.locals[key], and use Zone to manage context
     */
    setLocalData(key: string, value: any) {
        if (this.options.settings.zoneEnabled) {
            let res: Response = Zone.current.get("res");
            if (res) {
                res.locals[key] = value;
            }
        }
    }

    /**
     * initialize FultonApp. It will be called on start(), if the app isn't initialized;
     * it can be run many times, every times call this will reset all the related objects
     */
    async init(): Promise<void> {
        await this.initServer();

        await this.initDiContainer();

        await this.onInit(this.options);
        this.options.loadEnvOptions();

        await this.initLogging();

        await this.initProviders();

        await this.initDatabases();

        await this.initRepositories();

        await this.initServices();

        /* start express middlewares */
        await this.initHttpLogging();

        await this.initCors();

        await this.initFormatter();

        await this.initIdentity();

        await this.initIndex();

        await this.initStaticFile();

        await this.initMiddlewares();

        await this.initRouters();

        await this.initDocs();

        await this.initErrorHandler();
        /* end express middlewares */

        this.isInitialized = true;
        this.events.emit(EventKeys.didInit, this);

        fultonDebug("Options: %O", this.options);
    }

    /**
     * start http server or https server. if it isn't initialized, it will call init(), too.
     */
    async start(): Promise<any> {
        //TODO: implements cluster mode.

        if (!this.isInitialized) {
            await this.init().catch((err) => {
                FultonLog.error(`${this.appName} failed to initialization`, err);
                throw err;
            });
        }

        if (this.options.settings.zoneEnabled) {
            require("zone.js");
        }

        if (this.httpServer || this.httpsServer) {
            throw new Error(`${this.appName} is still running`);
        }

        var tasks = [];

        if (this.options.server.httpEnabled) {
            tasks.push(new Promise((resolve, reject) => {
                this.httpServer = http
                    .createServer(this.serve)
                    .on("error", (error) => {
                        FultonLog.error(`${this.appName} failed to start http server on port ${this.options.server.httpPort}`);
                        this.httpServer = null;
                        reject(error);
                    })
                    .listen(this.options.server.httpPort, () => {
                        FultonLog.info(`${this.appName} is running http server on port ${this.options.server.httpPort}`)
                        resolve()
                    });

            }));
        }

        if (this.options.server.httpsEnabled) {
            tasks.push(new Promise((resolve, reject) => {
                if (!this.options.server.sslOptions) {
                    let error = `${this.appName} failed to start because https is enabled but sslOption was given`;
                    FultonLog.error(error);
                    reject(error);
                    return;
                }

                this.httpsServer = https
                    .createServer(this.options.server.sslOptions, this.serve)
                    .on("error", (error) => {
                        FultonLog.error(`${this.appName} failed to start https server on port ${this.options.server.httpsPort}`);
                        this.httpsServer = null;
                        reject(error);
                    })
                    .listen(this.options.server.httpsPort, () => {
                        FultonLog.info(`${this.appName} is running https server on port ${this.options.server.httpsPort}`);
                        resolve()
                    });
            }));
        }

        return Promise.all(tasks);
    }

    /**
     * stop http server or https server
     */
    stop(): Promise<any> {
        var tasks: Promise<any>[] = [];

        if (this.connections) {
            tasks.push(...this.connections.map((conn) => conn.close()));
        }

        if (this.httpServer) {
            tasks.push(new Promise((resolve, reject) => {
                this.httpServer.close(() => {
                    FultonLog.info(`${this.appName} stopped http server`);
                    resolve();
                })
            }));
        }

        if (this.httpsServer) {
            tasks.push(new Promise((resolve, reject) => {
                this.httpServer.close(() => {
                    FultonLog.info(`${this.appName} stopped https server`);
                    resolve();
                })
            }));
        }

        return Promise.all(tasks);
    }

    protected initServer(): void | Promise<void> {
        this.express = express();
        this.express.request.constructor.prototype.fultonApp = this;

        this.express.disable('x-powered-by');

        this.events.emit(EventKeys.didInitServer, this);
    }

    protected initDiContainer(): void | Promise<void> {
        return require('./initializers/di-initializer')(this);
    }

    protected initLogging(): void | Promise<void> {
        if (this.options.logging.defaultLoggerLevel) {
            FultonLog.level = this.options.logging.defaultLoggerLevel;
        }

        if (this.options.logging.defaultLoggerOptions) {
            FultonLog.configure(this.options.logging.defaultLoggerOptions);
        }

        if (this.options.logging.defaultLoggerColorized) {
            if (winston.default.transports.console) {
                (winston.default.transports.console as any).colorize = true;
            }
        }

        this.events.emit(EventKeys.didInitLogging, this);
    }

    protected initProviders(): void | Promise<void> {
        this.registerTypes(this.options.providers || []);

        this.events.emit(EventKeys.didInitProviders, this);
    }

    /**
     * init databases, it will be ignored if repository is empty.
     */
    protected initDatabases(): Promise<void> {
        return require('./initializers/database-initializer')(this);
    }

    protected async initRepositories(): Promise<void> {
        let providers = this.options.repositories || [];
        if (this.options.loader.repositoryLoaderEnabled) {
            let dirs = this.options.loader.repositoryDirs.map((dir) => path.join(this.options.loader.appDir, dir));
            let loadedProviders = await this.options.loader.repositoryLoader(dirs, true) as TypeProvider[];
            providers = loadedProviders.concat(providers);
        }

        // repositories needs to be singleton to integrate typeorm and inversify
        let factory = this.container.get<RepositoryFactory>(DiKeys.RepositoryFactory);
        let newProviders: ValueProvider[] = providers.map((provider) => {
            return {
                provide: provider,
                useValue: factory(provider)
            }
        });

        this.registerTypes(newProviders);

        this.events.emit(EventKeys.didInitRepositories, this);
    }

    protected async initServices(): Promise<void> {
        let providers = this.options.services || [];
        if (this.options.loader.serviceLoaderEnabled) {
            let dirs = this.options.loader.serviceDirs.map((dir) => path.join(this.options.loader.appDir, dir));
            let loadedProviders = await this.options.loader.serviceLoader(dirs, true) as Provider[];
            providers = loadedProviders.concat(providers);
        }

        this.registerTypes(providers);

        this.events.emit(EventKeys.didInitServices, this);
    }

    protected initIdentity(): void | Promise<void> {
        if (this.options.identity.enabled) {
            // won't load passport-* modules if it is not enabled;
            let promise: Promise<any> = (require("./identity/identity-initializer")(this));

            return promise.then(() => {
                this.events.emit(EventKeys.didInitIdentity, this);
            })
        } else {
            return;
        }
    }

    protected async initRouters(): Promise<void> {
        let providers = this.options.routers || [];
        if (this.options.loader.routerLoaderEnabled) {
            let dirs = this.options.loader.routerDirs.map((dir) => path.join(this.options.loader.appDir, dir));
            let loadProviders = await this.options.loader.routerLoader(dirs, true) as Provider[];
            providers = loadProviders.concat(providers);
        }

        let ids = this.registerTypes(providers, true);

        this.routers = ids.map((id) => {
            let router = this.container.get<Router>(id);

            router.init(); //register router to express

            return router;
        });

        this.events.emit(EventKeys.didInitRouters, this);
    }

    protected initHttpLogging(): void | Promise<void> {
        if (this.options.logging.httpLoggerEnabled) {
            if (lodash.some(this.options.logging.httpLoggerMiddlewares)) {
                this.express.use(...this.options.logging.httpLoggerMiddlewares);
            } else if (this.options.logging.httpLoggerOptions) {
                this.express.use(defaultHttpLoggerHandler(this.options.logging.httpLoggerOptions));
            }

            this.events.emit(EventKeys.didInitHttpLogging, this);
        }
    }

    protected initStaticFile(): void | Promise<void> {
        if (this.options.staticFile.enabled) {
            if (lodash.some(this.options.staticFile.middlewares)) {
                this.options.staticFile.middlewares.forEach(opt => {
                    if (opt.path) {
                        this.express.use(opt.path, opt.middleware);
                    } else {
                        this.express.use(opt.middleware);
                    }
                });
            } else {
                this.options.staticFile.folders.forEach(opt => {
                    if (opt.path) {
                        this.express.use(opt.path, express.static(opt.folder, opt.options));
                    } else {
                        this.express.use(express.static(opt.folder, opt.options));
                    }
                })
            }

            this.events.emit(EventKeys.didInitStaticFile, this);
        }
    }

    protected initCors(): void | Promise<void> {
        if (this.options.cors.enabled) {
            if (lodash.some(this.options.cors.middlewares)) {
                this.express.use(...this.options.cors.middlewares);
            } else {
                this.express.use(cors(this.options.cors.options));
            }

            this.events.emit(EventKeys.didInitCors, this);
        }
    }

    protected initMiddlewares(): void | Promise<void> {
        if (lodash.some(this.options.middlewares)) {
            this.express.use(...this.options.middlewares);

            this.events.emit(EventKeys.didInitMiddlewares, this);
        }
    }

    protected initFormatter(): void | Promise<void> {
        require("./initializers/formatter-initializer")(this);
    }

    protected initIndex(): void | Promise<void> {
        if (!this.options.index.enabled) {
            return
        }

        if (this.options.index.handler) {
            this.express.all("/", this.options.index.handler);
        } else if (this.options.index.filepath) {
            this.express.all("/", (res, req) => {
                req.sendFile(path.resolve(this.options.index.filepath));
            });
        } else if (this.options.index.message) {
            this.express.all("/", (res, req) => {
                req.send(this.options.index.message);
            });
        }

        this.events.emit(EventKeys.didInitIndex, this);
    }

    protected initErrorHandler(): void | Promise<void> {
        if (this.options.errorHandler) {
            if (lodash.some(this.options.errorHandler.error404Middlewares)) {
                this.express.use(...this.options.errorHandler.error404Middlewares);
            }

            if (lodash.some(this.options.errorHandler.errorMiddlewares)) {
                this.express.use(...this.options.errorHandler.errorMiddlewares);
            }

            this.events.emit(EventKeys.didInitErrorHandler, this);
        }
    }

    protected initDocs(): void | Promise<void> {
        if (this.options.docs.enabled) {
            require("./initializers/docs-initializer")(this);
        }
    }

    protected registerTypes(providers: Provider[], singleton?: boolean): TypeIdentifier[] {
        let ids: TypeIdentifier[] = [];

        if (providers == null)
            return ids;

        for (const provider of providers as Provider[]) {
            if (provider instanceof Function) {
                if (this.container.isBound(provider)) {
                    this.container.unbind(provider);
                }

                let binding = this.container.bind(provider as TypeProvider).toSelf();
                if (singleton == true) {
                    binding.inSingletonScope();
                }

                ids.push(provider);

                continue;
            }

            if (this.container.isBound(provider.provide)) {
                this.container.unbind(provider.provide);
            }

            if ((<ValueProvider>provider).useValue) {
                this.container.bind(provider.provide).toConstantValue((<ValueProvider>provider).useValue);
            } else if ((<ClassProvider>provider).useClass) {
                let binding = this.container.bind(provider.provide).to((<ClassProvider>provider).useClass);

                if ((<ClassProvider>provider).useSingleton == true || singleton) {
                    binding.inSingletonScope();
                }
            } else if ((<FactoryProvider>provider).useFactory) {
                this.container.bind(provider.provide).toFactory((ctx) => {
                    return (<FactoryProvider>provider).useFactory(ctx.container);
                });
            } else if ((<FunctionProvider>provider).useFunction) {
                let binding = this.container.bind(provider.provide).toDynamicValue((ctx) => {
                    return (<FunctionProvider>provider).useFunction(ctx.container);
                });

                if ((<FunctionProvider>provider).useSingleton == true || singleton) {
                    binding.inSingletonScope();
                }
            }

            ids.push(provider.provide);
        }

        return ids;
    }

    // events

    /**
     * to init the app. Env values for options will be loaded after onInit.
     * @param options the options for start app
     */
    protected abstract onInit(options: FultonAppOptions): void | Promise<void>;

    private serve = (req: any, res: any) => {
        if (this.options.settings.zoneEnabled) {
            Zone.current.fork({
                name: this.appName,
                properties: { req, res },
                onHandleError: (parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone, error: any) => {
                    this.options.errorHandler.errorMiddlewares.forEach((handler) => {
                        handler(error, req, res, null)
                    });

                    return false;
                }
            }).run(() => {
                this.express(req, res);
            });
        } else {
            this.express(req, res);
        }
    }
}