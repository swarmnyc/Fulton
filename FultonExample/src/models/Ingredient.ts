import { MongoModel } from "fulton-default"

export interface Ingredient extends MongoModel {
    name?: String;
    category?: String;
}