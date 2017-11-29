import { Food } from "../models/Food";
import { MongoDataSet } from "fulton-default";

import { Injectable } from "tsioc";

@Injectable()
export class FoodDataSet extends MongoDataSet<Food>{
    constructor() {
        super("foods");
    }
}