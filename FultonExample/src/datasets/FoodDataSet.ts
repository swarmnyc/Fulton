import { Food } from "../models/Food";
import { MongoDataSet } from "fulton-default";

import { Injectable } from "tsioc";

// will try other orm
@Table("name")
export class FoodScheam implements Food{
    
}

@Injectable()
export class FoodDataSet extends MongoDataSet<Food>{
    constructor() {
        super(FoodScheam);
    }
}