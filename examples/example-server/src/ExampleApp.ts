import { FultonApp, FultonAppOptions, FultonDiContainer } from "fulton-server"

import { FoodEntityService } from "./services/FoodDataService";
import { FoodRepository, Food } from "./entity/Food";
import { Ingredient, IngredientRepository } from "./entity/Ingredient";

export class ExampleApp extends FultonApp {
    protected async onInit(options: FultonAppOptions, container: FultonDiContainer): Promise<any> {
        options.appName = "ExampleApp";
        // options.server.httpPort = 1234;
    
        // options.authRouters = [];
        // options.dotenvPath = ".test.nev";

        // move to FultonApp
        // await createConnection({
        //     "type": "mongodb",
        //     "host": "localhost",
        //     "port": 27017,
        //     "database": "typeorm-test"
        //  }).then(conn => {
        //     container.registerSingleton(FoodRepository, conn.getMongoRepository(Food))
        //     container.registerSingleton(IngredientRepository, conn.getMongoRepository(Ingredient))
        // })

        // register service
    }
}