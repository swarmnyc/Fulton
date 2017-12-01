import { MongoClient, Db, Collection } from "mongodb"

import { ObjectID } from "mongodb";
import { IFultonDataSet, IFultonSchema, FultonQuery, FultonQueryWhere } from "./IFultonDataSet";
import { Type } from "tsioc";

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
export class MongoDataSet<TModel> implements IFultonDataSet<TModel> {
    scheam: IFultonSchema;
    
    collection: Promise<Collection<TModel>>

    constructor(public type: Type<TModel>) {
        // this.collection = connect().then((db) => {
        //     return db.collection<TModel>(this.tableName);
        // });
    }

    find(query?: FultonQuery): Promise<TModel[]> {
        return this.collection.then((coll) => {
            query = query || {};

            var cursor = coll.find()
            var skip: number
            return coll.find(query.where, query.fields, skip, query.limit).toArray();
        });
    }

    create(obj: TModel): Promise<TModel> {
        return this.collection.then((coll) => {
            return coll.insert(obj).then((result) => {
                return result.ops[0];
            });
        });
    }

    findById(id: string | number): Promise<TModel> {
        throw new Error("Method not implemented.");
    }

    updateById(id: string | number, obj: TModel): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    deleteById(id: string | number): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    
    update(obj: TModel): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    delete(obj: TModel): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    updateBy(where: FultonQueryWhere, obj: TModel): Promise<number> {
        throw new Error("Method not implemented.");
    }
    deleteBy(where: FultonQueryWhere): Promise<number> {
        throw new Error("Method not implemented.");
    }
    blukCreate(objs: TModel[]): Promise<TModel[]> {
        throw new Error("Method not implemented.");
    }
    blukUpdate(objs: TModel[]): Promise<number> {
        throw new Error("Method not implemented.");
    }
    blukDelete(objs: TModel[]): Promise<number> {
        throw new Error("Method not implemented.");
    }
}