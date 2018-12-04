import { column, entity, ObjectId, objectIdColumn } from "../../src/entities";

@entity("categories")
export class Category {
    @objectIdColumn() 
    categoryId: ObjectId | string;

    @column()
    categoryName:string;

    @column()
    description:string;
}