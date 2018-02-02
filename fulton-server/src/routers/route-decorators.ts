import { KEY_ROUTER_ERROR_HANDLER_METADATA, KEY_ROUTER_HTTP_METHOD_LIST_METADATA, KEY_ROUTER_METADATA } from "../constants";
import { PathIdentifier, injectable, RouterDocOptions, HttpMethod, Middleware, RouterActionDocOptions, Type } from "../index";
import { RouterMetadata, RouterMethodMetadata, EntityRouterMetadata } from "./route-decorators-helpers";
import { isFunction } from "util";

/**
 * router decorator, this method includes @injectable()
 * @param path 
 * @param doc 
 * @param middlewares 
 * @param afterMiddlewares 
 */
export function router(path: PathIdentifier, doc?: RouterDocOptions, ...middlewares: Middleware[]): any
export function router(path: PathIdentifier, ...middlewares: Middleware[]): any
export function router(path: PathIdentifier, ...args: any[]): any {
    return function (target: any) {
        injectable()(target);
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
export function httpAll(path?: PathIdentifier, doc?: RouterActionDocOptions, ...middlewares: Middleware[]): any
export function httpAll(path?: PathIdentifier, ...middlewares: Middleware[]): any
export function httpAll(path?: PathIdentifier, ...args: any[]): any {
    return httpAction("all", path, ...args);
}

/**
 * 
 * @param path default is '/'
 * @param doc 
 * @param middlewares 
 */
export function httpGet(path?: PathIdentifier, doc?: RouterActionDocOptions, ...middlewares: Middleware[]): any
export function httpGet(path?: PathIdentifier, ...middlewares: Middleware[]): any
export function httpGet(path?: PathIdentifier, ...args: any[]): any {
    return httpAction("get", path, ...args);
}

/**
 * 
 * @param path default is '/'
 * @param doc 
 * @param middlewares 
 */
export function httpPost(path?: PathIdentifier, doc?: RouterActionDocOptions, ...middlewares: Middleware[]): any
export function httpPost(path?: PathIdentifier, ...middlewares: Middleware[]): any
export function httpPost(path?: PathIdentifier, ...args: any[]): any {
    return httpAction("post", path, ...args);
}

/**
 * 
 * @param path default is '/'
 * @param doc 
 * @param middlewares 
 */
export function httpPut(path?: PathIdentifier, doc?: RouterActionDocOptions, ...middlewares: Middleware[]): any
export function httpPut(path?: PathIdentifier, ...middlewares: Middleware[]): any
export function httpPut(path?: PathIdentifier, ...args: any[]): any {
    return httpAction("put", path, ...args);
}

/**
 * 
 * @param path default is '/'
 * @param doc 
 * @param middlewares 
 */
export function httpPatch(path?: PathIdentifier, doc?: RouterActionDocOptions, ...middlewares: Middleware[]): any
export function httpPatch(path?: PathIdentifier, ...middlewares: Middleware[]): any
export function httpPatch(path?: PathIdentifier, ...args: any[]): any {
    return httpAction("patch", path, ...args);
}

/**
 * 
 * @param path default is '/'
 * @param doc 
 * @param middlewares 
 */
export function httpHead(path?: PathIdentifier, doc?: RouterActionDocOptions, ...middlewares: Middleware[]): any
export function httpHead(path?: PathIdentifier, ...middlewares: Middleware[]): any
export function httpHead(path?: PathIdentifier, ...args: any[]): any {
    return httpAction("head", path, ...args);
}

/**
 * 
 * @param path default is '/'
 * @param doc 
 * @param middlewares 
 */
export function httpDelete(path?: PathIdentifier, doc?: RouterActionDocOptions, ...middlewares: Middleware[]): any
export function httpDelete(path?: PathIdentifier, ...middlewares: Middleware[]): any
export function httpDelete(path?: PathIdentifier, ...args: any[]): any {
    return httpAction("delete", path, ...args);
}

/**
 * 
 * @param method 
 * @param path 
 * @param doc 
 * @param middlewares 
 */
export function httpAction(method: HttpMethod, path: PathIdentifier, doc?: RouterActionDocOptions, ...middlewares: Middleware[]): any
export function httpAction(method: HttpMethod, path: PathIdentifier, ...middlewares: Middleware[]): any
export function httpAction(method: HttpMethod, path: PathIdentifier = "/", ...args: any[]): any {
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


/**
 * Entity Router decorator, this method includes @injectable()
 * @param path 
 * @param entity 
 * @param doc 
 * @param middlewares 
 */
export function entityRouter(path: PathIdentifier, entity: Type, doc?: RouterDocOptions, ...middlewares: Middleware[]): any
export function entityRouter(path: PathIdentifier, entity: Type, ...middlewares: Middleware[]): any
export function entityRouter(path: PathIdentifier, entity: Type, ...args: any[]): any {
    return function (target: any) {
        injectable()(target);
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
                entity,
                doc,
                middlewares
            } as EntityRouterMetadata,
            target);
    };
};