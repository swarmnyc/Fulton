import { EntityRouter, entityRouter } from '../routers';
import { IEntityService, OperationOneResult, OperationManyResult, OperationResult, QueryParams, Request, Response, Type } from "../interfaces";

import { Category } from '../../spec/entities/category';
import { Connection } from "typeorm/connection/Connection";
import { Employee } from '../../spec/entities/employee';
import { FultonApp } from '../fulton-app';
import { FultonAppOptions } from '../fulton-app-options';
import { HttpTester } from "../test/http-tester";
import { Territory } from '../../spec/entities/territory';
import { getRelatedToMetadata } from "../entities/entity-decorators-helpers";
import { queryParamsParser } from "./query-params-parser";
import { sampleData } from "../../spec/support/sample-data";

class EmployeeEntityService implements IEntityService<Employee> {
    find(queryParams: QueryParams): Promise<OperationManyResult<Employee>> {
        let data: Employee[] = [];

        data.push(Object.assign(new Employee(), {
            "employeeId": 1,
            "lastName": "Davolio",
            "firstName": "Nancy",
            "title": "Sales Representative",
            "titleOfCourtesy": "Ms.",
            "birthDate": "1948-12-08T00:00:00.000+0000",
            "hireDate": "1992-05-01T00:00:00.000+0000",
            "city": "Seattle",
            "region": "WA",
            "postalCode": 98122,
            "country": "USA",
            "homePhone": "(206) 555-9857",
            "extension": 5467,
            "notes": "Education includes a BA in psychology from Colorado State University in 1970.  She also completed The Art of the Cold Call.  Nancy is a member of Toastmasters International.",
            "reportsTo": 2,
            "photoPath": "http://accweb/emmployees/davolio.bmp",
            "territories": [
                {
                    "territoryId": 6897
                },
                {
                    "territoryId": 19713
                }
            ]
        }));

        data.push(Object.assign(new Employee(), {
            "employeeId": 3,
            "lastName": "Leverling",
            "firstName": "Janet",
            "title": "Sales Representative",
            "titleOfCourtesy": "Ms.",
            "birthDate": "1963-08-30T00:00:00.000+0000",
            "hireDate": "1992-04-01T00:00:00.000+0000",
            "city": "Kirkland",
            "region": "WA",
            "postalCode": 98033,
            "country": "USA",
            "homePhone": "(206) 555-3412",
            "extension": 3355,
            "notes": "Janet has a BS degree in chemistry from Boston College (1984). She has also completed a certificate program in food retailing management.  Janet was hired as a sales associate in 1991 and promoted to sales representative in February 1992.",
            "reportsTo": 2,
            "photoPath": "http://accweb/emmployees/leverling.bmp",
            "territories": [
                {
                    "territoryId": 30346
                },
                {
                    "territoryId": 31406
                },
                {
                    "territoryId": 32859
                },
                {
                    "territoryId": 33607
                }
            ]
        }));

        return Promise.resolve({
            data: data,
            pagination: {
                index: 1,
                size: 2,
                total: 10
            }
        });
    }

    findById(id: any, QueryParams?: QueryParams): Promise<OperationOneResult<Employee>> {
        let data: Employee = Object.assign(new Employee(), {
            "employeeId": 1,
            "lastName": "Davolio",
            "firstName": "Nancy",
            "title": "Sales Representative",
            "titleOfCourtesy": "Ms.",
            "birthDate": "1948-12-08T00:00:00.000+0000",
            "hireDate": "1992-05-01T00:00:00.000+0000",
            "city": "Seattle",
            "region": "WA",
            "postalCode": 98122,
            "country": "USA",
            "homePhone": "(206) 555-9857",
            "extension": 5467,
            "notes": "Education includes a BA in psychology from Colorado State University in 1970.  She also completed The Art of the Cold Call.  Nancy is a member of Toastmasters International.",
            "reportsTo": 2,
            "photoPath": "http://accweb/emmployees/davolio.bmp",
            "territories": [
                {
                    "territoryId": 6897
                },
                {
                    "territoryId": 19713
                }
            ]
        });

        return Promise.resolve({
            data: data
        });
    }

    findOne(queryParams: QueryParams): Promise<OperationOneResult<Employee>> {
        throw new Error("Method not implemented.");
    }

    count(queryParams?: QueryParams): Promise<OperationOneResult<number>> {
        throw new Error("Method not implemented.");
    }

    create(entity: Employee): Promise<OperationOneResult<Employee>> {
        throw new Error("Method not implemented.");
    }
    update(id: string, entity: Employee): Promise<OperationResult> {
        throw new Error("Method not implemented.");
    }
    delete(id: string): Promise<OperationResult> {
        throw new Error("Method not implemented.");
    }
}

@entityRouter("/employees", Employee)
class EmployeeRouter extends EntityRouter<Employee> {
    constructor() {
        super(new EmployeeEntityService());
    }
}

class MyApp extends FultonApp {
    protected onInit(options: FultonAppOptions): void | Promise<void> {
        this.options.formatter.jsonApi = true;
        this.options.index.handler = (req: Request, res: Response) => {
            res.send(req.body);
        }

        this.options.routers = [EmployeeRouter];

        let conn = new Connection({
            type: "mongodb",
            entities: [Employee, Category, Territory]
        });

        conn["buildMetadatas"]();
        this.connections = [conn];
        this.entityMetadatas = new Map();
        this.connections[0].entityMetadatas.forEach((metadata) => {
            metadata.relatedToMetadata = getRelatedToMetadata(metadata.target);
            this.entityMetadatas.set(metadata.target as Type, metadata);
        })
    }
}

describe('jsonapi middleware', () => {
    let app: MyApp;
    let httpTester: HttpTester;

    beforeAll(() => {
        app = new MyApp();
        httpTester = new HttpTester(app);

        return httpTester.start();
    });

    afterAll(async () => {
        app.connections = [];
        return httpTester.stop();
    });

    it('should deserialize', async () => {
        httpTester.setHeaders({
            "content-type": "application/vnd.api+json"
        })

        let result = await httpTester.post("/", {
            "data": [{
                "type": "articles",
                "id": "1",
                "attributes": {
                    "title": "JSON API paints my bikeshed!"
                },
                "links": {
                    "self": "http://example.com/articles/1"
                },
                "relationships": {
                    "author": {
                        "links": {
                            "self": "http://example.com/articles/1/relationships/author",
                            "related": "http://example.com/articles/1/author"
                        },
                        "data": { "type": "people", "id": "9" }
                    },
                    "comments": {
                        "links": {
                            "self": "http://example.com/articles/1/relationships/comments",
                            "related": "http://example.com/articles/1/comments"
                        },
                        "data": [
                            { "type": "comments", "id": "5" },
                            { "type": "comments", "id": "12" }
                        ]
                    }
                }
            }],
            "included": [{
                "type": "people",
                "id": "9",
                "attributes": {
                    "first-name": "Dan",
                    "last-name": "Gebhardt",
                    "twitter": "dgeb"
                },
                "links": {
                    "self": "http://example.com/people/9"
                }
            }, {
                "type": "comments",
                "id": "5",
                "attributes": {
                    "body": "First!"
                },
                "relationships": {
                    "author": {
                        "data": { "type": "people", "id": "2" }
                    }
                },
                "links": {
                    "self": "http://example.com/comments/5"
                }
            }, {
                "type": "comments",
                "id": "12",
                "attributes": {
                    "body": "I like XML better"
                },
                "relationships": {
                    "author": {
                        "data": { "type": "people", "id": "9" }
                    }
                },
                "links": {
                    "self": "http://example.com/comments/12"
                }
            }]
        });

        expect(result.body).toEqual(
            {
                "data": [
                    {
                        "title": "JSON API paints my bikeshed!",
                        "id": "1",
                        "author": {
                            "first-name": "Dan",
                            "last-name": "Gebhardt",
                            "twitter": "dgeb",
                            "id": "9"
                        },
                        "comments": [
                            {
                                "body": "First!", "id": "5", "author": { "id": "2" }
                            },
                            {
                                "body": "I like XML better", "id": "12", "author": {
                                    "first-name": "Dan",
                                    "last-name": "Gebhardt",
                                    "twitter": "dgeb",
                                    "id": "9"
                                }
                            }
                        ]
                    }]
            });
    });

    it('should serialize employee', async () => {
        httpTester.setHeaders({
            "content-type": "application/vnd.api+json",
            "accept": "application/vnd.api+json"
        })

        let result = await httpTester.get("/employees/1");

        //console.log(JSON.stringify(result.body));
        expect(result.body).toEqual({
            "data": {
                "type": "Employee",
                "id": 1,
                "attributes": {
                    "lastName": "Davolio",
                    "firstName": "Nancy",
                    "title": "Sales Representative",
                    "titleOfCourtesy": "Ms.",
                    "birthDate": "1948-12-08T00:00:00.000+0000",
                    "hireDate": "1992-05-01T00:00:00.000+0000",
                    "city": "Seattle",
                    "region": "WA", "postalCode": 98122, "country": "USA", "homePhone": "(206) 555-9857",
                    "extension": 5467,
                    "notes": "Education includes a BA in psychology from Colorado State University in 1970.  She also completed The Art of the Cold Call.  Nancy is a member of Toastmasters International.",
                    "reportsTo": 2,
                    "photoPath": "http://accweb/emmployees/davolio.bmp"
                },
                "relationships": {
                    "territories":
                        {
                            "data": [
                                { "id": 6897, "type": "Territory" },
                                { "id": 19713, "type": "Territory" }]
                        }
                },
                "links": { "self": "http://localhost:5000/employees/1" }
            }
        })
    });

    it('should not serialize employee', async () => {
        httpTester.setHeaders({
            "content-type": "application/json",
            "accept": "application/json"
        })

        let result = await httpTester.get("/employees/1");

        //console.log(JSON.stringify(result.body));
        expect(result.body).toEqual({
            "data": {
                "employeeId": 1,
                "lastName": "Davolio",
                "firstName": "Nancy",
                "title": "Sales Representative",
                "titleOfCourtesy": "Ms.",
                "birthDate": "1948-12-08T00:00:00.000+0000",
                "hireDate": "1992-05-01T00:00:00.000+0000",
                "city": "Seattle",
                "region": "WA",
                "postalCode": 98122,
                "country": "USA",
                "homePhone": "(206) 555-9857",
                "extension": 5467,
                "notes": "Education includes a BA in psychology from Colorado State University in 1970.  She also completed The Art of the Cold Call.  Nancy is a member of Toastmasters International.",
                "reportsTo": 2,
                "photoPath": "http://accweb/emmployees/davolio.bmp",
                "territories": [
                    {
                        "territoryId": 6897
                    },
                    {
                        "territoryId": 19713
                    }
                ]
            }
        })
    });

    it('should serialize employees', async () => {
        httpTester.setHeaders({
            "content-type": "application/vnd.api+json",
            "accept": "application/vnd.api+json"
        })

        let result = await httpTester.get("/employees");

        //console.log(JSON.stringify(result.body, null, 4));
        expect(result.body).toEqual({
            "data": [
                {
                    "type": "Employee",
                    "id": 1,
                    "attributes": {
                        "lastName": "Davolio",
                        "firstName": "Nancy",
                        "title": "Sales Representative",
                        "titleOfCourtesy": "Ms.",
                        "birthDate": "1948-12-08T00:00:00.000+0000",
                        "hireDate": "1992-05-01T00:00:00.000+0000",
                        "city": "Seattle",
                        "region": "WA",
                        "postalCode": 98122,
                        "country": "USA",
                        "homePhone": "(206) 555-9857",
                        "extension": 5467,
                        "notes": "Education includes a BA in psychology from Colorado State University in 1970.  She also completed The Art of the Cold Call.  Nancy is a member of Toastmasters International.",
                        "reportsTo": 2,
                        "photoPath": "http://accweb/emmployees/davolio.bmp"
                    },
                    "relationships": {
                        "territories": {
                            "data": [
                                {
                                    "id": 6897,
                                    "type": "Territory"
                                },
                                {
                                    "id": 19713,
                                    "type": "Territory"
                                }
                            ]
                        }
                    },
                    "links": {
                        "self": "http://localhost:5000/employees/1"
                    }
                },
                {
                    "type": "Employee",
                    "id": 3,
                    "attributes": {
                        "lastName": "Leverling",
                        "firstName": "Janet",
                        "title": "Sales Representative",
                        "titleOfCourtesy": "Ms.",
                        "birthDate": "1963-08-30T00:00:00.000+0000",
                        "hireDate": "1992-04-01T00:00:00.000+0000",
                        "city": "Kirkland",
                        "region": "WA",
                        "postalCode": 98033,
                        "country": "USA",
                        "homePhone": "(206) 555-3412",
                        "extension": 3355,
                        "notes": "Janet has a BS degree in chemistry from Boston College (1984). She has also completed a certificate program in food retailing management.  Janet was hired as a sales associate in 1991 and promoted to sales representative in February 1992.",
                        "reportsTo": 2,
                        "photoPath": "http://accweb/emmployees/leverling.bmp"
                    },
                    "relationships": {
                        "territories": {
                            "data": [
                                {
                                    "id": 30346,
                                    "type": "Territory"
                                },
                                {
                                    "id": 31406,
                                    "type": "Territory"
                                },
                                {
                                    "id": 32859,
                                    "type": "Territory"
                                },
                                {
                                    "id": 33607,
                                    "type": "Territory"
                                }
                            ]
                        }
                    },
                    "links": {
                        "self": "http://localhost:5000/employees/3"
                    }
                }
            ],
            "links": {
                "first": "http://localhost:5000/employees?pagination%5Bsize%5D=2&pagination%5Bindex%5D=0",
                "last": "http://localhost:5000/employees?pagination%5Bsize%5D=2&pagination%5Bindex%5D=4",
                "prev": "http://localhost:5000/employees?pagination%5Bsize%5D=2&pagination%5Bindex%5D=0",
                "next": "http://localhost:5000/employees?pagination%5Bsize%5D=2&pagination%5Bindex%5D=2",
                "meta": {
                    "index": 1,
                    "size": 2,
                    "total": 10
                }
            }
        })
    });
});