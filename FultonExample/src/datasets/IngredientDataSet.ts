import { MongoDataSet } from "fulton-default";

import { Injectable } from "tsioc";
import { Ingredient } from "../models/Ingredient";

@Injectable()
export class IngredientDataSet extends MongoDataSet<Ingredient>{
    constructor() {
        super("ingredients");
    }
}