import { FultonEntityRouter, IFultonRouterContext, Get } from "fulton-server"
import { Inject } from "tsioc";
import { FoodEntityService } from "../services/FoodDataService";
import { Repository } from "typeorm";
import { Food } from "../entity/Food";


export default class FoodRouter extends FultonEntityRouter<Food> {
    constructor( @Inject private foodDataService: FoodEntityService) {
        super(foodDataService)

        this.detailDelegate = this.foodDataService.findByName;
    }

    @Get("other")
    other1(context: IFultonRouterContext) {
        context.body = "other1"
    }

    @Get("other/:id")
    other2(context: IFultonRouterContext) {
        context.body = "other2"
    }
}