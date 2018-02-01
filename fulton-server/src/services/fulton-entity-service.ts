import { Injectable, IUser } from "../index";
import { Repository } from "typeorm";
import { IEntityService, Inject, QueryParams, OperationResult, OperationOneResult, OperationStatus } from "../interfaces";
import { FultonApp } from "../fulton-app";

@Injectable()
export class EntityService<TEntity> implements IEntityService<TEntity> {
    @Inject(FultonApp)
    protected app: FultonApp;
    
    constructor(protected repository: Repository<TEntity>) {
        
    }

    get currentUser(): IUser {
        return this.app.userService.currentUser;
    }

    find(queryParams: QueryParams): Promise<OperationResult<TEntity>> {
        throw new Error("not imploment");
    }

    findOne(queryParams: QueryParams): Promise<OperationOneResult<TEntity>> {
        throw new Error("not imploment");
    }

    create(entity: TEntity): Promise<OperationOneResult<TEntity>> {
        throw new Error("not imploment");
    }

    update(id: string, entity: TEntity): Promise<OperationStatus>  {
        throw new Error("not imploment");
    }

    delete(id: string): Promise<OperationStatus> {
        throw new Error("not imploment");
    }
}