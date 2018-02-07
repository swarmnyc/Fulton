import * as cors from 'cors';
import * as express from "express";
import * as http from 'http';
import * as https from 'https';
import * as lodash from 'lodash';
import * as path from 'path';
import * as winston from 'winston';

import { AppMode, DiContainer, ErrorMiddleware, Middleware, RepositoryFactory, Request, Response } from "./interfaces";
import { ClassProvider, FactoryProvider, FunctionProvider, Provider, Type, TypeIdentifier, TypeProvider, ValueProvider } from "./helpers/type-helpers";
import { Connection, ConnectionOptions, Repository, createConnections } from "typeorm";
import { IUser, IUserService } from "./identity";

import { Container } from "inversify";
import { EntityMetadataHelper } from "./helpers/entity-metadata-helper";
import Env from "./helpers/env";
import { EventEmitter } from 'events';
import { Express } from "express";
import { FultonAppOptions } from "./fulton-app-options";
import FultonLog from "./fulton-log";
import { JsonApiConverter } from './helpers/jsonapi-converter';
import { MimeTypes } from './constants';
import { Router } from "./routers/router";
import { Service } from "./services";
import { defaultHttpLoggerHandler } from "./middlewares/http-logger";
import { fultonDebug } from "./helpers/debug";
import { getRepositoryMetadata } from "./entities/repository-decorator-helper";
import { queryParamsParser } from './middlewares/query-params-parser';

export abstract class FultonApp {
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
    }

    /**
     * initialize FultonApp. It will be called on start(), if the app isn't initialized;
     * it can be run many times, everytime call this will reset all the related objects
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

        await this.initErrorHandler();
        /* end express middlewares */

        this.isInitialized = true;
        this.events.emit("didInit", this);

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

        if (this.httpServer || this.httpsServer) {
            throw new Error(`${this.appName} is still running`);
        }

        var tasks = [];

        if (this.options.server.httpEnabled) {
            tasks.push(new Promise((resolve, reject) => {
                this.httpServer = http
                    .createServer(this.express)
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
                    .createServer(this.options.server.sslOptions, this.express)
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
                    FultonLog.info(`${this.appName} stoped http server`);
                    resolve();
                })
            }));
        }

        if (this.httpsServer) {
            tasks.push(new Promise((resolve, reject) => {
                this.httpServer.close(() => {
                    FultonLog.info(`${this.appName} stoped https server`);
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

        this.events.emit("didInitServer", this);
    }

    protected initDiContainer(): void | Promise<void> {
        this.container = new Container();

        require("./initializers/di-initializer")(this, this.container);
        this.events.emit("didInitDiContainer", this);
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

        this.events.emit("didInitLogging", this);
    }

    protected initProviders(): void | Promise<void> {
        this.registerTypes(this.options.providers || []);

        this.events.emit("didInitProviders", this);
    }

    /**
     * init databases, it will be ignored if repository is empty.
     */
    protected async initDatabases(): Promise<void> {
        if (this.options.identity.isUseDefaultImplement) {
            // add User Entity to typeorm if identity is enabled and use FultonUser and FultonUserService
            this.options.entities.push(this.options.identity.userType);
        } else if (this.options.databases.size == 0) {
            // if databases = 0 and repositories = 0, skip initDatabases
            if (lodash.isEmpty(this.options.repositories) && this.options.loader.repositoryLoaderEnabled == false)
                return;
        }

        let connOptions: ConnectionOptions[] = [];

        this.options.databases.forEach((conn, name) => {
            lodash.set(conn, "name", name);

            // extends entities
            if (lodash.some(this.options.entities)) {
                if (conn.entities) {
                    let arr = conn.entities as any[];
                    arr.push(this.options.entities);
                } else {
                    lodash.set(conn, "entities", this.options.entities);
                }
            }

            connOptions.push(conn);
        });


        this.connections = await createConnections(connOptions).catch((error) => {
            FultonLog.error("initDatabases fails", error);
            throw error;
        });

        this.events.emit("didInitDatabases", this);
    }

    protected async initRepositories(): Promise<void> {
        let providers = this.options.repositories || [];
        if (this.options.loader.repositoryLoaderEnabled) {
            let dirs = this.options.loader.repositoryDirs.map((dir) => path.join(this.options.loader.appDir, dir));
            let loadedProviders = await this.options.loader.repositoryLoader(dirs, true) as TypeProvider[];
            providers = loadedProviders.concat(providers);
        }

        // reposities needs to be singleton to integrate typeorm and inversify
        let factory: RepositoryFactory = this.container.get<any>(Repository);
        let newProviders: ValueProvider[] = providers.map((provider) => {
            return {
                provide: provider,
                useValue: factory(provider)
            }
        });

        this.registerTypes(newProviders);

        this.events.emit("didInitRepositories", this);
    }

    protected async initServices(): Promise<void> {
        let providers = this.options.services || [];
        if (this.options.loader.serviceLoaderEnabled) {
            let dirs = this.options.loader.serviceDirs.map((dir) => path.join(this.options.loader.appDir, dir));
            let loadedProviders = await this.options.loader.serviceLoader(dirs, true) as Provider[];
            providers = loadedProviders.concat(providers);
        }

        this.registerTypes(providers);

        this.events.emit("didInitServices", this);
    }

    protected initIdentity(): void | Promise<void> {
        if (this.options.identity.enabled) {
            // won't load passport-* modules if it is not enabled;
            let promise: Promise<any> = (require("./identity/identity-initializer")(this));

            return promise.then(() => {
                this.events.emit("didInitIdentity", this);
            })
        } else {
            return;
        }
    }

    protected async initRouters(): Promise<void> {
        let prodivers = this.options.routers || [];
        if (this.options.loader.routerLoaderEnabled) {
            let dirs = this.options.loader.routerDirs.map((dir) => path.join(this.options.loader.appDir, dir));
            let loadProviders = await this.options.loader.routerLoader(dirs, true) as Provider[];
            prodivers = loadProviders.concat(prodivers);
        }

        let ids = this.registerTypes(prodivers, true);

        this.routers = ids.map((id) => {
            let router = this.container.get<Router>(id);

            router.init(); //register router to express

            return router;
        });

        this.events.emit("didInitRouters", this);
    }

    protected initHttpLogging(): void | Promise<void> {
        if (this.options.logging.httpLoggerEnabled) {
            if (lodash.some(this.options.logging.httpLoggerMiddlewares)) {
                this.express.use(...this.options.logging.httpLoggerMiddlewares);
            } else if (this.options.logging.httpLoggerOptions) {
                this.express.use(defaultHttpLoggerHandler(this.options.logging.httpLoggerOptions));
            }

            this.events.emit("didInitHttpLogging", this);
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

            this.events.emit("didInitStaticFile", this);
        }
    }

    protected initCors(): void | Promise<void> {
        if (this.options.cors.enabled) {
            if (lodash.some(this.options.cors.middlewares)) {
                this.express.use(...this.options.cors.middlewares);
            } else {
                this.express.use(cors(this.options.cors.options));
            }

            this.events.emit("didInitCors", this);
        }
    }

    protected initMiddlewares(): void | Promise<void> {
        if (lodash.some(this.options.middlewares)) {
            this.express.use(...this.options.middlewares);

            this.events.emit("didInitMiddlewares", this);
        }
    }

    protected initFormatter(): void | Promise<void> {
        if (this.options.formatter.json) {
            let types = [MimeTypes.json]

            if (this.options.formatter.jsonApi) {
                types.push(MimeTypes.jsonApi)
            }

            this.express.use(express.json({ type: types }));
        }

        if (this.options.formatter.form) {
            this.express.use(express.urlencoded({ extended: true }));
        }

        if (this.options.formatter.jsonApi) {
            this.express.use(require("./middlewares/jsonapi")(this));
        }

        if (this.options.formatter.queryParams) {
            this.express.use(queryParamsParser);
        }

        if (lodash.some(this.options.formatter.customs)) {
            this.express.use(...this.options.formatter.customs);
        }

        this.events.emit("didInitFormatter", this);
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

        this.events.emit("didInitIndex", this);
    }

    protected initErrorHandler(): void | Promise<void> {
        if (this.options.errorHandler) {
            if (lodash.some(this.options.errorHandler.error404Middlewares)) {
                this.express.use(...this.options.errorHandler.error404Middlewares);
            }

            if (lodash.some(this.options.errorHandler.errorMiddlewares)) {
                this.express.use(...this.options.errorHandler.errorMiddlewares);
            }

            this.events.emit("didInitErrorHandler", this);
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
}