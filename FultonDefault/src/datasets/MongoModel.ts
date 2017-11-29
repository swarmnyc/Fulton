import { ObjectID } from "mongodb";

export interface MongoModel {
    _id? : string | ObjectID;
}