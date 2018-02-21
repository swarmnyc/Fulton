import { Middleware, PathIdentifier, RouterActionDocOptions, RouterDocOptions, Type, AbstractType } from '../interfaces';

import { Keys } from "../constants";

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
    actions: RouterMethodMetadata[],
    errorhandler: string;
}

export interface FullRouterMetadata extends AllRouterMethodMetadata {
    router: RouterMetadata
}

export interface FullEntityRouterMetadata extends AllRouterMethodMetadata {
    router: EntityRouterMetadata,
}

export function getRouterMetadata(target: any): RouterMetadata {
    return Reflect.getOwnMetadata(Keys.RouterMetadata, target);
}

export function getEntityRouterMetadata(target: any): EntityRouterMetadata {
    return Reflect.getOwnMetadata(Keys.RouterMetadata, target);
}

export function getRouterErrorHandler(target: any): string {
    return Reflect.getOwnMetadata(Keys.RouterErrorHandlerMetadata, target);
}

/**
 * get Router Method Metadata List only for the type
 * @param target 
 */
export function getRouterMethodMetadataList(target: any): RouterMethodMetadata[] {
    return Reflect.getOwnMetadata(Keys.HttpMethods, target) || [];
}

export function getFullRouterMethodMetadata(target: any, type: AbstractType): FullRouterMetadata {
    let metadata = getAllRouterMethodMetadata(target, type) as FullRouterMetadata;
    metadata.router = getRouterMetadata(target);

    return metadata;
}

export function getFullEntityRouterMethodMetadata(target: any, type: AbstractType): FullEntityRouterMetadata {
    let metadata = getAllRouterMethodMetadata(target, type) as FullEntityRouterMetadata;
    metadata.router = getEntityRouterMetadata(target);

    return metadata;
}

function getAllRouterMethodMetadata(target: any, type: AbstractType): AllRouterMethodMetadata {
    let actions = [];
    let errorhandler;
    let keys = new Map<string, boolean>();

    // get metadata from parent class recursively
    while (target.prototype instanceof type) {
        let metadata = getRouterMethodMetadataList(target);
        for (const method of metadata) {
            // skip if exists
            if (!keys.has(method.property)) {
                actions.push(method);
                keys.set(method.property, true);
            }
        }

        // skip if exists
        if (errorhandler == null) {
            errorhandler = getRouterErrorHandler(target);
        }

        target = target.__proto__;
    }

    return { actions, errorhandler };
}