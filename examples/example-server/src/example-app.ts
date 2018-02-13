import { FultonApp, FultonAppOptions } from 'fulton-server';

import { Food } from './entities/food';
import { FoodRouter } from "./routers/food-router";
import { Ingredient } from './entities/ingredient';
import { IngredientRouter } from './routers/ingredient-router';

export class ExampleApp extends FultonApp {
    protected async onInit(options: FultonAppOptions): Promise<any> {
        options.routers = [
            FoodRouter,
            IngredientRouter
        ];

        options.index.message = "hello world";

        options.entities = [Food, Ingredient]
        options.databases.set("default", {
            type: "mongodb",
            url: "mongodb://localhost:27017/fulton-test"
        });

        options.cors.enabled = true;
        options.docs.enabled = true;

        options.identity.enabled = true;
        options.identity.google.enabled = true;
        options.identity.github.enabled = true;
        options.identity.github.clientId = "test";

        options.formatter.jsonApi = true;
    }
}