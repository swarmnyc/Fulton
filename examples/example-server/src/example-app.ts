import { FultonApp, FultonAppOptions } from 'fulton-server';

import { Food } from './entities/food';
import { FoodRouter } from "./routers/food-router";

export class ExampleApp extends FultonApp {
    protected async onInit(options: FultonAppOptions): Promise<any> {
        options.routers = [
            FoodRouter
        ];

        options.index.message = "hello world";

        options.entities = [Food]
        options.databases.set("default", {
            type: "mongodb",
            url: "mongodb://localhost:27017/fulton-test"
        });

        options.cors.enabled = true;
        options.docs.enabled = true;
    }
}