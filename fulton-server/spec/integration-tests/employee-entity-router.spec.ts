import { FultonApp, FultonAppOptions, authorized, AccessToken, Request, Response, EntityRouter, entityRouter, OperationResult, QueryParams, OperationOneResult, OperationStatus } from "../../src/index";
import { UserServiceMock } from "../helpers/user-service-mock";
import { HttpTester, HttpResult } from "../helpers/http-tester";
import { MongoHelper } from "../helpers/mongo-helper";
import { sampleData } from "../support/sample-data";
import { Employee } from '../entities/employee';
import { Territory } from "../entities/territory";
import { Category } from "../entities/category";
import { Customer } from '../entities/customer';


@entityRouter("/employees", Employee)
class EmployeeEntityRouter extends EntityRouter<Employee>{
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

    it('should return all employees', async () => {
        let result = await httpTester.get("/employees", {
        })

        expect(result.response.statusCode).toEqual(200);

        let queryResult: OperationResult = result.body;
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

        let queryResult: OperationResult = result.body;
        expect(queryResult.data.length).toEqual(5);
        expect(queryResult.pagination.total).toEqual(9);
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

        let queryResult: OperationResult = result.body;
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

        let queryResult: OperationResult<Employee> = result.body;
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

        let queryResult: OperationResult<Employee> = result.body;
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

        let queryResult: OperationResult<Employee> = result.body;
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

        expect(result.response.statusCode).toEqual(200);

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
});