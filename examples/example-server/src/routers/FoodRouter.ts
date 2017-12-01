import { FultonModelRouter, IFultonContext, Get } from "fulton-server"
import { Inject } from "tsioc";
import { FoodDataService } from "../services/FoodDataService";

export default class FoodRouter extends FultonModelRouter {
    constructor( @Inject private foodDataService: FoodDataService) {
        super(foodDataService)

        this.detailDelegate = this.foodDataService.findByName;
    }

    @Get("other")
    other1(context: IFultonContext) {
        context.body = "other1"
    }

    @Get("other/:id")
    other2(context: IFultonContext) {
        context.body = "other2"
    }
}