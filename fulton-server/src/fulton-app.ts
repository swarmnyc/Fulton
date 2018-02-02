import * as cors from 'cors';
import * as express from "express";
import * as http from 'http';
import * as https from 'https';
import * as lodash from 'lodash';
import * as path from 'path';
import * as winston from 'winston';

import { AppMode, ErrorMiddleware, FultonDiContainer, Middleware, Request, Response } from "./interfaces";
import { Connection, ConnectionOptions, createConnections } from "typeorm";
import { Container, interfaces } from "inversify";
import { FultonLoggerLevel, queryParamsParser, EntityService } from "./index";
import { IUser, IUserService } from "./identity";
import { Provider, Type, TypeIdentifier, TypeProvider, ValueProvider } from "./helpers/type-helpers";

import { EntityMetadataHelper } from "./helpers/entity-metadata-helper";
import Env from "./helpers/env";
import { Express } from "express";
import { FultonAppOptions } from "./fulton-app-options";
import FultonLog from "./fulton-log";
import { FultonRouter } from "./routers/fulton-router";
import { FultonService } from "./services";
import { createRepository } from "./repositories/repository-helpers";
import { defaultHttpLoggerHandler } from "./middlewares/http-logger";
import { fultonDebug } from "./helpers/debug";
import { getRepositoryMetadata } from "./repositories/repository-decorator-helper";
import { isFunction } from "util";

export abstract class FultonApp {
    private isInitialized: boolean = false;

    /**
     * app name, use in output, parser. default is class name.
     */
    appName: string;

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
     * the instance of Express, created during init().
     */
    server: Express;

    /**
     * Dependency Injection container, created during init()
     */
    container: FultonDiContainer;

    /**
     * options for Fulton
     */
    options: FultonAppOptions;

    /**
     * user service, created during init() if options.identity.enabled = true.
     */
    userService: IUserService<IUser>;

    /**
     * @param mode There are some different default values for api and web-view. 
     */
    constructor(public readonly mode: AppMode = "api") {
        this.appName = this.constructor.name;
        this.options = new FultonAppOptions(this.appName, mode);
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
        await this.didInit();

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
                    .createServer(this.server)
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
                    .createServer(this.options.server.sslOptions, this.server)
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
        this.server = express();
        this.server.request.constructor.prototype.fultonApp = this;

        this.server.disable('x-powered-by');
    }

    protected initDiContainer(): void | Promise<void> {
        this.container = new Container();

        require("./initializers/di-initializer")(this, this.container);
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
    }

    protected initProviders(): void | Promise<void> {
        this.registerTypes(this.options.providers || []);
    }

    /**
     * init databases, it will be ignored if repository is empty.
     */
    protected async initDatabases(): Promise<void> {
        if (this.options.identity.useDefaultImplement()) {
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

        await this.didInitDatabases(this.connections);
    }

    protected async initRepositories(): Promise<void> {
        let providers = this.options.repositories || [];
        if (this.options.loader.repositoryLoaderEnabled) {
            let dirs = this.options.loader.repositoryDirs.map((dir) => path.join(this.options.loader.appDir, dir));
            let loadedProviders = await this.options.loader.repositoryLoader(dirs, true) as TypeProvider[];
            providers = loadedProviders.concat(providers);
        }

        // reposities needs to be singleton to integrate typeorm and inversify
        let newProviders: ValueProvider[] = providers.map((provider) => {
            return {
                provide: provider,
                useValue: createRepository(this.container, provider)
            }
        });

        this.registerTypes(newProviders);
    }

    protected async initServices(): Promise<void> {
        let providers = this.options.services || [];
        if (this.options.loader.serviceLoaderEnabled) {
            let dirs = this.options.loader.serviceDirs.map((dir) => path.join(this.options.loader.appDir, dir));
            let loadedProviders = await this.options.loader.serviceLoader(dirs, true) as Provider[];
            providers = loadedProviders.concat(providers);
        }

        this.registerTypes(providers);
    }

    protected initIdentity(): void | Promise<void> {
        if (this.options.identity.enabled) {
            // won't load passport-* modules if it is not enabled;
            return (require("./identity/identity-initializer")(this));
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
        let routers = ids.map((id) => {
            let router = this.container.get<FultonRouter>(id);

            router.init(); //register router to express

            return router;
        });

        await this.didInitRouters(routers);
    }

    protected initHttpLogging(): void | Promise<void> {
        if (this.options.logging.httpLoggerEnabled) {
            if (lodash.some(this.options.logging.httpLoggerMiddlewares)) {
                this.server.use(...this.options.logging.httpLoggerMiddlewares);
            } else if (this.options.logging.httpLoggerOptions) {
                this.server.use(defaultHttpLoggerHandler(this.options.logging.httpLoggerOptions));
            }
        }
    }

    protected initStaticFile(): void | Promise<void> {
        if (this.options.staticFile.enabled) {
            if (lodash.some(this.options.staticFile.middlewares)) {
                this.options.staticFile.middlewares.forEach(opt => {
                    if (opt.path) {
                        this.server.use(opt.path, opt.middleware);
                    } else {
                        this.server.use(opt.middleware);
                    }
                });
            } else {
                this.options.staticFile.folders.forEach(opt => {
                    if (opt.path) {
                        this.server.use(opt.path, express.static(opt.folder, opt.options));
                    } else {
                        this.server.use(express.static(opt.folder, opt.options));
                    }
                })
            }
        }
    }

    protected initCors(): void | Promise<void> {
        if (this.options.cors.enabled) {
            if (lodash.some(this.options.cors.middlewares)) {
                this.server.use(...this.options.cors.middlewares);
            } else {
                this.server.use(cors(this.options.cors.options));
            }
        }
    }

    protected initMiddlewares(): void | Promise<void> {
        if (lodash.some(this.options.middlewares)) {
            this.server.use(...this.options.middlewares);
        }
    }

    protected initFormatter(): void | Promise<void> {
        if (this.options.formatter.json) {
            let types = ["application/json"]

            if (this.options.formatter.jsonApi) {
                types.push("application/vnd.api+json")
            }

            this.server.use(express.json({ type: types }));
        }

        if (this.options.formatter.form) {
            this.server.use(express.urlencoded({ extended: true }));
        }

        if (this.options.formatter.jsonApi) {
            this.server.use(require("./middlewares/jsonapi")(this.options.formatter.jsonApiOptions));
        }

        if (this.options.formatter.queryParams) {
            this.server.use(queryParamsParser);
        }

        if (lodash.some(this.options.formatter.customs)) {
            this.server.use(...this.options.formatter.customs);
        }
    }

    protected initIndex(): void | Promise<void> {
        if (!this.options.index.enabled) {
            return
        }

        if (this.options.index.handler) {
            this.server.all("/", this.options.index.handler);
            return;
        }

        if (this.options.index.filepath) {
            this.server.all("/", (res, req) => {
                req.sendFile(path.resolve(this.options.index.filepath));
            });

            return;
        }

        if (this.options.index.message) {
            this.server.all("/", (res, req) => {
                req.send(this.options.index.message);
            });

            return;
        }
    }

    protected initErrorHandler(): void | Promise<void> {
        if (this.options.errorHandler) {

            if (lodash.some(this.options.errorHandler.error404Middlewares)) {
                this.server.use(...this.options.errorHandler.error404Middlewares);
            }

            if (lodash.some(this.options.errorHandler.errorMiddlewares)) {
                this.server.use(...this.options.errorHandler.errorMiddlewares);
            }
        }
    }

    protected registerTypes(providers: Provider[], singleton?: boolean): TypeIdentifier[] {
        let ids: TypeIdentifier[] = [];

        if (providers == null)
            return ids;

        for (const provider of providers as any[]) {
            if (isFunction(provider)) {
                let binding = this.container.bind(provider as TypeProvider).toSelf();
                if (singleton == true) {
                    binding.inSingletonScope();
                }

                ids.push(provider);
            } else if (provider.useValue) {
                this.container.bind(provider.provide).toConstantValue(provider.useValue);
            } else if (provider.useClass) {
                let binding = this.container.bind(provider.provide).to(provider.useClass);

                if (provider.useSingleton == true || singleton) {
                    binding.inSingletonScope();
                }
            } else if (provider.useFactory) {
                this.container.bind(provider.provide).toFactory((ctx) => {
                    return provider.useFactory(ctx.container);
                });
            } else if (provider.useFunction) {
                let binding = this.container.bind(provider.provide).toDynamicValue((ctx) => {
                    return provider.useFunction(ctx.container);
                });

                if (provider.useSingleton == true || singleton) {
                    binding.inSingletonScope();
                }
            }

            if (provider.provide) {
                ids.push(provider.provide);
            }
        }

        return ids;
    }

    // events

    /**
     * to init the app. Env values for options will be loaded after onInit.
     * @param options the options for start app
     */
    protected abstract onInit(options: FultonAppOptions): void | Promise<void>;

    protected didInit(): void | Promise<void> { }

    protected didInitRouters(routers: FultonRouter[]): void | Promise<void> { }

    protected didInitDatabases(connections: Connection[]): void | Promise<void> { }
}