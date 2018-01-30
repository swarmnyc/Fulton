import { getConnection, getMongoManager } from 'typeorm';
import { Hotdog } from './entities/hot-dog';

let models = {
    "hotdogs": Hotdog
};


export class MongoHelper {
    static insertData(data: any): Promise<any> {
        let manager = getMongoManager();
        
        let tasks = Object.getOwnPropertyNames(data).map(name => {
            return manager.insertMany(Hotdog, data[name]);
        });

        return Promise.all(tasks);
    };
}