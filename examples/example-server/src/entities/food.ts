import { entity, objectIdColumn, column } from "fulton-server";
import { Ingredient } from "./Ingredient";

@entity()
export class Food {
    @objectIdColumn()
    id?: string;
    @column()
    name?: String;
    @column()
    category?: String;
    @column()
    ingredients?: Ingredient[];
}

