import { FultonApp, FultonAppOptions, authorized, AccessToken, Request, Response, EntityRouter, entityRouter, OperationResult, QueryParams, OperationOneResult, OperationStatus } from "../../src/index";
import { UserServiceMock } from "../helpers/user-service-mock";
import { HttpTester, HttpResult } from "../helpers/http-tester";
import { Hotdog } from "../helpers/entities/hot-dog";
import { MongoHelper } from "../helpers/mongo-helper";
import { sampleData } from "../support/sample-data";
import { Author } from "../helpers/entities/author";
import { Tag } from "../helpers/entities/tag";


@entityRouter("/hotdogs", Hotdog)
class HotdogEntityRouter extends EntityRouter<Hotdog>{
}

class MyApp extends FultonApp {
    protected onInit(options: FultonAppOptions): void {
        options.entities = [Hotdog, Author, Tag];
        options.routers = [HotdogEntityRouter];

        options.databases.set("default", {
            type: "mongodb",
            url: "mongodb://localhost:27017/fulton-test"
        });
    }
}

describe('EntityRouter Integration Test', () => {
    let app: MyApp;
    let httpTester: HttpTester;

    beforeAll(async () => {
        app = new MyApp();
        httpTester = new HttpTester(app);
        await httpTester.start();

        await MongoHelper.insertData(sampleData, true);
    });

    afterAll(async () => {
        return httpTester.stop();
    });

    it('should return all hotdogs', async () => {
        let result = await httpTester.get("/hotdogs", {
        })

        expect(result.response.statusCode).toEqual(200);

        let queryResult: OperationResult = result.body;
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

        let queryResult: OperationResult = result.body;
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

        let queryResult: OperationResult = result.body;
        expect(queryResult.data.length).toEqual(3);
        expect(queryResult.pagination.total).toEqual(13);
    });

    it('should return hotdogs with sorting', async () => {
        let params: QueryParams = {
            sort: {
                hotdogId: -1
            },
            pagination: {
                size: 5
            }
        }

        let result = await httpTester.get("/hotdogs", params)

        expect(result.response.statusCode).toEqual(200);

        let queryResult: OperationResult<Hotdog> = result.body;
        expect(queryResult.data[0].hotdogId).toEqual("not-hotdog-2");
        expect(queryResult.data[1].hotdogId).toEqual("not-hotdog-1");
        expect(queryResult.data[2].hotdogId).toEqual("9");
    });

    it('should return hotdogs with filter', async () => {
        let params: QueryParams = {
            filter: {
                name: {
                    "$regex": "bo",
                    "$options": "i"
                }
            }
        }

        let result = await httpTester.get("/hotdogs", params)

        expect(result.response.statusCode).toEqual(200);

        let queryResult: OperationResult<Hotdog> = result.body;
        expect(queryResult.data.length).toEqual(2);
    });

    it('should return hotdogs with filter $or', async () => {
        let params: QueryParams = {
            filter: {
                $or: [
                    { hotdogId: "2" },
                    { name: { $like: "bo" } }
                ]
            }
        }

        let result = await httpTester.get("/hotdogs", params)

        expect(result.response.statusCode).toEqual(200);

        let queryResult: OperationResult<Hotdog> = result.body;
        expect(queryResult.data.length).toEqual(3);
    });

    it('should return one hotdog with :id', async () => {
        let result = await httpTester.get("/hotdogs/5")

        expect(result.response.statusCode).toEqual(200);

        let queryResult: OperationOneResult<Hotdog> = result.body;
        expect(queryResult.data.hotdogId).toEqual("5");
    });

    it('should insert a hotdog', async () => {
        let data = {
            "name": "Test",
            "location": [
                100,
                -100
            ],
            "address": "earth",
            "review": "great",
            "author": { "id": "624" },
            "picture": "no"
        } as Hotdog;

        let result = await httpTester.post("/hotdogs", {
            data: data
        })

        expect(result.response.statusCode).toEqual(200);

        let queryResult: OperationOneResult<Hotdog> = result.body;
        expect(queryResult.data.hotdogId).toBeTruthy();

        delete queryResult.data.hotdogId;

        expect(queryResult.data).toEqual(data);
    });

    it('should update a hotdog', async () => {
        let data = {
            "name": "Test",
            "address": "earth",
            "review": "great",
            "author": { "id": "123" },
            "picture": "no"
        } as Hotdog;

        let result = await httpTester.patch("/hotdogs/3", {
            data: data
        })

        expect(result.response.statusCode).toEqual(202);
    });

    it('should delete a hotdog', async () => {
        let result = await httpTester.delete("/hotdogs/2")

        expect(result.response.statusCode).toEqual(202);
    });


    it('should load a hotdog with author', async () => {
        let result = await httpTester.get("/hotdogs/1", {
            includes: ["author"]
        })

        expect(result.response.statusCode).toEqual(200);

        let queryResult: OperationOneResult<Hotdog> = result.body;
        let author = queryResult.data.author as Author;
        expect(author.id).toEqual("965");
        expect(author.name).toEqual("Miyah Myles");
    });

    it('should load a hotdog with author.tags', async () => {
        let result = await httpTester.get("/hotdogs/1", {
            includes: ["author.tags"]
        })

        expect(result.response.statusCode).toEqual(200);

        let queryResult: OperationOneResult<Hotdog> = result.body;
        let author = queryResult.data.author as Author;
        expect(author.id).toEqual("965");
        expect(author.name).toEqual("Miyah Myles");
        expect(author.tags.length).toEqual(2);
    });
});