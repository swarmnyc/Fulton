import { EntityRouter, Router, Middleware, Request, Response, injectable, httpGet, router, inject, authorize, authorizeByRole, EntityService } from "fulton-server"
import { Food } from "../entities/food";

@router(["api", /foods?/], authorize(), authorizeByRole("admin"))
export class FoodRouter extends EntityRouter<Food> {
    constructor(){
        super({} as EntityService<Food>)
    }
}