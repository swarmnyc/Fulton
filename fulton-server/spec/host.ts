import { FultonApp } from "../src/fulton-app";
import { FultonAppOptions } from "../src/options/fulton-app-options";
import { AppLauncher } from '../src/app-launcher';

var dotenv = require('dotenv');

dotenv.config({path: "./spec/secret.env"})

//test app for oauth
class MyApp extends FultonApp {
    protected onInit(options: FultonAppOptions): void {
        options.identity.enabled = true;
        options.identity.google.enabled = true;
        options.identity.google.clientId = process.env["google_client_id"]
        options.identity.google.clientSecret = process.env["google_client_secret"];

        options.databases.set("default", {
            type: "mongodb",
            url: "mongodb://localhost:27017/fulton-test"
        });
    }
}

AppLauncher.create(MyApp).launch()