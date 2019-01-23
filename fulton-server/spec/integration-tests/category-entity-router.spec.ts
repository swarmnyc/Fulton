import * as lodash from 'lodash';
import { FultonApp } from '../../src/fulton-app';
import { OperationManyResult, OperationOneResult } from "../../src/types";
import { FultonAppOptions } from '../../src/options/fulton-app-options';
import { EntityRouter } from '../../src/routers/entity-router';
import { entityRouter } from '../../src/routers/route-decorators';
import { HttpTester } from "../../src/test/http-tester";
import { Category } from '../entities/category';
import { MongoHelper } from "../helpers/mongo-helper";
import { sampleData } from "../support/sample-data";

@entityRouter("categories", Category)
class CategoryRouter extends EntityRouter<Category>{ }

class MyApp extends FultonApp {
    protected onInit(options: FultonAppOptions): void {
        options.entities = [Category];
        options.routers = [CategoryRouter];

        options.databases.set("default", {
            type: "mongodb",
            url: "mongodb://localhost:27017/fulton-test"
        });
    }
}

describe('CategoryEntityRouter', () => {
    let app: MyApp;
    let httpTester: HttpTester;

    beforeAll(async () => {
        app = new MyApp();
        httpTester = new HttpTester(app);
        await httpTester.start();
        await MongoHelper.insertData(lodash.pick(sampleData, ["categories"]), true);
    });

    afterAll(() => {
        return httpTester.stop();
    });

    it('should return the categories filter', async () => {
        let result = await httpTester.get("/categories", {
            filter: {
                categoryId: {
                    $in: ["000000000000000000000001", "000000000000000000000002"]
                }
            }
        })

        expect(result.response.statusCode).toEqual(200);

        let queryResult: OperationManyResult = result.body;
        expect(queryResult.data.length).toEqual(2);
        expect(queryResult.data).toEqual([
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
        ]);
    });

    it('should return the categories by territory id', async () => {
        let result = await httpTester.get("/categories/000000000000000000000001")

        expect(result.response.statusCode).toEqual(200);

        let queryResult: OperationOneResult = result.body;

        expect(queryResult.data).toEqual({
            "categoryId": "000000000000000000000001",
            "categoryName": "Beverages",
            "description": "Soft drinks coffees teas beers and ales"
        });
    });
});