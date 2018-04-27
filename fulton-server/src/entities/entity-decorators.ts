import { Type, column, objectIdColumn } from "../interfaces";
import { RelatedToMetadata } from "./entity-decorators-helpers";
import { Keys } from "../constants";
import { ColumnOptions } from "typeorm";

/**
 * the relation decorator for mongodb.
 * 
 * the data structure have to be like 
 * 
 * let book = {
 *    ...
 *   author: {
 *      id: "authorId"
 *   }
 * } 
 * 
 * @param entity type of the related to entity 
 */
export function relatedTo(entity: Type): any {
    return function (target: any, property: string, descriptor: PropertyDescriptor) {
        let type = Reflect.getMetadata("design:type", target, property) as Function;
        let isArray = type != null && type.name == "Array";
        column({ array: isArray })(target, property, descriptor);

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

/**
 * for mongodb and the _id column isn't use ObjectId.
 */
export function idColumn(options: ColumnOptions = {}): any {
    return function (target: any, property: string, descriptor: PropertyDescriptor) {
        let type = Reflect.getMetadata("design:type", target, property);

        if (!options.type) {
            options.type = type;
        }
        
        // just a wrapper
        objectIdColumn(options)(target, property, descriptor);
    };
}