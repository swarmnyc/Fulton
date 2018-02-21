import { entity, objectIdColumn, column } from "../../src/interfaces";
import { ObjectId } from "bson";

@entity("categories")
export class Category {
    @objectIdColumn() 
    categoryId: ObjectId;

    @column()
    categoryName:string;

    @column()
    description:string;
}