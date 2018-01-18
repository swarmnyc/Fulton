import * as express from "express";
import * as http from 'http';
import * as https from 'https';
import * as path from 'path'

import { Express, RequestHandler } from "express";
import { Container, interfaces } from "inversify";

import FultonLog from "./FultonLog";
import { IUser, FultonAuthRouter, IUserManager } from "./auths/index";
import { FultonRouter } from "./routers/FultonRouter";
import { Provider, TypeProvider } from "./helpers/type-helpers";
import {  } from "./services/service-helpers";
import { FultonDiContainer, FultonAppOptions } from "./interfaces";

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

        await this.onInit(this.options, this.container);

        this.appName = this.options.appName;

        // for log
        if (this.options.defaultLoggerOptions) {
            FultonLog.configure(this.options.defaultLoggerOptions);
        }

        // for services

        // for routers
        let routerTypes = this.options.routers;
        if (this.options.loader.routerLoaderEnabled) {
            let dirs = this.options.loader.routerDirs.map((dir) => path.join(this.options.loader.appDir, dir));
            let routers = await this.options.loader.routerLoader(dirs, true) as Provider[];
            routerTypes = routers.concat(routerTypes);
        }

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

    createDiContainer(): FultonDiContainer | Promise<FultonDiContainer> {
        return new Container();
    }

    createDefaultOptions(): FultonAppOptions {
        return {
            appName: "FultonApp",
            routers: [],
            services: [],
            loader: {
                appDir: path.dirname(process.mainModule.filename),
                routerDirs: ["routers"],
                routerLoaderEnabled: false,
                //routerLoader: defaultClassLoader,
                serviceDirs: ["services"],
            },
            server: {
                useHttp: true,
                useHttps: false,
                httpPort: 3000,
                httpsPort: 443
            }
        };
    }

    // events
    protected abstract onInit(options: FultonAppOptions, container: FultonDiContainer): void | Promise<void>;

    protected onInitRouters(routers: FultonRouter[]): void | Promise<void> {

    }
}