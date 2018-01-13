import { FultonRouter } from "../index";
import { loadModules } from "../helpers/module-helpers";
import { Type } from "../helpers/type-helpers";

export type FultonRouterLoader = (routerDirs: string[]) => Promise<Type<FultonRouter>[]>;

export const defaultRouterLoader: FultonRouterLoader = async (routerDirs: string[]) => {
    let routers: Type<FultonRouter>[] = [];

    for (const dir of routerDirs) {
        let modules = await loadModules(dir);

        for (let routerModule of modules) {
            for (let name of Object.getOwnPropertyNames(routerModule)) {
                let routerClass = routerModule[name];

                if (routerClass.prototype instanceof FultonRouter) {
                    routers.push(routerClass);
                }
            }
        }
    }

    return routers;
}

