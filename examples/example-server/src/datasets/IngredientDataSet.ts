import { MongoDataSet, Table } from "fulton-server";
import { IIngredient } from "example-core";
import { Injectable } from "tsioc";


// will try other orm
@Table("ingredients")
export class Ingredient implements IIngredient {

}

@Injectable()
export class IngredientDataSet extends MongoDataSet<Ingredient>{
    constructor() {
        super(Ingredient);
    }
}