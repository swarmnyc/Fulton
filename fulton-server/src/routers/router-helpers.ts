import { FultonRouter } from "../index";
import { loadModules } from "../helpers/module-helpers";
import { Type } from "../helpers/type-helpers";

export type FultonRouterLoader = (routerDirs: string[], recursive?: boolean) => Promise<Type<FultonRouter>[]>;

export const defaultRouterLoader: FultonRouterLoader = async (routerDirs: string[], recursive: boolean = true) => {
    let routers: Type<FultonRouter>[] = [];

    for (const dir of routerDirs) {
        let modules = await loadModules(dir, recursive);

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

