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

class MyApp extends FultonApp {
    protected onInit(options: FultonAppOptions): void | Promise<void> { }
}


describe('entity service', () => {
    let employeeService: EntityService<Employee>;
    let employeeMetadata: EntityMetadata;

    beforeAll(() => {
        let app = new MyApp();
        app.options.entities = [Employee, Territory, Category];

        createFakeConnection(app);

        employeeService = new EntityService<Employee>(new Repository<Employee>())
        employeeService["app"] = app;
        employeeMetadata = app.entityMetadatas.get(Employee);
    });

    it('should convert plan properties', async () => {
        let queryParams: QueryParams = {
            needAdjust: true,
            filter: {
                employeeId: "1"
            }
        };
        employeeService["adjustParams"](employeeMetadata, queryParams);

        expect(queryParams).toEqual({
            filter: {
                employeeId: 1
            }
        })
    });

    it('should ont convert', async () => {
        let queryParams: QueryParams = {
            needAdjust: true,
            filter: {
                $or: [
                    { _id: 1 },
                    { hireDate: new Date("1992-05-01T00:00:00.000+0000") }
                ]
            }
        };

        employeeService["adjustParams"](employeeMetadata, queryParams);

        expect(queryParams).toEqual({
            filter: {
                $or: [
                    { _id: 1 },
                    { hireDate: new Date("1992-05-01T00:00:00.000+0000") }
                ]
            }
        })
    });

    it('should convert plan properties in $or', async () => {
        let queryParams: QueryParams = {
            needAdjust: true,
            filter: {
                $or: [
                    { _id: "1" },
                    { hireDate: "1992-05-01T00:00:00.000+0000" }
                ]
            }
        };

        employeeService["adjustParams"](employeeMetadata, queryParams);

        expect(queryParams).toEqual({
            filter: {
                $or: [
                    { _id: 1 },
                    { hireDate: new Date("1992-05-01T00:00:00.000+0000") }
                ]
            }
        })
    });

    it('should convert $elemMatch', async () => {
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

        employeeService["adjustParams"](employeeMetadata, queryParams);

        expect(queryParams).toEqual({
            filter: {
                territories: {
                    $elemMatch: {
                        territoryId: 1
                    }
                }
            }
        })
    });

    it('should convert $gte', async () => {
        let queryParams: QueryParams = {
            needAdjust: true,
            filter: {
                hireDate: {
                    $gte: "2001-01-01T00:00:00.000+0000"
                }
            }
        };

        employeeService["adjustParams"](employeeMetadata, queryParams);

        expect(queryParams).toEqual({
            filter: {
                hireDate: {
                    $gte: new Date("2001-01-01T00:00:00.000+0000")
                }
            }
        })
    });

    it('should convert $box', async () => {
        let queryParams: QueryParams = {
            needAdjust: true,
            filter: {
                country: {
                    $box: [["1.1", "2.2"], ["3.3", "4.4"], "5"]
                }
            }
        };

        employeeService["adjustParams"](employeeMetadata, queryParams);

        expect(queryParams).toEqual({
            filter: {
                country: {
                    $box: [[1.1, 2.2], [3.3, 4.4], 5]
                }
            }
        })
    });

    it('should convert $exists', async () => {
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

        employeeService["adjustParams"](employeeMetadata, queryParams);

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

    it('should convert $all', async () => {
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

        employeeService["adjustParams"](employeeMetadata, queryParams);

        expect(queryParams).toEqual({
            filter: {
                territories: {
                    $all: [
                        { territoryId: 1 },
                        { territoryId: 2 }
                    ]
                },
                reportsTo: {
                    $all: [1, 2]
                }
            }
        })
    });

    it('should convert $size', async () => {
        let queryParams: QueryParams = {
            needAdjust: true,
            filter: {
                extension: {
                    $size: "1"
                }
            }
        };

        employeeService["adjustParams"](employeeMetadata, queryParams);

        expect(queryParams).toEqual({
            filter: {
                extension: {
                    $size: 1
                }
            }
        })
    });

    it('should convert $in', async () => {
        let queryParams: QueryParams = {
            needAdjust: true,
            filter: {
                postalCode: {
                    $in: ["1", "2", "3"]
                }
            }
        };

        employeeService["adjustParams"](employeeMetadata, queryParams);

        expect(queryParams).toEqual({
            filter: {
                postalCode: {
                    $in: [1, 2, 3]
                }
            }
        })
    });

    it('should convert ObjectId', async () => {
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

        employeeService["adjustParams"](employeeMetadata, queryParams);

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
});