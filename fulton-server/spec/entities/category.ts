import { entity, objectIdColumn, column, ObjectId } from "../../src/re-export";

@entity("categories")
export class Category {
    @objectIdColumn() 
    categoryId: ObjectId;

    @column()
    categoryName:string;

    @column()
    description:string;
}