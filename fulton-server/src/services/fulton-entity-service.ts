import { Injectable, IUser } from "../index";
import { Repository } from "typeorm";
import { IEntityService, Inject, QueryParams, OperationReault, OperationOneReault } from "../interfaces";
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

    find(queryParams: QueryParams): Promise<OperationReault<TEntity>> {
        throw new Error("not imploment");
    }

    findOne(queryParams: QueryParams): Promise<OperationOneReault<TEntity>> {
        throw new Error("not imploment");
    }

    create(): Promise<TEntity> {
        throw new Error("not imploment");
    }

    update(): Promise<TEntity> {
        throw new Error("not imploment");
    }

    delete(): Promise<TEntity> {
        throw new Error("not imploment");
    }
}