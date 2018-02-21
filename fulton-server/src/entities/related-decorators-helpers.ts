import { Keys, None } from "../constants";
import { Type } from "../interfaces";

export interface RelatedToMetadata {
    [key: string]: Type;
}

export function getRelatedToMetadata(target: any): RelatedToMetadata {
    return Reflect.getOwnMetadata(Keys.RelatedToMetadata, target) || None;
}