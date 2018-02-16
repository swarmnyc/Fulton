import { getConnection, getMongoManager } from 'typeorm';
import { Hotdog } from './entities/hot-dog';
import { Author } from './entities/author';
import { Tag } from './entities/tag';


export class MongoHelper {
    static async insertData(collections: any, reset?: boolean): Promise<any> {
        let manager = getMongoManager();

        if (reset) {
            await manager.connection.dropDatabase();
        }

        let tasks = Object.getOwnPropertyNames(collections).map(name => {
            let collection = collections[name];
            return manager.insertMany(collection.type, collection.data);
        });

        await Promise.all(tasks);
    };
}