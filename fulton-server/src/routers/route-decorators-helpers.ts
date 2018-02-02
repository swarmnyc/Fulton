import { KEY_ROUTER_ERROR_HANDLER_METADATA, KEY_ROUTER_HTTP_METHOD_LIST_METADATA, KEY_ROUTER_METADATA } from "../constants";

import { Router } from "./router";
import { PathIdentifier, Middleware, RouterDocOptions, RouterActionDocOptions } from "../interfaces";
import { Type } from "../index";

export interface RouterMetadata {
    path: PathIdentifier,
    doc: RouterDocOptions;
    middlewares: Middleware[]
}

export interface EntityRouterMetadata extends RouterMetadata {
    entity: Type;
}

export interface RouterMethodMetadata {
    path: PathIdentifier,
    method: string,
    property: string,
    doc: RouterActionDocOptions;
    middlewares: Middleware[]
}

export interface AllRouterMethodMetadata {
    methods: RouterMethodMetadata[],
    errorhandler: string;
}

export interface FullRouterMetadata extends AllRouterMethodMetadata {
    router: RouterMetadata
}

export interface FullEntityRouterMetadata extends AllRouterMethodMetadata {
    router: EntityRouterMetadata,
}

export function getRouterMetadata(target: any): RouterMetadata {
    return Reflect.getOwnMetadata(KEY_ROUTER_METADATA, target);
}

export function getEntityRouterMetadata(target: any): EntityRouterMetadata {
    return Reflect.getOwnMetadata(KEY_ROUTER_METADATA, target);
}

export function getRouterErrorHandler(target: any): string {
    return Reflect.getOwnMetadata(KEY_ROUTER_ERROR_HANDLER_METADATA, target);
}

/**
 * get Router Method Metadata List only for the type
 * @param target 
 */
export function getRouterMethodMetadataList(target: any): RouterMethodMetadata[] {
    return Reflect.getOwnMetadata(KEY_ROUTER_HTTP_METHOD_LIST_METADATA, target) || [];
}

export function getFullRouterMethodMetadata(target: any): FullRouterMetadata {
    let metadata = getAllRouterMethodMetadata(target) as FullRouterMetadata;
    metadata.router = getRouterMetadata(target);

    return metadata;
}

export function getFullEntityRouterMethodMetadata(target: any): FullEntityRouterMetadata {
    let metadata = getAllRouterMethodMetadata(target) as FullEntityRouterMetadata;
    metadata.router = getEntityRouterMetadata(target);

    return metadata;
}

function getAllRouterMethodMetadata(target: any): AllRouterMethodMetadata {
    let methods = [];
    let errorhandler;
    let keys = new Map<string, boolean>();

    // get metadata from parent class recurrsively
    while (target.prototype instanceof Router) {
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

    return { methods, errorhandler };
}