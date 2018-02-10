import { entity, objectIdColumn, column, relatedTo } from "fulton-server";
import { Ingredient } from "./Ingredient";

@entity()
export class Food {
    @objectIdColumn()
    id?: string;
    @column()
    name?: String;
    @column()
    category?: String;
    
    @relatedTo(Ingredient)
    ingredients?: Ingredient[];
}

