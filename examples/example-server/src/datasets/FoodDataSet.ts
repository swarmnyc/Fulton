import { IFood, IIngredient } from "example-core";
import { MongoDataSet, Table } from "fulton-server";

import { Injectable } from "tsioc";
import { Ingredient } from "./IngredientDataSet";

// will try other orm
@Table("foods")
export class Food implements IFood {
    id?: string;
    name?: String;
    category?: String;
    ingredients?: Ingredient[];
}


@Injectable()
export class FoodDataSet extends MongoDataSet<Food>{
    constructor() {
        super(Food);
    }
}