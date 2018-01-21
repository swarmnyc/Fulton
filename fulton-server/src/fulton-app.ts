import * as express from "express";
import * as http from 'http';
import * as https from 'https';
import * as lodash from 'lodash';
import * as path from 'path';
import * as winston from 'winston';

import { ConnectionOptions, createConnections, Connection } from "typeorm";
import { Container, interfaces } from "inversify";
import { ErrorMiddleware, FultonDiContainer, Middleware, Request, Response } from "./interfaces";
import { Identifier, Provider, Type, TypeProvider, ValueProvider } from "./helpers/type-helpers";

import Env from "./helpers/env";
import { Express } from "express";
import { FultonAppOptions } from "./fulton-app-options";
import FultonLog from "./fulton-log";
import { FultonLoggerLevel } from "./index";
import { FultonRouter } from "./routers/fulton-router";
import { FultonService } from "./services";
import { KEY_FULTON_APP } from "./constants";
import { createRepository } from "./repositories/repository-helpers";
import { getRepositoryMetadata } from "./repositories/repository-decorator-helper";
import { isFunction } from "util";

export abstract class FultonApp {
    private isInitialized: boolean = false;
    private httpServer: http.Server;
    private httpsServer: https.Server;

    /**
     * app name, use in output, parser. default is class name.
     * have to set the value before onInit();
     */
    appName: string;

    /**
     * the instance of Express, create after init().
     */
    server: Express;
    container: FultonDiContainer;
    options: FultonAppOptions;

    constructor() {
        this.appName = this.constructor.name;
    }

    /**
     * initialize FultonApp. It will be called on start(), if the app isn't initialized;
     * it can be run many times, everytime call this will reset all the related objects
     */
    async init(resetOptions = false): Promise<void> {
        this.initOptions(resetOptions);
        this.initDiContainer();

        this.server = express();

        await this.onInit(this.options);

        this.options.loadDatabaseOptions();

        // for log
        this.initLogging();

        // for bodyParsers
        this.initBodyParsers();

        // for index
        this.initIndex();

        // for bodyParsers
        this.initStaticFile();

        // for providers
        this.registerTypes(this.options.providers || []);

        // for databases
        await this.initDatabases();

        // for repositories
        await this.initRepositories();

        // for services
        await this.initServices();

        // for routers
        await this.initRouters();

        // for errorHandler
        if (this.options.errorHandler) {
            this.server.use(this.options.errorHandler);
        }

        this.isInitialized = true;
        await this.didInit();
    }

    /**
     * start http server or https server. if it isn't initialized, it will call init(), too.
     */
    async start(): Promise<any> {
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
                if (!this.options.server.sslOption) {
                    let error = `${this.appName} failed to start because https is enabled but sslOption was given`;
                    FultonLog.error(error);
                    reject(error);
                    return;
                }

                this.httpsServer = https
                    .createServer(this.options.server.sslOption, this.server)
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
        var tasks = [];

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

    protected initDiContainer() {
        this.container = new Container();
        this.container.bind(KEY_FULTON_APP).toConstantValue(this);
    }

    protected initOptions(resetOptions: boolean): void {
        if (this.options && !resetOptions)
            return;

        this.options = new FultonAppOptions(this.appName);
    }

    protected initLogging(): void {
        if (this.options.logging.defaultLevel) {
            FultonLog.level = this.options.logging.defaultLevel;
        }

        if (this.options.logging.defaultOptions) {
            FultonLog.configure(this.options.logging.defaultOptions);
        }

        if (this.options.logging.defaultLoggerColorized) {
            if (winston.default.transports.console) {
                (winston.default.transports.console as any).colorize = true;
            }
        }

        if (this.options.logging.httpLogEnabled) {
            // TODO: 
        }
    }

    protected initStaticFile(): void {
        if (this.options.staticFile.enabled) {
            // TODO: 
        }
    }

    protected initBodyParsers(): void {
        if (lodash.some(this.options.bodyParsers)) {
            this.server.use(...this.options.bodyParsers);
        }
    }

    protected async initDatabases(): Promise<void> {
        let dbOptions: ConnectionOptions[];
        if (this.options.databases.size > 0) {
            dbOptions = [];
            this.options.databases.forEach((conn, name) => {
                lodash.set(conn, "name", name);
                if (lodash.some(this.options.entities)) {
                    dbOptions.forEach((option) => {
                        if (option.entities) {
                            let arr = option.entities as any[];
                            arr.push(this.options.entities);
                        } else {
                            lodash.set(option, "entities", this.options.entities);
                        }
                    });
                }
                dbOptions.push(conn);
            });
        }

        let conns = await createConnections(dbOptions).catch((error) => {
            FultonLog.error("initDatabases fails", error);
            throw error;
        });

        await this.didInitDatabases(conns);
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

    protected async initRouters(): Promise<void> {
        let prodivers = this.options.routers || [];
        if (this.options.loader.routerLoaderEnabled) {
            let dirs = this.options.loader.routerDirs.map((dir) => path.join(this.options.loader.appDir, dir));
            let loadProviders = await this.options.loader.routerLoader(dirs, true) as Provider[];
            prodivers = loadProviders.concat(prodivers);
        }

        let ids = this.registerTypes(prodivers);
        let routers = ids.map((id) => {
            let router = this.container.get<FultonRouter>(id);

            router.init(); //register router to express

            return router;
        });

        await this.didInitRouters(routers);
    }

    protected initIndex(): void {
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

    protected registerTypes(providers: Provider[]): Identifier[] {
        let ids: Identifier[] = [];

        if (providers == null)
            return ids;

        for (const provider of providers as any[]) {
            if (isFunction(provider)) {
                this.container.bind(provider as TypeProvider).toSelf();
                ids.push(provider);
            } else if (provider.useValue) {
                this.container.bind(provider.provide).toConstantValue(provider.useValue);
            } else if (provider.useClass) {
                let binding = this.container.bind(provider.provide).to(provider.useClass);

                if (provider.useSingleton == true) {
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

                if (provider.useSingleton == true) {
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
    protected abstract onInit(options: FultonAppOptions): void | Promise<void>;

    protected didInit(): void | Promise<void> { }

    protected didInitRouters(routers: FultonRouter[]): void | Promise<void> { }

    protected didInitDatabases(connections: Connection[]): void | Promise<void> { }
}