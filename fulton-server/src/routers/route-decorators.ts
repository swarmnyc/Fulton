import { PathIdentifier, injectable } from "../interfaces";
import { RouterMetadata, keys } from "./route-decorators-helpers";

import { Middleware } from "../index";

/**
 * router metadata, this method includes @injectable()
 * @param path 
 * @param doc 
 * @param beforeMiddlewares 
 * @param afterMiddlewares 
 */
export function router(path: PathIdentifier, doc?: any, beforeMiddlewares?: Middleware[], afterMiddlewares?: Middleware[]) {
    let injectableFunc = injectable()
    return function (target: any) {
        injectableFunc(target);
        
        Reflect.defineMetadata(
            keys.router,
            {
                path: path,
                doc: doc,
                beforeMiddlewares: beforeMiddlewares,
                afterMiddlewares: afterMiddlewares
            } as RouterMetadata,
            target);
    };
}

export function httpGet(url: string, doc?: any) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {

    };
}

export function Post(url: string, doc?: any) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {

    };
}

export function Put(url: string, doc?: any) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {

    };
}

export function Patch(url: string, doc?: any) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {

    };
}

export function Delete(url: string, doc?: any) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {

    };
}