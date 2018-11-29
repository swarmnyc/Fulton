import * as lodash from 'lodash';
import { EntityService } from '../../src/entities/entity-service';
import { FultonApp } from '../../src/fulton-app';
import { FultonUser } from '../../src/identity/fulton-impl/fulton-user';
import { FultonUserService } from '../../src/identity/fulton-impl/fulton-user-service';
import { ICacheServiceFactory } from '../../src/interfaces';
import { DiKeys } from '../../src/keys';
import { FultonAppOptions } from '../../src/options/fulton-app-options';
import { Category } from '../entities/category';
import { MongoHelper } from "../helpers/mongo-helper";
import { sleep } from '../helpers/test-helper';
import { sampleData } from "../support/sample-data";

class MyApp extends FultonApp {
    protected onInit(options: FultonAppOptions): void {
        options.entities = [Category];
        options.identity.enabled = true;
        options.cache.enabled = true;

        options.databases.set("default", {
            type: "mongodb",
            url: "mongodb://localhost:27017/fulton-test"
        });

        options.cache.set({
            provider: "redis",
            configs: {
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
        app.getInstance<ICacheServiceFactory>(DiKeys.CacheServiceFactory).resetAll();
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

    it('should cache user by token', async () => {
        let userService = app.userService as FultonUserService

        let cacheService = userService["cacheService"]
        let spyGet = spyOn(cacheService, "get").and.callThrough()
        let spySet = spyOn(cacheService, "set").and.callThrough()

        let user = await userService.register({
            email: "test@test.com",
            username: "test",
            password: "test123"
        })

        let token = await userService.issueAccessToken(user)

        let fetchedUser = await userService.loginByAccessToken(token.access_token)
        await sleep(100)
        expect(spyGet.calls.count()).toEqual(2)
        expect(spySet.calls.count()).toEqual(2)

        fetchedUser = await userService.loginByAccessToken(token.access_token)
        expect(fetchedUser.constructor).toEqual(FultonUser);

        expect(spyGet.calls.count()).toEqual(3)
        expect(spySet.calls.count()).toEqual(2)
    });

    it('should cache fit by wrong token', async () => {
        let userService = app.userService as FultonUserService

        let cacheService = userService["cacheService"]
        let spyGet = spyOn(cacheService, "get").and.callThrough()
        let spySet = spyOn(cacheService, "set").and.callThrough()

        let token = "eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjViZmYyNTIzYTZkNDEzYjMwY2ZiMTE0YiIsInRzIjoxNTQzNDQ3ODQzMzM5fQ.HYjlzIzvezTnWrZA50VKgZ_OksuqCkckVqqQnOqoriE"

        let fetchedUser = await userService.loginByAccessToken(token)
        expect(fetchedUser).toBeNull()

        expect(spyGet.calls.count()).toEqual(1)
        expect(spySet.calls.count()).toEqual(1)

        fetchedUser = await userService.loginByAccessToken(token)
        expect(fetchedUser).toBeNull()

        expect(spyGet.calls.count()).toEqual(2)
        expect(spySet.calls.count()).toEqual(1)
    });
});