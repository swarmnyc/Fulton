import * as express from "express";
import * as http from 'http';
import * as https from 'https';
import * as path from 'path'

import { Container, interfaces } from "inversify";
import { ErrorMiddleware, FultonAppOptions, FultonDiContainer, Middleware, Request, Response } from "./interfaces";
import { Express, RequestHandler } from "express";
import { FultonAuthRouter, IUser, IUserManager } from "./auths/index";
import { Identifier, Provider, Type, TypeProvider, ValueProvider } from "./helpers/type-helpers";

import FultonLog from "./fulton-log";
import { FultonRouter } from "./routers/fulton-router";
import { FultonService } from "./services";
import { KEY_FULTON_APP } from "./constants";
import { defaultClassLoader } from "./helpers/module-helpers";
import { isFunction } from "util";

export abstract class FultonApp {
    private isInitialized: boolean = false;
    private httpServer: http.Server;
    private httpsServer: https.Server;

    appName: string;

    /**
     * the instance of Express, create after init().
     */
    express: Express;
    container: FultonDiContainer;
    options: FultonAppOptions;

    constructor() {
        this.options = this.createDefaultOptions();
    }

    /**
     * initialize FultonApp. It will be called on start(), if the app isn't initialized;
     * it can be run many times, everytime call this will reset all the related objects
     */
    async init(): Promise<void> {
        this.express = express();

        this.container = await this.createDiContainer();
        this.container.bind(KEY_FULTON_APP).toConstantValue(this);

        await this.onInit(this.options);

        this.appName = this.options.appName || this.constructor.name;

        // for log
        if (this.options.defaultLoggerOptions) {
            FultonLog.configure(this.options.defaultLoggerOptions);
        }

        // for providers
        this.registerTypes(this.options.providers || []);

        // for services
        let serviceTypes = this.options.services || [];
        if (this.options.loader.routerLoaderEnabled) {
            let dirs = this.options.loader.routerDirs.map((dir) => path.join(this.options.loader.appDir, dir));
            let routers = await this.options.loader.routerLoader(dirs, true) as Provider[];
            serviceTypes = routers.concat(serviceTypes);
        }

        this.registerTypes(serviceTypes);

        // for routers
        let routerTypes = this.options.routers || [];
        if (this.options.loader.routerLoaderEnabled) {
            let dirs = this.options.loader.routerDirs.map((dir) => path.join(this.options.loader.appDir, dir));
            let routers = await this.options.loader.routerLoader(dirs, true) as Provider[];
            routerTypes = routers.concat(routerTypes);
        }

        let routerIds = this.registerTypes(routerTypes);

        this.initRouters(routerIds);

        // for indexHandler
        this.processIndex();

        // for errorHandler
        if (this.options.errorHandler) {
            this.express.use(this.options.errorHandler);
        }

        this.isInitialized = true;
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

        if (this.options.server.useHttp) {
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

        if (this.options.server.useHttps) {
            tasks.push(new Promise((resolve, reject) => {
                this.httpsServer = https
                    .createServer(this.options.server.sslOption, this.express)
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

    protected createDiContainer(): FultonDiContainer | Promise<FultonDiContainer> {
        return new Container();
    }

    protected createDefaultOptions(): FultonAppOptions {
        return {
            appName: "FultonApp",
            routers: [],
            services: [],
            providers: [],
            errorHandler: this.defaultErrorHandler,
            loader: {
                appDir: path.dirname(process.mainModule.filename),
                routerDirs: ["routers"],
                routerLoaderEnabled: false,
                routerLoader: defaultClassLoader(FultonRouter),
                serviceDirs: ["services"],
                serviceLoaderEnabled: false,
                serviceLoader: defaultClassLoader(FultonService)
            },
            server: {
                useHttp: true,
                useHttps: false,
                httpPort: 3000,
                httpsPort: 443
            }
        };
    }

    protected initRouters(routerTypes: Identifier<FultonRouter>[]) {
        let routers = routerTypes.map((id) => {
            let router = this.container.get<FultonRouter>(id);
            router.init();

            return router;
        });

        this.onInitRouters(routers);
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

    protected onInitRouters(routers: FultonRouter[]): void | Promise<void> { }

    protected processIndex() {
        if (this.options.indexHandler) {
            this.express.all("/", this.options.indexHandler);
            return;
        }

        if (this.options.indexFilePath) {
            this.express.all("/", (res, req) => {
                req.sendFile(path.resolve(this.options.indexFilePath));
            });

            return;
        }

        if (this.options.indexMessage) {
            this.express.all("/", (res, req) => {
                req.send(this.options.indexMessage);
            });

            return;
        }
    }

    private defaultErrorHandler: ErrorMiddleware = (err: any, req: Request, res: Response, next: Middleware) => {
        FultonLog.error(`${req.method} ${req.url}\nrequest: %O\nerror: %s`, { httpHeaders: req.headers, httpBody: req.body }, err.stack);

        res.sendStatus(500);
    }
}