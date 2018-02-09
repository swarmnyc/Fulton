import { entity, objectIdColumn, column } from "fulton-server";

@entity("ingredients")
export class Ingredient  {
    @objectIdColumn()
    id?: string;
    @column()
    name: String;
    @column()
    category: String;
}