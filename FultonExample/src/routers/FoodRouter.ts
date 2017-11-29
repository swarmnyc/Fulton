import { FultonModelRouter } from "fulton"
import { FoodDataSet } from "../datasets/FoodDataSet";
import { Injectable, Inject } from "tsioc";
import { Food } from "../models/Food";

export default class FoodRouter extends FultonModelRouter {
    constructor(@Inject private foodDataSet: FoodDataSet) {
        super(foodDataSet)
    }

    test() : Promise<Food[]>{
        return this.foodDataSet.find();
    }
}