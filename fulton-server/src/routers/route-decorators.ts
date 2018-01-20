import { PathIdentifier, injectable } from "../interfaces";
import { RouterMetadata, RouterMethodMetadata, keys } from "./route-decorators-helpers";

import { Middleware } from "../index";

/**
 * router metadata, this method includes @injectable()
 * @param path 
 * @param doc 
 * @param middlewares 
 * @param afterMiddlewares 
 */
export function router(path: PathIdentifier, doc?: any, ...middlewares: Middleware[]): any {
    let injectableFunc = injectable()
    return function (target: any) {
        injectableFunc(target);

        Reflect.defineMetadata(
            keys.router,
            {
                path,
                doc,
                middlewares
            } as RouterMetadata,
            target);
    };
};

export function errorHandler() {
    return function (target: any, property: string, descriptor: PropertyDescriptor) {
        Reflect.defineMetadata(keys.routerErrorHandler, property, target.constructor);
    };
}

/**
 * 
 * @param path default is '/'
 * @param doc 
 * @param middlewares 
 */
export function all(path?: PathIdentifier, doc?: any, ...middlewares: Middleware[]) {
    return httpMethod("all", path, doc, ...middlewares);
}

/**
 * 
 * @param path default is '/'
 * @param doc 
 * @param middlewares 
 */
export function httpGet(path?: PathIdentifier, doc?: any, ...middlewares: Middleware[]) {
    return httpMethod("get", path, doc, ...middlewares);
}

/**
 * 
 * @param path default is '/'
 * @param doc 
 * @param middlewares 
 */
export function httpPost(path?: PathIdentifier, doc?: any, ...middlewares: Middleware[]) {
    return httpMethod("post", path, doc, ...middlewares);
}

/**
 * 
 * @param path default is '/'
 * @param doc 
 * @param middlewares 
 */
export function httpPut(path?: PathIdentifier, doc?: any, ...middlewares: Middleware[]) {
    return httpMethod("put", path, doc, ...middlewares);
}

/**
 * 
 * @param path default is '/'
 * @param doc 
 * @param middlewares 
 */
export function httpPatch(path?: PathIdentifier, doc?: any, ...middlewares: Middleware[]) {
    return httpMethod("patch", path, doc, ...middlewares);
}

/**
 * 
 * @param path default is '/'
 * @param doc 
 * @param middlewares 
 */
export function httpHead(path?: PathIdentifier, doc?: any, ...middlewares: Middleware[]) {
    return httpMethod("head", path, doc, ...middlewares);
}

/**
 * 
 * @param path default is '/'
 * @param doc 
 * @param middlewares 
 */
export function httpDelete(path?: PathIdentifier, doc?: any, ...middlewares: Middleware[]) {
    return httpMethod("delete", path, doc, ...middlewares);
}

/**
 * 
 * @param method 
 * @param path 
 * @param doc 
 * @param middlewares 
 */
export function httpMethod(method: string, path: PathIdentifier = "/", doc?: any, ...middlewares: Middleware[]) {
    return function (target: any, property: string, descriptor: PropertyDescriptor) {

        let metadata: RouterMethodMetadata = {
            path,
            method,
            property,
            doc,
            middlewares
        };

        let metadataList: RouterMethodMetadata[];

        if (Reflect.hasOwnMetadata(keys.routerHttpMethodList, target.constructor)) {
            metadataList = Reflect.getOwnMetadata(keys.routerHttpMethodList, target.constructor);
        } else {
            metadataList = [];
            Reflect.defineMetadata(keys.routerHttpMethodList, metadataList, target.constructor);
        }

        metadataList.push(metadata);
    };
}
