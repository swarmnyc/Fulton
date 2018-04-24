import * as path from 'path';
import { BaseOptions } from './options';
import {
    defaultClassLoader,
    FultonClassLoader
} from '../helpers';
import { Env } from '../helpers';
import { Router } from '../routers/router';
import { Service } from '../services/service';



export class LoaderOptions extends BaseOptions<LoaderOptions> {
    /**
     * the directory of the app, the default router loader use the value ({appDir}/routers)
     * default is the folder of the executed file like if run "node ./src/main.js",
     * the value of appDir is ./src/
     */
    appDir?: string;

    /**
     * if true, Fulton will load routers based on routerDirs automatically 
     * the default value is false
     * It can be overridden by process.env["{appName}.options.loader.routerLoaderEnabled"]
     */
    routerLoaderEnabled?: boolean = false;

    /**
     * the folders that router-loader looks at, default value is ["routers"], 
     */
    routerDirs?: string[] = ["routers"];

    /**
     * the router loader (a function), loads all routers under the folders of routerDirs
     * default is FultonClassLoader
     */
    routerLoader?: FultonClassLoader<Router>;

    /**
     * if true, Fulton will load services based on serviceDirs automatically 
     * the default value is false
     * It can be overridden by process.env["{appName}.options.loader.serviceLoaderEnabled"]
     */
    serviceLoaderEnabled?: boolean = false;

    /**
     * the folders that service-loader looks at, default value is ["services"], 
     */
    serviceDirs?: string[] = ["services"];

    /**
     * the router loader (a function), loads all services under the folders of all serviceDirs
     * default is FultonClassLoader
     */
    serviceLoader?: FultonClassLoader<Service>;

    init?(appName: string): void {
        if (this.appDir == null) {
            this.appDir = path.dirname(process.mainModule.filename)
        }

        this.routerLoaderEnabled = Env.getBoolean(`${appName}.options.loader.routerLoaderEnabled`, this.routerLoaderEnabled);
        this.serviceLoaderEnabled = Env.getBoolean(`${appName}.options.loader.serviceLoaderEnabled`, this.serviceLoaderEnabled);

        if (this.routerLoaderEnabled && this.routerLoader == null) {
            this.routerLoader = defaultClassLoader(Router)
        }

        if (this.serviceLoaderEnabled && this.serviceLoader == null) {
            this.serviceLoader = defaultClassLoader(Service)
        }
    }
}