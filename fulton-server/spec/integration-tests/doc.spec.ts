import { Request, Response, OperationManyResult, QueryParams, OperationOneResult, OperationResult, IEntityService, injectable, Type } from "../../src/interfaces";
import { UserServiceMock } from "../helpers/user-service-mock";
import { HttpTester, HttpResult } from "../../src/test/http-tester";
import { MongoHelper } from "../helpers/mongo-helper";
import { sampleData } from "../support/sample-data";
import { Connection } from "typeorm";
import { getRelatedToMetadata } from '../../src/entities/entity-decorators-helpers';
import { Employee } from '../entities/employee';
import { Territory } from '../entities/territory';
import { Category } from '../entities/category';
import { EntityRouter } from '../../src/routers/entity-router';
import { entityRouter } from '../../src/routers/route-decorators';
import { FultonApp } from '../../src/fulton-app';
import { FultonAppOptions } from '../../src/options/fulton-app-options';

@injectable()
class FakeEntityService implements IEntityService<any>{
    find(queryParams: QueryParams): Promise<OperationManyResult<any>> {
        throw new Error("Method not implemented.");
    }
    findOne(queryParams: QueryParams): Promise<OperationOneResult<any>> {
        throw new Error("Method not implemented.");
    }
    findById(id: any, QueryParams?: QueryParams): Promise<OperationOneResult<any>> {
        throw new Error("Method not implemented.");
    }
    count(queryParams?: QueryParams): Promise<OperationOneResult<number>> {
        throw new Error("Method not implemented.");
    }
    create(entity: any): Promise<OperationOneResult<any>> {
        throw new Error("Method not implemented.");
    }
    update(id: string, entity: any): Promise<OperationResult> {
        throw new Error("Method not implemented.");
    }
    delete(id: string): Promise<OperationResult> {
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

    afterAll(() => {
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