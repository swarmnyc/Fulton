import { ObjectID } from 'bson';
import * as lodash from 'lodash';
import { EntityService } from '../../src/entities/entity-service';
import { FultonApp } from '../../src/fulton-app';
import { ICacheServiceProvider } from '../../src/interfaces';
import { DiKeys } from '../../src/keys';
import { FultonAppOptions } from '../../src/options/fulton-app-options';
import { Category } from '../entities/category';
import { MongoHelper } from "../helpers/mongo-helper";
import { sampleData } from "../support/sample-data";

class MyApp extends FultonApp {
    protected onInit(options: FultonAppOptions): void {
        options.entities = [Category];
        options.cache.enabled = true;

        options.databases.set("default", {
            type: "mongodb",
            url: "mongodb://localhost:27017/fulton-test"
        });

        options.cache.set({
            type: "redis",
            connectionOptions: {
                host: "localhost"
            }
        })
    }
}

describe('Redis Cache Service', () => {
    let app: MyApp;

    beforeAll(async () => {
        app = new MyApp();
        await app.init();
        await MongoHelper.insertData(lodash.pick(sampleData, ["categories"]), true);
    });

    beforeEach(() => {
        app.getInstance<ICacheServiceProvider>(DiKeys.CacheServiceProvider).resetAll();
    });

    afterAll(async () => {
        await app.stop()
    })

    it('should cache data on find', async () => {
        let entityService = app.getEntityService(Category) as EntityService<Category>
        let cacheService = entityService["cache"]["service"]
        let spyGet = spyOn(cacheService, "get").and.callThrough()
        let spySet = spyOn(cacheService, "set").and.callThrough()

        let actualResult = JSON.stringify([
            {
                "categoryId": "000000000000000000000001",
                "categoryName": "Beverages",
                "description": "Soft drinks coffees teas beers and ales"
            },
            {
                "categoryId": "000000000000000000000002",
                "categoryName": "Confections",
                "description": "Desserts candies and sweet breads"
            }
        ])

        let result = await entityService.find({
            filter: {
                categoryId: {
                    $in: ["000000000000000000000001", "000000000000000000000002"]
                }
            },
            cache: true
        })

        expect(JSON.stringify(result.data)).toEqual(actualResult);

        expect(spyGet.calls.count()).toEqual(1)
        expect(spySet.calls.count()).toEqual(1)

        result = await entityService.find({
            filter: {
                categoryId: {
                    $in: ["000000000000000000000001", "000000000000000000000002"]
                }
            },
            cache: true
        })

        expect(JSON.stringify(result.data)).toEqual(actualResult);
        expect(result.data[0].constructor).toEqual(Category);

        expect(spyGet.calls.count()).toEqual(2)
        expect(spySet.calls.count()).toEqual(1)
    });

    it('should cache data on findOne', async () => {
        let entityService = app.getEntityService(Category) as EntityService<Category>
        let cacheService = entityService["cache"]["service"]
        let spyGet = spyOn(cacheService, "get").and.callThrough()
        let spySet = spyOn(cacheService, "set").and.callThrough()

        let actualResult = JSON.stringify({
            "categoryId": "000000000000000000000001",
            "categoryName": "Beverages",
            "description": "Soft drinks coffees teas beers and ales"
        })

        let result = await entityService.findOne({ filter: { categoryId: "000000000000000000000001" }, cache: true })

        expect(JSON.stringify(result)).toEqual(actualResult);
        expect(result.constructor).toEqual(Category)

        expect(spyGet.calls.count()).toEqual(1)
        expect(spySet.calls.count()).toEqual(1)

        result = await entityService.findOne({ filter: { categoryId: "000000000000000000000001" }, cache: true })

        expect(JSON.stringify(result)).toEqual(actualResult);
        expect(result.constructor).toEqual(Category);

        expect(spyGet.calls.count()).toEqual(2)
        expect(spySet.calls.count()).toEqual(1)

        expect(result.constructor).toEqual(Category)
    });

    it('should cache data on findById', async () => {
        let entityService = app.getEntityService(Category) as EntityService<Category>
        let cacheService = entityService["cache"]["service"]
        let spyGet = spyOn(cacheService, "get").and.callThrough()
        let spySet = spyOn(cacheService, "set").and.callThrough()

        let actualResult = JSON.stringify({
            "categoryId": "000000000000000000000001",
            "categoryName": "Beverages",
            "description": "Soft drinks coffees teas beers and ales"
        })

        let result = await entityService.findById("000000000000000000000001", { cache: true })

        expect(JSON.stringify(result)).toEqual(actualResult);
        expect(result.constructor).toEqual(Category)

        expect(spyGet.calls.count()).toEqual(1)
        expect(spySet.calls.count()).toEqual(1)

        result = await entityService.findById("000000000000000000000001", { cache: true })

        expect(JSON.stringify(result)).toEqual(actualResult);
        expect(result.constructor).toEqual(Category);

        expect(spyGet.calls.count()).toEqual(2)
        expect(spySet.calls.count()).toEqual(1)

        expect(result.constructor).toEqual(Category)
    });

    it('should re get cache after create', async () => {
        let entityService = app.getEntityService(Category) as EntityService<Category>
        let cacheService = entityService["cache"]["service"]
        let spyGet = spyOn(cacheService, "get").and.callThrough()
        let spySet = spyOn(cacheService, "set").and.callThrough()
        let spyReset = spyOn(cacheService, "reset").and.callThrough()

        await entityService.findById("000000000000000000000001", { cache: true })

        expect(spyGet.calls.count()).toEqual(1)
        expect(spySet.calls.count()).toEqual(1)

        await entityService.create({
            "categoryId": new ObjectID(),
            "categoryName": "Test",
            "description": "Test"
        })

        await entityService.findById("000000000000000000000001", { cache: true })

        expect(spyGet.calls.count()).toEqual(1) // data is dirty, skip get
        expect(spySet.calls.count()).toEqual(2)
        expect(spyReset.calls.count()).toEqual(0)
    });

    it('should re get cache after update', async () => {
        let entityService = app.getEntityService(Category) as EntityService<Category>
        let cacheService = entityService["cache"]["service"]
        let spyGet = spyOn(cacheService, "get").and.callThrough()
        let spySet = spyOn(cacheService, "set").and.callThrough()
        let spyReset = spyOn(cacheService, "reset").and.callThrough()

        await entityService.findById("000000000000000000000001", { cache: true })

        expect(spyGet.calls.count()).toEqual(1)
        expect(spySet.calls.count()).toEqual(1)

        await entityService.update("000000000000000000000003", {
            "categoryName": "Test",
            "description": "Test"
        })

        await entityService.findById("000000000000000000000001", { cache: true })

        expect(spyGet.calls.count()).toEqual(1)
        expect(spySet.calls.count()).toEqual(2)
        expect(spyReset.calls.count()).toEqual(0)
    });

    it('should re get cache after delete', async () => {
        let entityService = app.getEntityService(Category) as EntityService<Category>
        let cacheService = entityService["cache"]["service"]
        let spyGet = spyOn(cacheService, "get").and.callThrough()
        let spySet = spyOn(cacheService, "set").and.callThrough()
        let spyReset = spyOn(cacheService, "reset").and.callThrough()

        await entityService.findById("000000000000000000000001", { cache: true })

        expect(spyGet.calls.count()).toEqual(1)
        expect(spySet.calls.count()).toEqual(1)

        await entityService.delete("000000000000000000000003")

        await entityService.findById("000000000000000000000001", { cache: true })

        expect(spyGet.calls.count()).toEqual(1)
        expect(spySet.calls.count()).toEqual(2)
        expect(spyReset.calls.count()).toEqual(0)
    });
});