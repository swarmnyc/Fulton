import { FultonApp } from "../src/fulton-app";
import { FultonAppOptions } from "../src/options/fulton-app-options";
import { AppLauncher } from '../src/app-launcher';
import { EventKeys } from '../src/keys';

var dotenv = require('dotenv');

dotenv.config({ path: "./spec/secret.env" })

//this file uses to test app for oauth
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

        // remove database
        this.events.once(EventKeys.AppDidInitDatabases, () => {
            this.connections[0].dropDatabase();
        })
    }
}

AppLauncher.create(MyApp).launch()


/*
test cases:

1. 
- visit http://localhost:3000/auth/google
- ok, if it return tokens

2. 
- post http://localhost:3000/auth/register to create user
- visit http://localhost:3000/auth/google and put the user token on headers
- ok, if the google identity link to the user



*/