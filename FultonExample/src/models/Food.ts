import { MongoModel } from "fulton-default"
import { Ingredient } from "./Ingredient";

export interface Food extends MongoModel {
    name?: String;
    category?: String;
    ingredients?: Ingredient[];
}