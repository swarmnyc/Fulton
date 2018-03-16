import * as lodash from 'lodash';

import { HttpResult, HttpTester } from "../../src/test/http-tester";
import { OperationOneResult, OperationManyResult, OperationResult, QueryParams, Request, Response, injectable } from "../../src/interfaces";
import { httpGet, router } from '../../src/routers/route-decorators';

import { Category } from '../entities/category';
import { EntityRouter } from '../../src/routers/entity-router';
import { EntityService } from '../../src/entities/entity-service';
import { FultonApp } from '../../src/fulton-app';
import { FultonAppOptions } from '../../src/fulton-app-options';
import { MongoHelper } from "../helpers/mongo-helper";
import { Repository } from "typeorm";
import { Territory } from '../entities/territory';
import { UserServiceMock } from "../helpers/user-service-mock";
import { sampleData } from "../support/sample-data";

@injectable()
class TerritoryService extends EntityService<Territory>{
    private categoryRepository: Repository<Category>;
    constructor() {
        super(Territory);

        this.categoryRepository = this.getRepository(Category);
    }

    getCategories(queryParams: QueryParams): Promise<OperationManyResult<Category>> {
        return this.runner.find(this.categoryRepository, queryParams)
            .then((result) => {
                return {
                    data: result.data,
                    pagination: {
                        total: result.total
                    }
                }
            })
            .catch(this.errorHandler);
    }

    async getCategoriesByTerritoryId(territoryId: string): Promise<Category[]> {
        let result = await this.findById(territoryId);
        let tagIds = result.data.categories.map((c) => c.categoryId);

        return this.categoryRepository.find({ "_id": { "$in": tagIds } } as any);
    }
}

@router(/\/territor(y|ies)/)
class TerritoryRouter extends EntityRouter<Territory>{
    constructor(protected entityService: TerritoryService) {
        super(entityService)
    }

    @httpGet("/categories")
    categories(req: Request, res: Response) {
        this.entityService
            .getCategories(req.queryParams)
            .then(this.sendResult(res));
    }

    @httpGet("/:id/categories")
    territoryCategories(req: Request, res: Response) {
        this.entityService
            .getCategoriesByTerritoryId(req.params.id)
            .then((tags) => {
                res.send({
                    data: tags
                });
            })
            .catch((err) => {
                res.status(400).send({
                    error: {
                        message: err.message
                    }
                });
            });
    }
}


class MyApp extends FultonApp {
    protected onInit(options: FultonAppOptions): void {
        options.entities = [Category, Territory];
        options.routers = [TerritoryRouter];
        options.services = [TerritoryService];

        options.databases.set("default", {
            type: "mongodb",
            url: "mongodb://localhost:27017/fulton-test"
        });
    }
}

describe('EntityRouter Integration Test with Territory', () => {
    let app: MyApp;
    let httpTester: HttpTester;

    beforeAll(async () => {
        app = new MyApp();
        httpTester = new HttpTester(app);
        await httpTester.start();
        await MongoHelper.insertData(lodash.pick(sampleData, ["territories", "categories"]), true);
    });

    afterAll(async () => {
        return httpTester.stop();
    });

    it('should return all territories by /territory', async () => {
        let result = await httpTester.get("/territory", {
            pagination: {
                size: 1000
            }
        });

        expect(result.response.statusCode).toEqual(200);

        let queryResult: OperationManyResult = result.body;
        expect(queryResult.data.length).toEqual(53);
    });

    it('should return 20 territories by /territories', async () => {
        let result = await httpTester.get("/territories")

        expect(result.response.statusCode).toEqual(200);

        let queryResult: OperationManyResult = result.body;
        expect(queryResult.data.length).toEqual(20);
    });

    it('should return the categories by territory id', async () => {
        let result = await httpTester.get("/territory/1581/categories")

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

    it('should return categories', async () => {
        let result = await httpTester.get("/territories/categories", {
            pagination: {
                size: 30
            }
        });

        expect(result.response.statusCode).toEqual(200);

        let queryResult: OperationManyResult = result.body;
        expect(queryResult.data.length).toEqual(8);
    });

    it('should return 5 territories', async () => {
        let params: QueryParams = {
            pagination: {
                size: 5
            }
        }

        let result = await httpTester.get("/territories", params)

        expect(result.response.statusCode).toEqual(200);

        let queryResult: OperationManyResult = result.body;
        expect(queryResult.data.length).toEqual(5);
        expect(queryResult.pagination.total).toEqual(53);
    });

    it('should return the last 3 territories', async () => {
        let params: QueryParams = {
            pagination: {
                index: 5, // page 6
                size: 10
            }
        }

        let result = await httpTester.get("/territories", params)

        expect(result.response.statusCode).toEqual(200);

        let queryResult: OperationManyResult = result.body;
        expect(queryResult.data.length).toEqual(3);
        expect(queryResult.pagination.total).toEqual(53);
    });

    it('should return territories with filter', async () => {
        let params: QueryParams = {
            filter: {
                territoryDescription: {
                    "$like": "new"
                }
            }
        }

        let result = await httpTester.get("/territories", params)

        expect(result.response.statusCode).toEqual(200);

        let queryResult: OperationManyResult<Territory> = result.body;
        expect(queryResult.data.length).toEqual(3);
    });

    it('should return one territory with :id', async () => {
        let result = await httpTester.get("/territory/1581")

        expect(result.response.statusCode).toEqual(200);

        let queryResult: OperationOneResult<Territory> = result.body;
        expect(queryResult.data.territoryDescription).toEqual("Westboro");
    });

    it('should insert a territory', async () => {
        let data = {
            "territoryId": 9999,
            "territoryDescription": "Test1",
            "regionId": 123
        } as Territory;

        let result = await httpTester.post("/territory", {
            data: data
        });

        expect(result.response.statusCode).toEqual(200);

        let queryResult: OperationOneResult<Territory> = result.body;

        expect(queryResult.data).toEqual(data);
    });

    it('should update a territory', async () => {
        let data = {
            "territoryDescription": "Test2",
            "regionId": 456
        } as Territory;

        let result = await httpTester.patch("/territory/1833", {
            data: data
        })

        expect(result.response.statusCode).toEqual(202);
    });

    it('should delete a territory', async () => {
        let result = await httpTester.delete("/territory/1833")

        expect(result.response.statusCode).toEqual(202);
    });


    it('should load a territory with categories', async () => {
        let result = await httpTester.get("/territory/1581", {
            includes: ["categories"]
        })

        expect(result.response.statusCode).toEqual(200);

        let queryResult: OperationOneResult<Territory> = result.body;
        expect(queryResult.data.categories.length).toEqual(2);
        expect(queryResult.data.categories).toEqual([
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
        ] as any);
    });

    it('should return the categories by tag id', async () => {
        let result = await httpTester.get("/territories", {
            filter: {
                categories: {
                    categoryId: "000000000000000000000001"
                }
            }
        })

        expect(result.response.statusCode).toEqual(200);

        let queryResult: OperationManyResult<Territory> = result.body;
        expect(queryResult.data.length).toEqual(1);
    });
});