import { injectable, IUser, Type } from "../index";
import { Repository, getRepository } from "typeorm";
import { IEntityService, inject, QueryParams, OperationResult, OperationOneResult, OperationStatus } from "../interfaces";
import { FultonApp } from "../fulton-app";

@injectable()
export class EntityService<TEntity> implements IEntityService<TEntity> {
    @inject(FultonApp)
    protected app: FultonApp;
    protected mainRepository: Repository<TEntity>

    constructor(entity: Type<TEntity>)
    constructor(mainRepository: Repository<TEntity>)
    constructor(input: Repository<TEntity> | Type<TEntity>) {
        if (input instanceof Repository) {
            this.mainRepository = input
        } else {
            this.mainRepository = this.getRepository(input);
        }
    }

    get currentUser(): IUser {
        return this.app.userService.currentUser;
    }

    protected getRepository<T>(entity: Type<T>, connectionName?: string): Repository<T> {
        return getRepository(entity, connectionName)
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

    update(id: string, entity: TEntity): Promise<OperationStatus> {
        throw new Error("not imploment");
    }

    delete(id: string): Promise<OperationStatus> {
        throw new Error("not imploment");
    }
}