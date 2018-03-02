import { Connection, Repository } from 'typeorm';

import { Category } from '../../spec/entities/category';
import { Employee } from '../../spec/entities/employee';
import { EntityMetadata } from 'typeorm/metadata/EntityMetadata';
import { EntityService } from './entity-service';
import { FultonApp } from '../fulton-app';
import { FultonAppOptions } from '../fulton-app-options';
import { QueryParams } from '../interfaces';
import { Territory } from '../../spec/entities/territory';
import { createFakeConnection } from '../../spec/helpers/entity-helper';
import { ObjectId } from 'bson';
import { Customer } from '../../spec/entities/customer';
import { FultonError, FultonStackError } from '../common/fulton-error';
import { MongoEntityRunner } from './runner/mongo-entity-runner';

class MyApp extends FultonApp {
    protected onInit(options: FultonAppOptions): void | Promise<void> { }
}


describe('entity service', () => {
    let service: EntityService<any>;
    let employeeMetadata: EntityMetadata;
    let categoryMetadata: EntityMetadata;
    let customerMetadata: EntityMetadata;

    beforeAll(() => {
        let app = new MyApp();
        app.options.entities = [Employee, Territory, Category, Customer];

        createFakeConnection(app);

        service = new EntityService<Employee>(new Repository<Employee>())
        service["app"] = app;
        service["_runner"] = new MongoEntityRunner();
        employeeMetadata = app.entityMetadatas.get(Employee);
        categoryMetadata = app.entityMetadatas.get(Category);
        customerMetadata = app.entityMetadatas.get(Customer);
    });

    it('should convert query params for plan properties', async () => {
        let queryParams: QueryParams = {
            needAdjust: true,
            filter: {
                employeeId: "1"
            }
        };
        service["adjustParams"](employeeMetadata, queryParams);

        expect(queryParams).toEqual({
            filter: {
                _id: 1
            }
        })
    });

    it('should ont convert query params', async () => {
        let queryParams: QueryParams = {
            needAdjust: true,
            filter: {
                $or: [
                    { employeeId: 1 },
                    { hireDate: new Date("1992-05-01T00:00:00.000+0000") }
                ]
            }
        };

        service["adjustParams"](employeeMetadata, queryParams);

        expect(queryParams).toEqual({
            filter: {
                $or: [
                    { _id: 1 },
                    { hireDate: new Date("1992-05-01T00:00:00.000+0000") }
                ]
            }
        })
    });

    it('should convert query params for plan properties in $or', async () => {
        let queryParams: QueryParams = {
            needAdjust: true,
            filter: {
                $or: [
                    { _id: "1" },
                    { hireDate: "1992-05-01T00:00:00.000+0000" }
                ]
            }
        };

        service["adjustParams"](employeeMetadata, queryParams);

        expect(queryParams).toEqual({
            filter: {
                $or: [
                    { _id: 1 },
                    { hireDate: new Date("1992-05-01T00:00:00.000+0000") }
                ]
            }
        })
    });

    it('should convert query params for $elemMatch', async () => {
        let queryParams: QueryParams = {
            needAdjust: true,
            filter: {
                territories: {
                    $elemMatch: {
                        territoryId: "1"
                    }
                }
            }
        };

        service["adjustParams"](employeeMetadata, queryParams);

        expect(queryParams).toEqual({
            filter: {
                territories: {
                    $elemMatch: {
                        _id: 1
                    }
                }
            }
        })
    });

    it('should convert query params for $gte', async () => {
        let queryParams: QueryParams = {
            needAdjust: true,
            filter: {
                hireDate: {
                    $gte: "2001-01-01T00:00:00.000+0000"
                }
            }
        };

        service["adjustParams"](employeeMetadata, queryParams);

        expect(queryParams).toEqual({
            filter: {
                hireDate: {
                    $gte: new Date("2001-01-01T00:00:00.000+0000")
                }
            }
        })
    });

    it('should convert query params for $box', async () => {
        let queryParams: QueryParams = {
            needAdjust: true,
            filter: {
                country: {
                    $box: [["1.1", "2.2"], ["3.3", "4.4"], "5"]
                }
            }
        };

        service["adjustParams"](employeeMetadata, queryParams);

        expect(queryParams).toEqual({
            filter: {
                country: {
                    $box: [[1.1, 2.2], [3.3, 4.4], 5]
                }
            }
        })
    });

    it('should convert query params for $exists', async () => {
        let queryParams: QueryParams = {
            needAdjust: true,
            filter: {
                country: {
                    $exists: "true"
                },
                city: {
                    $exists: "1"
                }
            }
        };

        service["adjustParams"](employeeMetadata, queryParams);

        expect(queryParams).toEqual({
            filter: {
                country: {
                    $exists: true
                },
                city: {
                    $exists: true
                }
            }
        })
    });

    it('should convert query params for $all', async () => {
        let queryParams: QueryParams = {
            needAdjust: true,
            filter: {
                territories: {
                    $all: [
                        { territoryId: "1" },
                        { territoryId: "2" }
                    ]
                },
                reportsTo: {
                    $all: ["1", "2"]
                }
            }
        };

        service["adjustParams"](employeeMetadata, queryParams);

        expect(queryParams).toEqual({
            filter: {
                territories: {
                    $all: [
                        { _id: 1 },
                        { _id: 2 }
                    ]
                },
                reportsTo: {
                    $all: [1, 2]
                }
            }
        })
    });

    it('should convert query params for $size', async () => {
        let queryParams: QueryParams = {
            needAdjust: true,
            filter: {
                extension: {
                    $size: "1"
                }
            }
        };

        service["adjustParams"](employeeMetadata, queryParams);

        expect(queryParams).toEqual({
            filter: {
                extension: {
                    $size: 1
                }
            }
        })
    });

    it('should convert query params for $in', async () => {
        let queryParams: QueryParams = {
            needAdjust: true,
            filter: {
                postalCode: {
                    $in: ["1", "2", "3"]
                }
            }
        };

        service["adjustParams"](employeeMetadata, queryParams);

        expect(queryParams).toEqual({
            filter: {
                postalCode: {
                    $in: [1, 2, 3]
                }
            }
        })
    });

    it('should convert query params for ObjectId', async () => {
        let queryParams: QueryParams = {
            needAdjust: true,
            filter: {
                territories: {
                    categories: {
                        categoryId: "000000000000000000000003"
                    }
                }
            }
        };

        service["adjustParams"](employeeMetadata, queryParams);

        expect(queryParams).toEqual({
            filter: {
                territories: {
                    categories: {
                        categoryId: new ObjectId("000000000000000000000003")
                    }
                }
            }
        })
    });

    it('should convert query params for embedded', async () => {
        let queryParams: QueryParams = {
            needAdjust: true,
            filter: {
                territories: {
                    categories: {
                        categoryId: "000000000000000000000003"
                    }
                }
            }
        };

        service["adjustParams"](customerMetadata, queryParams);

        expect(queryParams).toEqual({
            filter: {
                territories: {
                    categories: {
                        categoryId: new ObjectId("000000000000000000000003")
                    }
                }
            }
        })
    });

    it('should convert input', async () => {
        let input = {
            "categoryId": "000000000000000000000001",
            "categoryName": "Beverages",
            "description": "Soft drinks coffees teas beers and ales"
        };

        let output = service["convertEntity"](categoryMetadata, input, new FultonStackError(""));

        expect(output instanceof Category).toBeTruthy();
        expect(Object.assign({}, output)).toEqual({
            "categoryId": new ObjectId("000000000000000000000001"),
            "categoryName": "Beverages",
            "description": "Soft drinks coffees teas beers and ales"
        });
    });

    it('should convert and remove input', async () => {
        let input = {
            "categoryId": "000000000000000000000001",
            "categoryName": "Beverages",
            "description": "Soft drinks coffees teas beers and ales",
            "extra": "extra columns should be removed"
        };

        let output = service["convertEntity"](categoryMetadata, input, new FultonStackError(""));

        expect(output instanceof Category).toBeTruthy();
        expect({ ...output }).toEqual({
            "categoryId": new ObjectId("000000000000000000000001"),
            "categoryName": "Beverages",
            "description": "Soft drinks coffees teas beers and ales"
        });
    });

    it('should convert input with embedded document', () => {
        let input = {
            "customerId": "ALFKI",
            "companyName": "Alfreds Futterkiste",
            "contactName": "Maria Anders",
            "contactTitle": "Sales Representative",
            "address": "Obere Str. 57",
            "city": "Berlin",
            "region": "NULL",
            "postalCode": "12209",
            "country": "Germany",
            "phone": "030-0074321",
            "fax": "030-0076545",
            "territories": [
                {
                    "territoryId": "1581",
                    "territoryDescription": "Westboro",
                    "regionId": "1"
                },
                {
                    "territoryId": "1730",
                    "territoryDescription": "Bedford",
                    "regionId": "1"
                }

            ]
        };

        let output: Customer = service["convertEntity"](customerMetadata, input, new FultonStackError(""));

        expect(output instanceof Customer).toBeTruthy();

        output = { ...output };
        output.territories = output.territories.map((t) => { return { ...t } });

        expect(output as any).toEqual({
            "customerId": "ALFKI",
            "companyName": "Alfreds Futterkiste",
            "contactName": "Maria Anders",
            "contactTitle": "Sales Representative",
            "address": "Obere Str. 57",
            "city": "Berlin",
            "region": "NULL",
            "postalCode": 12209,
            "country": "Germany",
            "phone": "030-0074321",
            "fax": "030-0076545",
            "territories": [
                {
                    "territoryId": 1581,
                    "territoryDescription": "Westboro",
                    "regionId": 1
                },
                {
                    "territoryId": 1730,
                    "territoryDescription": "Bedford",
                    "regionId": 1
                }
            ]
        });
    });

    it('should deep convert input', () => {
        let input = {
            "customerId": "ALFKI",
            "territories": [
                {
                    "territoryId": "1581",
                    "regionId": "1",
                    "categories": [
                        {
                            "categoryId": "000000000000000000000001",
                            "categoryName": "Beverages",
                            "description": "Soft drinks coffees teas beers and ales"
                        }
                    ]
                },
                {
                    "territoryId": "1730",
                    "regionId": "1",
                    "categories": [
                        {
                            "categoryId": "000000000000000000000001",
                            "categoryName": "Beverages",

                        },
                        {
                            "categoryId": "000000000000000000000002",
                            "categoryName": "Confections",
                        }
                    ]
                }

            ]
        };

        let output: Customer = service["convertEntity"](customerMetadata, input, new FultonStackError(""));

        expect(output instanceof Customer).toBeTruthy();

        output = { ...output };
        output.territories = output.territories.map((t) => { return { ...t } });

        expect(output as any).toEqual({
            "customerId": "ALFKI",
            "territories": [
                {
                    "territoryId": 1581,
                    "regionId": 1,
                    "categories": [
                        {
                            "categoryId": new ObjectId("000000000000000000000001"),
                        }
                    ]
                },
                {
                    "territoryId": 1730,
                    "regionId": 1,
                    "categories": [
                        {
                            "categoryId": new ObjectId("000000000000000000000001"),
                        },
                        {
                            "categoryId": new ObjectId("000000000000000000000002"),
                        }
                    ]
                }
            ]
        });
    });

    it('should validate input success', () => {
        let input = {
            "customerId": "ALFKI",
            "companyName": "Alfreds Futterkiste",
            "contactName": "Maria Anders",
            "contactTitle": "Sales Representative",
            "address": "Obere Str. 57",
            "rating": 5,
            "email": "test@test.com"
        };

        return service["convertAndVerifyEntity"](customerMetadata, input)
            .catch((result: FultonError) => {
                fail("should pass");
            });
    })

    it('should validate input fail', () => {
        let input = {
            "rating": 100,
            "email": "test"
        };

        return service["convertAndVerifyEntity"](customerMetadata, input)
            .then(() => {
                fail("should not pass");
            })
            .catch((result: FultonError) => {
                expect(result.errors).toEqual({
                    message: "invalid input",
                    detail: {
                        companyName: { isDefined: 'companyName should not be null or undefined' },
                        rating: { max: 'rating must be less than 10' },
                        email: { isEmail: 'email must be an email' }
                    }
                });
            });
    })

    it('should validate input fail deeply', () => {
        let input = {
            "companyName": "Alfreds Futterkiste",
            "territories": [
                {
                    "regionId": "test"
                }
            ]
        };

        return service["convertAndVerifyEntity"](customerMetadata, input)
            .then(() => {
                fail("should not pass");
            })
            .catch((result: FultonError) => {
                expect(result.errors).toEqual({
                    message: "invalid input",
                    detail: {
                        "territories.0.regionId": "regionId must be a number"
                    }
                });
            });
    })

    it('should convert input fail', async () => {
        let input = {
            "hireDate": "test",
            "territories": [
                {},
                {
                    "territoryId": "test"
                }
            ]
        };

        let errorTracker = new FultonStackError("invalid input");
        service["convertEntity"](employeeMetadata, input, errorTracker);

        expect(errorTracker.errors).toEqual({
            message: "invalid input",
            detail: {
                "hireDate": "hireDate must be a date",
                "territories.0.territoryId": "territoryId should not be null or undefined",
                "territories.1.territoryId": "territoryId must be a number"
            }
        });
    });

    it('should convert query params fail', async () => {
        let queryParams: QueryParams = {
            needAdjust: true,
            filter: {
                territories: {
                    categories: {
                        categoryId: "test"
                    }
                },
                $or: [
                    { _id: "test" },
                    { hireDate: "test" }
                ]
            }
        };

        let errorTracker = service["adjustParams"](employeeMetadata, queryParams);

        expect(errorTracker.errors).toEqual({
            message: "invalid query parameters",
            detail: {
                "filter.territories.categories.categoryId": "categoryId must be an object id",
                "filter.$or.0._id": "_id must be a number",
                "filter.$or.1.hireDate": "hireDate must be a date"
            }
        });
    });
});