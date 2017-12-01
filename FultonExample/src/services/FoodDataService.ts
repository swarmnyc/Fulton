import { FultonDataService } from "fulton";
import { Injectable, Inject } from "tsioc";
import { Food } from "../models/Food";
import { FoodDataSet } from "../datasets/FoodDataSet";
import { IngredientDataSet } from "../datasets/IngredientDataSet";

@Injectable
export class FoodDataService extends FultonDataService<Food> {
    constructor( @Inject public foodDataSet: FoodDataSet, @Inject public ingredientDataSet: IngredientDataSet) {
        super(foodDataSet);
    }

    findByName(name: String): Promise<Food> {
        return this.find({ where: { name: name }, limit: 1 }).then((foods) => {
            return foods[0];
        });
    }

    create(obj: Food): Promise<Food> {
        // do some for ingredient like

        return this.foodDataSet.create(obj).then((newObj) => {
            return this.ingredientDataSet.blukCreate(obj.ingredients).then(() => {
                return newObj;
            });
        });
    }
}