import * as fs from "fs"
import * as path from "path"
import { Type } from "./type-helpers";

const supportExtensions = [".js", ".ts"];

/**
 * load all the modules under the folder.
 * @param dir the folder
 * @param recursive if true, it loads modoles recursively
 */
export function loadModules<T=any>(dir: string, recursive: boolean = true): Promise<T[]> {
    return new Promise((resolve, reject) => {
        fs.readdir(dir, async (err, items) => {
            if (err) {
                return reject(err);
            }

            let modules = [];

            for (let filename of items) {
                let filepath = path.resolve(dir, filename);
                let stat = fs.statSync(filepath);

                if (stat.isDirectory()) {
                    if (recursive) {
                        let subModules = await loadModules(filepath, recursive);
                        modules.push.apply(modules, subModules);
                    }
                } else {
                    if (supportExtensions.indexOf(path.extname(filename)) > -1) {
                        modules.push(require(filepath));
                    }
                }
            }

            return resolve(modules);
        });
    });
}

export type FultonClassLoader<T> = (servicesDirs: string[], recursive?: boolean) => Promise<Type<T>[]>;

export function defaultClassLoader<T>(type: Type<T>) : FultonClassLoader<Type<T>> {
    return async (routerDirs: string[], recursive: boolean = true) => {
        let routers: Type<T>[] = [];
    
        for (const dir of routerDirs) {
            let modules = await loadModules(dir, recursive);
    
            for (let routerModule of modules) {
                for (let name of Object.getOwnPropertyNames(routerModule)) {
                    let routerClass = routerModule[name];
    
                    if (routerClass.prototype instanceof type) {
                        routers.push(routerClass);
                    }
                }
            }
        }
    
        return routers;
    }
}
