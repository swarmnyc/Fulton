import { OperationManyResult, QueryParams, IEntityService, Type } from "../../src/types";
import { injectable } from "../../src/alias";

@injectable()
export class EntityServiceMock implements IEntityService<any> {
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