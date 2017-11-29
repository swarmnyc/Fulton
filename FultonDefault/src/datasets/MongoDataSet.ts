import { IFultonDataSet, FultonDataSetQuery, FultonDataSetWhere } from "fulton";

import { MongoClient, Db, Collection } from "mongodb"
import { resolve } from "dns";
import { MongoModel } from "./MongoModel";

let DB: Promise<Db>;

function connect(): Promise<Db> {
    if (DB == null) {
        DB = new Promise<Db>((resolve, reject) => {
            if (!process.env.DbConnection) {
                reject(new Error("env.DbConnection is undefined"));
                return;
            }

            MongoClient.connect(process.env.DbConnection, (err, db) => {
                if (err) {
                    reject("Can't connection to " + process.env.DbConnection);
                } else {
                    resolve(db)
                }
            });
        })
    }

    return DB;
}

// Use Native Mongo Drive
export class MongoDataSet<TModel extends MongoModel> implements IFultonDataSet<TModel> {
    tableName: string;
    collection: Promise<Collection<TModel>>

    constructor(tableName: string) {
        this.tableName = tableName;

        this.collection = connect().then((db) => {
            return db.collection<TModel>(this.tableName);
        });
    }

    find(query?: FultonDataSetQuery): Promise<TModel[]> {
        return this.collection.then((coll) => {
            query = query || {};

            var cursor = coll.find()
            var skip: number
            return coll.find(query.where, query.fields, skip, query.limit).toArray();
        });
    }

    findOne(where: FultonDataSetWhere): Promise<TModel> {
        throw new Error("Method not implemented.");
    }
    
    create(obj: TModel): Promise<TModel> {
        return this.collection.then((coll) => {
            return coll.insert(obj).then((result) => {
                return result.ops[0];
            });
        });
    }

    update(obj: TModel): Promise<TModel> {
        throw new Error("Method not implemented.");
    }
    updateBy(where: FultonDataSetWhere, obj: TModel): Promise<number> {
        throw new Error("Method not implemented.");
    }
    deleteBy(where: FultonDataSetWhere): Promise<number> {
        throw new Error("Method not implemented.");
    }
    blukCreate(objs: TModel[]): Promise<TModel[]> {
        throw new Error("Method not implemented.");
    }
    blukUpdate(objs: TModel[]): Promise<TModel[]> {
        throw new Error("Method not implemented.");
    }
    blukDelete(objs: TModel[]): Promise<TModel[]> {
        throw new Error("Method not implemented.");
    }
}