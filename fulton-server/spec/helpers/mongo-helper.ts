import { getMongoManager } from 'typeorm';

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

    static reset(): Promise<any> {
        return getMongoManager().connection.dropDatabase();
    };
}