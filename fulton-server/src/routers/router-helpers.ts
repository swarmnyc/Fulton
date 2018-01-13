import { FultonRouter } from "../index";
import { loadModules } from "../helpers/module-helpers";

export type FultonRouterLoader = (routerDirs: string[]) => Promise<FultonRouter[]>;

export const defaultRouterLoader: FultonRouterLoader = async (routerDirs: string[]) => {
    let routers: FultonRouter[] = [];

    for (const dir of routerDirs) {
        let modules = await loadModules(dir);

        for (let routerModule of modules) {
            for (let name of Object.getOwnPropertyNames(routerModule)) {
                let routerClass = routerModule[name];
                
                if (routerClass.prototype instanceof FultonRouter) {
                    let router = new routerClass();
                    routers.push(router);
                }
            }
        }
    }

    return routers;
}

