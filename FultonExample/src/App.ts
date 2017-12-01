import { FultonApp, FultonAppOptions } from "fulton"
import { FoodDataSet } from "./datasets/FoodDataSet";
import { IContainer } from "tsioc";

import { FoodDataService } from "./services/FoodDataService";

export class App extends FultonApp {
    async onInit(options: FultonAppOptions, container: IContainer) {
        options.authRouters = [];
        options.dotenvPath = ".test.nev";
        options.authenticates = [];
        options.middlewares = [];

        // register service
        container.register(FoodDataService)
    }
}

let app = new App();

app.start().then(() => {
    console.log("App Start");
});