import { EntityRouter, Router, Middleware, Request, Response, injectable, httpGet, router, inject, authorize, authorizeByRole, EntityService, entityRouter } from "fulton-server"
import { Food } from "../entities/food";

@entityRouter(["api", /foods?/], Food, authorize(), authorizeByRole("admin"))
export class FoodRouter extends EntityRouter<Food> {
    constructor() {
        super({} as EntityService<Food>)
    }
}