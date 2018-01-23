import { KEY_ROUTER_ERROR_HANDLER_METADATA, KEY_ROUTER_HTTP_METHOD_LIST_METADATA, KEY_ROUTER_METADATA } from "../constants";
import { PathIdentifier, Injectable, RouterDocOptions } from "../interfaces";
import { RouterMetadata, RouterMethodMetadata } from "./route-decorators-helpers";

import { Middleware, RouterActionDocOptions } from "../index";
import { isFunction } from "util";

/**
 * router metadata, this method includes @Injectable()
 * @param path 
 * @param doc 
 * @param middlewares 
 * @param afterMiddlewares 
 */

export function Router(path: PathIdentifier, doc?: RouterDocOptions, ...middlewares: Middleware[]): any
export function Router(path: PathIdentifier, ...middlewares: Middleware[]): any
export function Router(path: PathIdentifier, ...args: any[]): any {
    return function (target: any) {
        Injectable()(target);
        let doc, middlewares;

        if (args && args.length > 0) {
            if (isFunction(args[0])) {
                middlewares = args;
            } else {
                doc = args[0];
                middlewares = args.slice(1);
            }
        }

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

/**
 * Router level error handler
 */
export function errorHandler() {
    return function (target: any, property: string, descriptor: PropertyDescriptor) {
        Reflect.defineMetadata(KEY_ROUTER_ERROR_HANDLER_METADATA, property, target.constructor);
    };
}

/**
 * @param path default is '/'
 * @param doc 
 * @param middlewares 
 */
export function HttpAll(path?: PathIdentifier, doc?: RouterActionDocOptions, ...middlewares: Middleware[]): any
export function HttpAll(path?: PathIdentifier, ...middlewares: Middleware[]): any
export function HttpAll(path?: PathIdentifier, ...args: any[]): any {
    return HttpMethod("all", path, ...args);
}

/**
 * 
 * @param path default is '/'
 * @param doc 
 * @param middlewares 
 */
export function HttpGet(path?: PathIdentifier, doc?: RouterActionDocOptions, ...middlewares: Middleware[]): any
export function HttpGet(path?: PathIdentifier, ...middlewares: Middleware[]): any
export function HttpGet(path?: PathIdentifier, ...args: any[]): any {
    return HttpMethod("get", path, ...args);
}

/**
 * 
 * @param path default is '/'
 * @param doc 
 * @param middlewares 
 */
export function HttpPost(path?: PathIdentifier, doc?: RouterActionDocOptions, ...middlewares: Middleware[]): any
export function HttpPost(path?: PathIdentifier, ...middlewares: Middleware[]): any
export function HttpPost(path?: PathIdentifier, ...args: any[]): any {
    return HttpMethod("post", path, ...args);
}

/**
 * 
 * @param path default is '/'
 * @param doc 
 * @param middlewares 
 */
export function HttpPut(path?: PathIdentifier, doc?: RouterActionDocOptions, ...middlewares: Middleware[]): any
export function HttpPut(path?: PathIdentifier, ...middlewares: Middleware[]): any
export function HttpPut(path?: PathIdentifier, ...args: any[]): any {
    return HttpMethod("put", path, ...args);
}

/**
 * 
 * @param path default is '/'
 * @param doc 
 * @param middlewares 
 */
export function HttpPatch(path?: PathIdentifier, doc?: RouterActionDocOptions, ...middlewares: Middleware[]): any
export function HttpPatch(path?: PathIdentifier, ...middlewares: Middleware[]): any
export function HttpPatch(path?: PathIdentifier, ...args: any[]): any {
    return HttpMethod("patch", path, ...args);
}

/**
 * 
 * @param path default is '/'
 * @param doc 
 * @param middlewares 
 */
export function HttpHead(path?: PathIdentifier, doc?: RouterActionDocOptions, ...middlewares: Middleware[]): any
export function HttpHead(path?: PathIdentifier, ...middlewares: Middleware[]): any
export function HttpHead(path?: PathIdentifier, ...args: any[]): any {
    return HttpMethod("head", path, ...args);
}

/**
 * 
 * @param path default is '/'
 * @param doc 
 * @param middlewares 
 */
export function HttpDelete(path?: PathIdentifier, doc?: RouterActionDocOptions, ...middlewares: Middleware[]): any
export function HttpDelete(path?: PathIdentifier, ...middlewares: Middleware[]): any
export function HttpDelete(path?: PathIdentifier, ...args: any[]): any {
    return HttpMethod("delete", path, ...args);
}

/**
 * 
 * @param method 
 * @param path 
 * @param doc 
 * @param middlewares 
 */
export function HttpMethod(method: string, path: PathIdentifier, doc?: RouterActionDocOptions, ...middlewares: Middleware[]): any
export function HttpMethod(method: string, path: PathIdentifier, ...middlewares: Middleware[]): any
export function HttpMethod(method: string, path: PathIdentifier = "/", ...args: any[]): any {
    return function (target: any, property: string, descriptor: PropertyDescriptor) {
        let doc, middlewares;

        if (args && args.length > 0) {
            if (isFunction(args[0])) {
                middlewares = args;
            } else {
                doc = args[0];
                middlewares = args.slice(1);
            }
        }

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
