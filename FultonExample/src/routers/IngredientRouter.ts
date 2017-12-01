import { FultonModelRouter, IFultonContext, Get } from "fulton"
import { FoodDataSet } from "../datasets/FoodDataSet";
import { Injectable, Inject } from "tsioc";
import { Food } from "../models/Food";
import { FoodDataService } from "../services/FoodDataService";

export default class FoodRouter extends FultonModelRouter {
    constructor( @Inject private foodDataService: FoodDataService) {
        super(foodDataService)

        this.listDelegate = this.foodDataService.ingredientDataSet.find;
        this.detailDelegate = this.foodDataService.ingredientDataSet.findById;
    }
}