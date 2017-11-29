import { MongoModel } from "fulton-default"

export interface Food extends MongoModel {
    name?: String;
    category?: String;
}