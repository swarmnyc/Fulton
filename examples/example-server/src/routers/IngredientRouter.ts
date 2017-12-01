import { FultonModelRouter, IFultonContext, Get } from "fulton-server"
import { Inject } from "tsioc";
import { FoodDataService } from "../services/FoodDataService";

export default class FoodRouter extends FultonModelRouter {
    constructor( @Inject private foodDataService: FoodDataService) {
        super(foodDataService)

        this.listDelegate = this.foodDataService.ingredientDataSet.find;
        this.detailDelegate = this.foodDataService.ingredientDataSet.findById;
    }
}