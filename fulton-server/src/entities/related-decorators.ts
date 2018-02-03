import { Type } from "../index";
import { RelatedToMetadata } from "./related-decorators-helpers";
import { Keys } from "../constants";

/**
 * the relation decorator for mongodb.
 * 
 * the data stucture have to be like 
 * 
 * let book = {
 *    ...
 *   author: {
 *      _id: "authorId"
 *   }
 * } 
 * 
 * @param entity type of the related to entity 
 */
export function relatedTo(entity: Type): any {
    return function (target: any, property: string, descriptor: PropertyDescriptor) {
        
        let metadata: RelatedToMetadata;

        if (Reflect.hasOwnMetadata(Keys.RelatedToMetadata, target.constructor)) {
            metadata = Reflect.getOwnMetadata(Keys.RelatedToMetadata, target.constructor);
        } else {
            metadata = {};
            Reflect.defineMetadata(Keys.RelatedToMetadata, metadata, target.constructor);
        }

        metadata[property] = entity;
    };
}