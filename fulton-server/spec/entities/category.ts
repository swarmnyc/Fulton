import { column, entity, ObjectId, objectIdColumn } from "../../src/entities";

@entity("categories")
export class Category {
    @objectIdColumn() 
    categoryId: ObjectId;

    @column()
    categoryName:string;

    @column()
    description:string;
}