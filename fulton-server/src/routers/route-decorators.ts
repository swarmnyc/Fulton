import { KEY_ROUTER_ERROR_HANDLER_METADATA, KEY_ROUTER_HTTP_METHOD_LIST_METADATA, KEY_ROUTER_METADATA } from "../constants";
import { PathIdentifier, Injectable } from "../interfaces";
import { RouterMetadata, RouterMethodMetadata } from "./route-decorators-helpers";

import { Middleware } from "../index";

/**
 * router metadata, this method includes @Injectable()
 * @param path 
 * @param doc 
 * @param middlewares 
 * @param afterMiddlewares 
 */
export function Router(path: PathIdentifier, doc?: any, ...middlewares: Middleware[]): any {
    return function (target: any) {
        Injectable()(target);

        Reflect.defineMetadata(
            KEY_ROUTER_METADATA,
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
        Reflect.defineMetadata(KEY_ROUTER_ERROR_HANDLER_METADATA, property, target.constructor);
    };
}

/**
 * 
 * @param path default is '/'
 * @param doc 
 * @param middlewares 
 */
export function HttpAll(path?: PathIdentifier, doc?: any, ...middlewares: Middleware[]) {
    return HttpMethod("all", path, doc, ...middlewares);
}

/**
 * 
 * @param path default is '/'
 * @param doc 
 * @param middlewares 
 */
export function HttpGet(path?: PathIdentifier, doc?: any, ...middlewares: Middleware[]) {
    return HttpMethod("get", path, doc, ...middlewares);
}

/**
 * 
 * @param path default is '/'
 * @param doc 
 * @param middlewares 
 */
export function HttpPost(path?: PathIdentifier, doc?: any, ...middlewares: Middleware[]) {
    return HttpMethod("post", path, doc, ...middlewares);
}

/**
 * 
 * @param path default is '/'
 * @param doc 
 * @param middlewares 
 */
export function HttpPut(path?: PathIdentifier, doc?: any, ...middlewares: Middleware[]) {
    return HttpMethod("put", path, doc, ...middlewares);
}

/**
 * 
 * @param path default is '/'
 * @param doc 
 * @param middlewares 
 */
export function HttpPatch(path?: PathIdentifier, doc?: any, ...middlewares: Middleware[]) {
    return HttpMethod("patch", path, doc, ...middlewares);
}

/**
 * 
 * @param path default is '/'
 * @param doc 
 * @param middlewares 
 */
export function HttpHead(path?: PathIdentifier, doc?: any, ...middlewares: Middleware[]) {
    return HttpMethod("head", path, doc, ...middlewares);
}

/**
 * 
 * @param path default is '/'
 * @param doc 
 * @param middlewares 
 */
export function HttpDelete(path?: PathIdentifier, doc?: any, ...middlewares: Middleware[]) {
    return HttpMethod("delete", path, doc, ...middlewares);
}

/**
 * 
 * @param method 
 * @param path 
 * @param doc 
 * @param middlewares 
 */
export function HttpMethod(method: string, path: PathIdentifier = "/", doc?: any, ...middlewares: Middleware[]) {
    return function (target: any, property: string, descriptor: PropertyDescriptor) {

        let metadata: RouterMethodMetadata = {
            path,
            method,
            property,
            doc,
            middlewares
        };

        let metadataList: RouterMethodMetadata[];

        if (Reflect.hasOwnMetadata(KEY_ROUTER_HTTP_METHOD_LIST_METADATA, target.constructor)) {
            metadataList = Reflect.getOwnMetadata(KEY_ROUTER_HTTP_METHOD_LIST_METADATA, target.constructor);
        } else {
            metadataList = [];
            Reflect.defineMetadata(KEY_ROUTER_HTTP_METHOD_LIST_METADATA, metadataList, target.constructor);
        }

        metadataList.push(metadata);
    };
}
