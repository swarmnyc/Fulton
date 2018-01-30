import { FultonApp, FultonAppOptions, authorize, AccessToken, Request, Response, FultonEntityRouter, EntityRouter, QueryResult, QueryParams } from "../../src/index";
import { UserServiceMock } from "../helpers/user-service-mock";
import { HttpTester, HttpResult } from "../helpers/http-tester";
import { Hotdog } from "../helpers/entities/hot-dog";
import { MongoHelper } from "../helpers/mongo-helper";
import { sampleData } from "../support/sample-data";


@EntityRouter("/hotdogs", Hotdog)
class HotdogEntityRouter extends FultonEntityRouter<Hotdog>{
}

class MyApp extends FultonApp {
    protected onInit(options: FultonAppOptions): void {
        options.entities = [Hotdog];
        options.routers = [HotdogEntityRouter];

        options.databases.set("default", {
            type: "mongodb",
            url: "mongodb://localhost:27017/fulton-test"
        });
    }
}

xdescribe('MongoEntityRouter Integration Test', () => {
    let app: MyApp;
    let httpTester: HttpTester;

    beforeAll(async () => {
        app = new MyApp();
        httpTester = new HttpTester(app);
        await httpTester.start();

        // TODO: make init simple data better
        // await MongoHelper.insertData({ hotdogs: sampleData.hotdogs })
    });

    afterAll(async () => {
        return httpTester.stop();
    });

    it('should return all hotdogs', async () => {
        let result = await httpTester.get("/hotdogs", {
        })

        expect(result.response.statusCode).toEqual(200);

        let queryResult: QueryResult = result.body;
        expect(queryResult.data.length).toEqual(13);
        expect(queryResult.pagination.total).toEqual(13);
    });

    it('should return 5 hotdogs', async () => {
        let params: QueryParams = {
            pagination: {
                size: 5
            }
        }

        let result = await httpTester.get("/hotdogs", params)

        expect(result.response.statusCode).toEqual(200);

        let queryResult: QueryResult = result.body;
        expect(queryResult.data.length).toEqual(5);
        expect(queryResult.pagination.total).toEqual(13);
    });

    it('should return the last 3 hotdogs', async () => {
        let params: QueryParams = {
            pagination: {
                index: 2, // page 3
                size: 5
            }
        }

        let result = await httpTester.get("/hotdogs", params)

        expect(result.response.statusCode).toEqual(200);

        let queryResult: QueryResult = result.body;
        expect(queryResult.data.length).toEqual(3);
        expect(queryResult.pagination.total).toEqual(13);
    });

    it('should return hotdogs and not return hide columns', async () => {
        let params: QueryParams = {
            pagination: {
                size: 5
            }
        }

        let result = await httpTester.get("/hotdogs", params)

        expect(result.response.statusCode).toEqual(200);

        let queryResult: QueryResult = result.body;
        expect(queryResult.data.length).toEqual(3);
        expect(queryResult.pagination.total).toEqual(13);
    });
});