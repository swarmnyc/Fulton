import { Connection } from "typeorm";
import { injectable } from "../../src/alias";
import { getRelatedToMetadata } from '../../src/entities/entity-decorators-helpers';
import { FultonApp } from '../../src/fulton-app';
import { IEntityService, OperationManyResult, QueryParams, Type } from "../../src/types";
import { FultonAppOptions } from '../../src/options/fulton-app-options';
import { EntityRouter } from '../../src/routers/entity-router';
import { entityRouter } from '../../src/routers/route-decorators';
import { HttpTester } from "../../src/test/http-tester";
import { Category } from '../entities/category';
import { Employee } from '../entities/employee';
import { Territory } from '../entities/territory';

@injectable()
class FakeEntityService implements IEntityService<any>{
    entityType: Type<any>;

    find(queryParams: QueryParams): Promise<OperationManyResult<any>> {
        throw new Error("Method not implemented.");
    }
    findOne(queryParams: QueryParams): Promise<any> {
        throw new Error("Method not implemented.");
    }
    findById(id: any, QueryParams?: QueryParams): Promise<any> {
        throw new Error("Method not implemented.");
    }
    count(queryParams?: QueryParams): Promise<number> {
        throw new Error("Method not implemented.");
    }
    create(entity: any): Promise<any> {
        throw new Error("Method not implemented.");
    }
    update(id: string, entity: any): Promise<void> {
        throw new Error("Method not implemented.");
    }
    delete(id: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    createMany(entity: any[]): Promise<any[]> {
        throw new Error("Method not implemented.");
    }
    updateMany(filter: any, update: any): Promise<number> {
        throw new Error("Method not implemented.");
    }
    deleteMany(filter: any): Promise<number> {
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
        this.dbConnections = [conn];
        this.entityMetadatas = new Map();
        this.dbConnections[0].entityMetadatas.forEach((metadata) => {
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
        app.dbConnections = [];
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