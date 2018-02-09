import { FultonApp, FultonAppOptions, DiContainer, NextFunction, Request, Response } from "fulton-server"

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

        this.express.all("/error", (req: Request, res: Response) => {
            throw new Error("test error handler");
        });

        options.databases.set("default", {
            type: "mongodb",
            url: "mongodb://localhost:27017/fulton-test"
        });

        options.cors.enabled = true;
        options.docs.enabled = true;
    }
}