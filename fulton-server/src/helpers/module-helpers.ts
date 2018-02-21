import * as fs from "fs"
import * as path from "path"

import { Type, AbstractType } from "../interfaces";

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
                        modules.push(...subModules);
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

export type FultonClassLoader<T> = (servicesDirs: string[], recursive?: boolean) => Promise<AbstractType<T>[]>;

export function defaultClassLoader<T>(type: AbstractType<T>): FultonClassLoader<T> {
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


/**
 * check module is exist
 * @param name module name
 */
export function moduleExists(name: string) {
    /**
     * This is UGLY but since we're not allowed to require 'native_module'
     * this is the only way to test if a native module (or non-native module) exist.
     */
    try {
        require(name);
    } catch (err) {
        if (err.code === 'MODULE_NOT_FOUND') {
            return false;
        }
    }

    return true;
};