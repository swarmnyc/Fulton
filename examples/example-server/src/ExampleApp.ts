import { FultonApp, FultonAppOptions, FultonDiContainer } from "fulton-server"

import { FoodRouter } from "./routers/FoodRouter";

export class ExampleApp extends FultonApp {
    protected async onInit(options: FultonAppOptions): Promise<any> {
        options.appName = "ExampleApp";

        options.routers = [
            FoodRouter
        ];

        options.indexMessage = "hello world";

        options.indexFilePath = "./assets/index.html";

        options.indexHandler = (req, res, next) => {
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