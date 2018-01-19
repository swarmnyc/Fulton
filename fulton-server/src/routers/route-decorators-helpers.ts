import { Middleware } from "../index";
import { PathIdentifier } from "../interfaces";

export const keys = {
    router: "FultonDecrator.Router"
}

export interface RouterMetadata {
    path: PathIdentifier,
    doc: any;    
    beforeMiddlewares: Middleware[],
    afterMiddlewares: Middleware[],
}

export function getRouterMetadata(target: any) {
    return Reflect.getOwnMetadata(keys.router, target);
}