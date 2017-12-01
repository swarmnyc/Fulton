import { FultonApp, FultonAppOptions } from "fulton"
import { FoodDataSet } from "./datasets/FoodDataSet";
import { IContainer } from "tsioc";

import { FoodDataService } from "./services/FoodDataService";

export class App extends FultonApp {
    onInit(options: FultonAppOptions, container: IContainer): void {
        options.authRouters = [];
        options.dotenvPath = ".test.nev";
        options.authenticates = [];
        options.middlewares = [];
        

        container.register(FoodDataService)
    }
}

new App().start();