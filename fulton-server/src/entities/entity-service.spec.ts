import { Connection, Repository } from 'typeorm';

import { Employee } from '../../spec/entities/employee';
import { EntityMetadata } from 'typeorm/metadata/EntityMetadata';
import { EntityService } from './entity-service';
import { QueryParams } from '../interfaces';

describe('entity service', () => {
    let service: EntityService<Employee>;
    let metadata: EntityMetadata;

    beforeAll(() => {
        let conn = new Connection({
            type: "mongodb",
            entities: [Employee]
        });

        conn["buildMetadatas"]();
        metadata = conn.entityMetadatas[0];
        service = new EntityService<Employee>(new Repository<Employee>())
    });

    it('should convert plan properties', async () => {
        let queryParams: QueryParams = {
            needAdjust: true,
            filter: {
                employeeId: "1"
            }
        };
        service["adjustParams"](metadata, queryParams);

        expect(queryParams).toEqual({
            filter: {
                employeeId: 1
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

        service["adjustParams"](metadata, queryParams);

        expect(queryParams).toEqual({
            filter: {
                $or: [
                    { _id: 1 },
                    { hireDate: new Date("1992-05-01T00:00:00.000+0000") }
                ]
            }
        })
    });
});