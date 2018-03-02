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

export interface RouterActionMetadata {
    path: PathIdentifier,
    method: string,
    property: string,
    doc: RouterActionDocOptions;
    middlewares: Middleware[]
}

export interface AllRouterActionMetadata {
    actions: Map<string, RouterActionMetadata>,
    errorhandler: string;
}

export interface FullRouterMetadata extends AllRouterActionMetadata {
    router: RouterMetadata
}

export interface FullEntityRouterMetadata extends AllRouterActionMetadata {
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
export function getRouterActionMetadataList(target: any): RouterActionMetadata[] {
    return Reflect.getOwnMetadata(Keys.HttpMethods, target) || [];
}

export function getFullRouterActionMetadata(target: any, type: AbstractType): FullRouterMetadata {
    let metadata = getAllRouterActionMetadata(target, type) as FullRouterMetadata;
    metadata.router = getRouterMetadata(target);

    return metadata;
}

export function getFullEntityRouterActionMetadata(target: any, type: AbstractType): FullEntityRouterMetadata {
    let metadata = getAllRouterActionMetadata(target, type) as FullEntityRouterMetadata;
    metadata.router = getEntityRouterMetadata(target);

    return metadata;
}

function getAllRouterActionMetadata(target: any, type: AbstractType): AllRouterActionMetadata {
    let actions = new Map<string, RouterActionMetadata>();
    let errorhandler;

    // get metadata from parent class recursively
    while (target.prototype instanceof type) {
        let metadata = getRouterActionMetadataList(target);
        for (const method of metadata) {
            // skip if exists
            if (!actions.has(method.property)) {
                actions.set(method.property, method);
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