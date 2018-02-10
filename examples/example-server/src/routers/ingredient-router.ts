import { EntityRouter, Router, Middleware, Request, Response, injectable, httpGet, router, inject, authorize, authorizeByRole, EntityService, entityRouter } from "fulton-server"
import { Food } from "../entities/food";
import { Ingredient } from "../entities/ingredient";

@entityRouter("/api/ingredients", Ingredient)
export class IngredientRouter extends EntityRouter<Ingredient> {
}