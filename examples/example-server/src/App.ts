import { FultonApp, FultonAppOptions } from "fulton-server"
import { IContainer } from "tsioc";

import { FoodEntityService } from "./services/FoodDataService";
import { FoodRepository, Food } from "./entity/Food";
import { createConnection } from "typeorm";
import { Ingredient, IngredientRepository } from "./entity/Ingredient";

export class App extends FultonApp {
    async onInit(options: FultonAppOptions, container: IContainer): Promise<any> {
        options.authRouters = [];
        options.dotenvPath = ".test.nev";
        options.authenticates = [];
        options.middlewares = [];

        // move to FultonApp
        await createConnection({
            "type": "mongodb",
            "host": "localhost",
            "port": 27017,
            "database": "typeorm-test"
         }).then(conn => {
            container.registerSingleton(FoodRepository, conn.getMongoRepository(Food))
            container.registerSingleton(IngredientRepository, conn.getMongoRepository(Ingredient))
        })

        // register service
    }
}

let app = new App();

app.start().then(() => {
    console.log("App Start");
});