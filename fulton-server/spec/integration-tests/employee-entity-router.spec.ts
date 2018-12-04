import { FultonApp } from '../../src/fulton-app';
import { Request, Response } from "../../src/alias";
import { OperationManyResult, OperationOneResult, QueryParams } from "../../src/interfaces";
import { FultonAppOptions } from '../../src/options/fulton-app-options';
import { EntityRouter } from '../../src/routers/entity-router';
import { entityRouter, httpGet } from '../../src/routers/route-decorators';
import { HttpTester } from "../../src/test/http-tester";
import { Category } from "../entities/category";
import { Customer } from '../entities/customer';
import { Employee } from '../entities/employee';
import { Territory } from "../entities/territory";
import { MongoHelper } from "../helpers/mongo-helper";
import { sampleData } from "../support/sample-data";


@entityRouter("/employees", Employee)
class EmployeeEntityRouter extends EntityRouter<Employee>{
    @httpGet("/count")
    async count(req: Request, res: Response) {
        let result = await this.entityService.count(req.queryParams)
        res.send({ data: result })
    }
}

class MyApp extends FultonApp {
    protected onInit(options: FultonAppOptions): void {
        options.entities = [Employee, Territory, Category, Customer];
        options.routers = [EmployeeEntityRouter];

        options.databases.set("default", {
            type: "mongodb",
            url: "mongodb://localhost:27017/fulton-test"
        });
    }
}

describe('EmployeeEntityRouter', () => {
    let app: MyApp;
    let httpTester: HttpTester;

    beforeAll(async () => {
        app = new MyApp();
        httpTester = new HttpTester(app);
        await httpTester.start();

        await MongoHelper.insertData(sampleData, true);
    });

    afterAll(() => {
        return httpTester.stop();
    });

    it('should return all employees', async () => {
        let result = await httpTester.get("/employees", {
        })

        expect(result.response.statusCode).toEqual(200);

        let queryResult: OperationManyResult = result.body;
        expect(queryResult.data.length).toEqual(9);
        expect(queryResult.pagination.total).toEqual(9);
    });

    it('should return 5 employees', async () => {
        let params: QueryParams = {
            pagination: {
                size: 5
            }
        }

        let result = await httpTester.get("/employees", params)

        expect(result.response.statusCode).toEqual(200);

        let queryResult: OperationManyResult = result.body;
        expect(queryResult.data.length).toEqual(5);
        expect(queryResult.pagination.total).toEqual(9);
        expect(queryResult.pagination.size).toEqual(5);
    });

    it('should return the last 4 employees', async () => {
        let params: QueryParams = {
            pagination: {
                index: 1, // page 2
                size: 5
            }
        }

        let result = await httpTester.get("/employees", params)

        expect(result.response.statusCode).toEqual(200);

        let queryResult: OperationManyResult = result.body;
        expect(queryResult.data.length).toEqual(4);
        expect(queryResult.pagination.total).toEqual(9);
    });

    it('should return employees with sorting', async () => {
        let params: QueryParams = {
            sort: {
                employeeId: -1
            },
            pagination: {
                size: 5
            }
        }

        let result = await httpTester.get("/employees", params)

        expect(result.response.statusCode).toEqual(200);

        let queryResult: OperationManyResult<Employee> = result.body;
        expect(queryResult.data[0].employeeId).toEqual(9);
        expect(queryResult.data[1].employeeId).toEqual(8);
        expect(queryResult.data[2].employeeId).toEqual(7);
    });

    it('should return employees with filter', async () => {
        let params: QueryParams = {
            filter: {
                firstName: {
                    "$regex": "w",
                    "$options": "i"
                }
            }
        }

        let result = await httpTester.get("/employees", params)

        expect(result.response.statusCode).toEqual(200);

        let queryResult: OperationManyResult<Employee> = result.body;
        expect(queryResult.data.length).toEqual(1);
    });

    it('should return employees with filter $or', async () => {
        let params: QueryParams = {
            filter: {
                $or: [
                    { employeeId: 3 },
                    { firstName: { $like: "w" } }
                ]
            }
        }

        let result = await httpTester.get("/employees", params)

        expect(result.response.statusCode).toEqual(200);

        let queryResult: OperationManyResult<Employee> = result.body;
        expect(queryResult.data.length).toEqual(2);
    })

    it('should return one employee with :id', async () => {
        let result = await httpTester.get("/employees/5")

        expect(result.response.statusCode).toEqual(200);

        let queryResult: OperationOneResult<Employee> = result.body;
        expect(queryResult.data.employeeId).toEqual(5);
    });

    it('should insert a employee', async () => {
        let data = {
            "employeeId": 101,
            "lastName": "Davolio",
            "firstName": "Nancy",
            "title": "Sales Representative",
            "titleOfCourtesy": "Ms."
        } as Employee;

        let result = await httpTester.post("/employees", {
            data: data
        })

        expect(result.response.statusCode).toEqual(201);

        let queryResult: OperationOneResult<Employee> = result.body;
        expect(queryResult.data).toEqual(data);
    });

    it('should update a employee', async () => {
        let data = {
            "employeeId": 2,
            "lastName": "Davolio",
            "firstName": "Nancy",
            "title": "Sales Representative",
            "titleOfCourtesy": "Ms."
        } as Employee;

        let result = await httpTester.patch("/employees/3", {
            data: data
        })

        expect(result.response.statusCode).toEqual(202);
    });

    it('should delete a employee', async () => {
        let result = await httpTester.delete("/employees/3")

        expect(result.response.statusCode).toEqual(202);
    });

    it('should load employees with territories', async () => {
        let result = await httpTester.get("/employees", {
            includes: ["territories"]
        })

        let queryResult: OperationManyResult<Employee> = result.body;

        queryResult.data.forEach(employee => {
            if (employee.territories && employee.territories.length > 0) {
                expect(employee.territories[0].territoryDescription).toBeDefined()
            }
        });
    });

    it('should load a employee with territories', async () => {
        let result = await httpTester.get("/employees/1", {
            includes: ["territories"]
        })

        expect(result.response.statusCode).toEqual(200);

        let queryResult: OperationOneResult<Employee> = result.body;

        expect(queryResult.data.territories.length).toEqual(2);
        let territory = queryResult.data.territories[1];
        expect(territory.territoryId).toEqual(19713);
        expect(territory.territoryDescription).toEqual("Neward");
    });

    it('should load a employee with territories.category', async () => {
        let result = await httpTester.get("/employees/1", {
            includes: ["territories.categories"]
        })

        let queryResult: OperationOneResult<Employee> = result.body;

        expect(queryResult.data.territories.length).toEqual(2);
        let territory = queryResult.data.territories[1];

        expect(territory.categories.length).toEqual(1);
        let category = territory.categories[0];
        expect(<any>category.categoryId as string).toEqual("000000000000000000000003");
        expect(category.categoryName).toEqual("Condiments");
    });

    it('should query employees by gte hireDate', async () => {
        let result = await httpTester.get("/employees", {
            filter: {
                hireDate: {
                    $gte: "1993-01-01T00:00:00Z"
                }
            }
        })

        let queryResult: OperationManyResult<Employee> = result.body;
        let date = new Date("1993-01-01");
        expect(queryResult.data.length).toEqual(6);
        expect(queryResult.data.filter((employee) => {
            return new Date(employee.hireDate) <= date
        }).length).toEqual(0);
    });

    it('should query employees with default projection', async () => {
        let result = await httpTester.get("/employees")

        let queryResult: OperationManyResult<Employee> = result.body;

        expect(queryResult.data.filter(c => c.address).length).toEqual(0);
    });

    it('should query employees with extra projection', async () => {
        let result = await httpTester.get("/employees", {
            projection: {
                lastName: 0
            }
        })

        let queryResult: OperationManyResult<Employee> = result.body;

        expect(queryResult.data.filter(c => c.lastName).length).toEqual(0);
    });

    it('should query a employee with default projection', async () => {
        let result = await httpTester.get("/employees/1")

        let queryResult: OperationOneResult<Employee> = result.body;

        expect(queryResult.data.address).toBeUndefined();
        expect(queryResult.data.lastName).toBeDefined();

    });

    it('should query a employee with extra projection', async () => {
        let result = await httpTester.get("/employees/1", {
            projection: {
                lastName: 0
            }
        })

        let queryResult: OperationOneResult<Employee> = result.body;

        expect(queryResult.data.lastName).toBeUndefined();
    });

    it('should query employee with overrided projection', async () => {
        let result = await httpTester.get("/employees/1", {
            projection: {
                address: 1
            }
        })

        let queryResult: OperationOneResult<Employee> = result.body;

        expect(queryResult.data.lastName).toBeDefined();
        expect(queryResult.data.address).toBeDefined();
    });

    it('should count employees', async () => {
        let result = await httpTester.get("/employees/count")


        let queryResult: OperationOneResult<number> = result.body;

        expect(queryResult.data).toEqual(9);
    });

    it('should count employees with filter', async () => {
        let result = await httpTester.get("/employees/count", {
            filter: {
                hireDate: {
                    $gte: "1993-01-01T00:00:00Z"
                }
            }
        })


        let queryResult: OperationOneResult<number> = result.body;

        expect(queryResult.data).toEqual(6);
    });
});