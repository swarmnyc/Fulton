import { FultonRouter } from "./fulton-router";
import { Middleware } from "../index";
import { PathIdentifier } from "../interfaces";

export const keys = {
    router: "FultonDecrator.Router",
    routerErrorHandler: "FultonDecrator.RouterErrorHandler",
    routerHttpMethodList: "FultonDecrator.HttpMethodList"
}

export interface FullRouterMetadata {
    router: RouterMetadata,
    methods: RouterMethodMetadata[],
    errorhandler: string;
}

export interface RouterMetadata {
    path: PathIdentifier,
    doc: any;
    middlewares: Middleware[]
}

export interface RouterMethodMetadata {
    path: PathIdentifier,
    method: string,
    property: string,
    doc: any;
    middlewares: Middleware[]
}

export function getRouterMetadata(target: any): RouterMetadata {
    return Reflect.getOwnMetadata(keys.router, target);
}

export function getRouterErrorHandler(target: any): string {
    return Reflect.getOwnMetadata(keys.routerErrorHandler, target);
}

/**
 * get Router Method Metadata List only for the type
 * @param target 
 */
export function getRouterMethodMetadataList(target: any): RouterMethodMetadata[] {
    return Reflect.getOwnMetadata(keys.routerHttpMethodList, target) || [];
}

export function getFullRouterMethodMetadata(target: any): FullRouterMetadata {
    let router = getRouterMetadata(target);
    let methods = [];
    let errorhandler;
    let keys = new Map<string, boolean>();

    // get metadata from parent class recurrsively
    while (target.prototype instanceof FultonRouter) {
        let metadata = getRouterMethodMetadataList(target);
        for (const method of metadata) {
            // skip if exists
            if (!keys.has(method.property)) {
                methods.push(method);
                keys.set(method.property, true);
            }
        }

        // skip if exists
        if (errorhandler == null) {
            errorhandler = getRouterErrorHandler(target);
        }

        target = target.__proto__;
    }

    return { router, methods, errorhandler };
}