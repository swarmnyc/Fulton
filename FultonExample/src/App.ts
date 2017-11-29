import { FultonApp, FultonAppOptions } from "fulton"
import { FoodDataSet } from "./datasets/FoodDataSet";

export class App extends FultonApp {
    onInit(options: FultonAppOptions): void {
        options.middlewares = [];
    }
}

new App().start();