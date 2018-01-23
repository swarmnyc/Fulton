import { FultonApp, FultonAppOptions, FultonDiContainer, NextFunction, Request, Response } from "fulton-server"

import { FoodRouter } from "./routers/food-router";

export class ExampleApp extends FultonApp {
    protected async onInit(options: FultonAppOptions): Promise<any> {
        options.routers = [
            FoodRouter
        ];

        options.index.message = "hello world";
        options.index.filepath = "./assets/index.html";
        options.index.handler = (req: Request, res: Response, next: NextFunction) => {
            res.send("Hello World!!");
        };

        options.staticFile.enabled = true;
        options.staticFile.folders = [
            { path: "/public", folder: "./assets/" },
            { folder: "./assets/" }
        ]

        this.server.all("/error", (req, res) => {
            throw new Error("test error handler");
        });

        options.cors.enabled = true;

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