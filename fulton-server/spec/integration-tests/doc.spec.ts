import { FultonApp, FultonAppOptions, authorize, AccessToken, Request, Response, EntityRouter, entityRouter, OperationResult, QueryParams, OperationOneResult, OperationStatus, IEntityService, injectable } from "../../src/index";
import { UserServiceMock } from "../helpers/user-service-mock";
import { HttpTester, HttpResult } from "../helpers/http-tester";
import { Hotdog } from "../helpers/entities/hot-dog";
import { MongoHelper } from "../helpers/mongo-helper";
import { sampleData } from "../support/sample-data";
import { Author } from "../helpers/entities/author";
import { Tag } from "../helpers/entities/tag";

@injectable()
class FakeEntityService implements IEntityService<any>{
    find(queryParams: QueryParams): Promise<OperationResult<any>> {
        throw new Error("Method not implemented.");
    }
    findOne(queryParams: QueryParams): Promise<OperationOneResult<any>> {
        throw new Error("Method not implemented.");
    }
    create(entity: any): Promise<OperationOneResult<any>> {
        throw new Error("Method not implemented.");
    }
    update(id: string, entity: any): Promise<OperationStatus> {
        throw new Error("Method not implemented.");
    }
    delete(id: string): Promise<OperationStatus> {
        throw new Error("Method not implemented.");
    }

}

@entityRouter("/hotdogs", Hotdog)
class HotdogEntityRouter extends EntityRouter<Hotdog>{
    constructor(service: FakeEntityService) {
        super(service)
    }
}

@entityRouter(["api", /authors?/i], Hotdog)
class AuthorEntityRouter extends EntityRouter<Hotdog>{
    constructor(service: FakeEntityService) {
        super(service)
    }
}

class MyApp extends FultonApp {
    protected onInit(options: FultonAppOptions): void {
        options.entities = [Hotdog, Author, Tag];
        options.routers = [AuthorEntityRouter];
        //options.routers = [HotdogEntityRouter, AuthorEntityRouter];
        options.services = [FakeEntityService];

        options.docs.enabled = true;
    }
}

describe('Doc Integration Test', () => {
    let app: MyApp;
    let httpTester: HttpTester;

    beforeAll(async () => {
        app = new MyApp();
        httpTester = new HttpTester(app);
        await httpTester.start();
    });

    afterAll(async () => {
        return httpTester.stop();
    });

    fit('should return docs', async () => {
        let result = await httpTester.get("/docs")

        expect(result.response.statusCode).toEqual(200);
    });

    it('should return docs.json', async () => {
        let result = await httpTester.get("/docs.json")

        expect(result.response.statusCode).toEqual(200);
    });
});