import * as express from "express";
import * as http from 'http';
import * as https from 'https';
import * as path from 'path'

import { Container, interfaces } from "inversify";
import { Express, RequestHandler } from "express";
import { FultonAppOptions, FultonDiContainer } from "./interfaces";
import { FultonAuthRouter, IUser, IUserManager } from "./auths/index";
import { Identifier, Provider, Type, TypeProvider, ValueProvider } from "./helpers/type-helpers";

import FultonLog from "./FultonLog";
import { FultonRouter } from "./routers/FultonRouter";
import { FultonService } from "./services";
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

        await this.onInit(this.options);

        this.appName = this.options.appName;

        // for log
        if (this.options.defaultLoggerOptions) {
            FultonLog.configure(this.options.defaultLoggerOptions);
        }

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

        //await this.onInitRouters(routerTypes);

        this.isInitialized = true;
    }

    /**
     * start http server or https server. if it isn't initialized, it will call init(), too.
     */
    async start(): Promise<any> {
        if (!this.isInitialized) {
            await this.init();
        }

        if (this.httpServer || this.httpsServer) {
            throw new Error("app is still running");
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
                    FultonLog.info(`${name} stoped http server`);
                    resolve();
                })
            }));
        }

        if (this.httpsServer) {
            tasks.push(new Promise((resolve, reject) => {
                this.httpServer.close(() => {
                    FultonLog.info(`${name} stoped https server`);
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
            router.app = this;
            router.init();

            return router;
        });
        
        this.onInitRouters(routers);
    }

    protected registerTypes(providers: Provider[]): Identifier[] {
        let ids = [];

        if (providers == null)
            return;

        for (const provider of providers as any[]) {
            let binding;
            if (isFunction(provider)) {
                binding = this.container.bind(provider as TypeProvider).toSelf();
                ids.push(provider);
            } else if (provider.useValue) {
                binding = this.container.bind(provider.provide).toConstantValue(provider.useValue);
            } else if (provider.useClass) {
                binding = this.container.bind(provider.provide).to(provider.useClass);
            } else if (provider.useFactory) {
                binding = this.container.bind(provider.provide).toFactory((ctx) => {
                    return provider.useFactory(ctx.container);
                });
            } else if (provider.useFunction) {
                binding = this.container.bind(provider.provide).toDynamicValue((ctx) => {
                    return provider.useFunction(ctx.container);
                });
            }

            if (provider.provide) {
                ids.push(provider.provide);
            }

            if (provider.useSingleton == true) {
                binding.inSingletonScope();
            }
        }

        return ids;
    }

    // events
    protected abstract onInit(options: FultonAppOptions): void | Promise<void>;

    protected onInitRouters(routers: FultonRouter[]): void | Promise<void> {}
}