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

        options.databases.set("default", {
            type: "mongodb",
            url: "mongodb://localhost:27017/fulton-test"
        });

        options.cors.enabled = true;

        options.server.httpPort = 3000;

        options.identify.enabled = true;
        options.identify.google.enabled = true;
        options.identify.google.clientId = "291510735539-rbn3kfl94ic9tsa8rhamhcq58sdla70b.apps.googleusercontent.com";
        options.identify.google.clientSecret = "P5ac34At8dIC9S4ga_cf0ilb";
        
        // options.identify.google.scope = "profile email";
        // options.identify.google.callbackPath = "/api/auth/oauth2callback";
        // options.identify.google.loadUserProfile = false;
    }
}