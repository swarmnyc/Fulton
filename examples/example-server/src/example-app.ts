import { FultonApp, FultonAppOptions, FultonDiContainer } from "fulton-server"

import { FoodRouter } from "./routers/food-router";

export class ExampleApp extends FultonApp {
    protected async onInit(options: FultonAppOptions): Promise<any> {
        options.routers = [
            FoodRouter
        ];

        options.index.message = "hello world";

        options.index.filepath = "./assets/index.html";

        options.index.handler = (req, res, next) => {
            res.send("Hello World!!");
        };

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