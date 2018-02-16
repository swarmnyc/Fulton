import { FultonApp, FultonAppOptions, authorized, AccessToken, Request, Response, EntityRouter, entityRouter, OperationResult, QueryParams, OperationOneResult, OperationStatus, IEntityService, injectable, Type } from "../../src/index";
import { UserServiceMock } from "../helpers/user-service-mock";
import { HttpTester, HttpResult } from "../helpers/http-tester";
import { MongoHelper } from "../helpers/mongo-helper";
import { sampleData } from "../support/sample-data";
import { Connection } from "typeorm";
import { getRelatedToMetadata } from '../../src/entities/related-decorators-helpers';
import { Employee } from '../entities/employee';
import { Territory } from '../entities/territory';
import { Category } from '../entities/category';

@injectable()
class FakeEntityService implements IEntityService<any>{
    find(queryParams: QueryParams): Promise<OperationResult<any>> {
        throw new Error("Method not implemented.");
    }
    findOne(queryParams: QueryParams): Promise<OperationOneResult<any>> {
        throw new Error("Method not implemented.");
    }
    findById(id: any, QueryParams?: QueryParams): Promise<OperationOneResult<any>> {
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

@entityRouter("/employees", Employee)
class EmployeeEntityRouter extends EntityRouter<Employee>{
    constructor(service: FakeEntityService) {
        super(service)
    }
}

@entityRouter(["api", /territor(y|ies)?/i], Territory)
class TerritoryEntityRouter extends EntityRouter<Territory>{
    constructor(service: FakeEntityService) {
        super(service)
    }
}

class MyApp extends FultonApp {
    protected onInit(options: FultonAppOptions): void {
        options.entities = [Employee, Category, Territory];
        options.routers = [EmployeeEntityRouter, TerritoryEntityRouter];
        options.services = [FakeEntityService];

        let conn = new Connection({
            type: "mongodb",
            entities: options.entities
        });

        conn["buildMetadatas"]();
        this.connections = [conn];
        this.entityMetadatas = new Map();
        this.connections[0].entityMetadatas.forEach((metadata) => {
            metadata.relatedToMetadata = getRelatedToMetadata(metadata.target);
            this.entityMetadatas.set(metadata.target as Type, metadata);
        })

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
        app.connections = [];
        return httpTester.stop();
    });

    it('should return docs', async () => {
        let result = await httpTester.get("/docs")

        expect(result.response.statusCode).toEqual(200);
    });

    it('should return docs.json', async () => {
        let result = await httpTester.get("/docs.json")

        expect(result.response.statusCode).toEqual(200);
    });
});