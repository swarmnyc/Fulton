import { FultonService, Injectable, IUser, QueryResult } from "../index";
import { MongoRepository } from "typeorm";
import { IEntityService, Inject, QueryParams } from "../interfaces";
import { FultonApp } from "../fulton-app";


@Injectable()
export class MongoEntityService<TEntity> implements IEntityService<TEntity> {
    @Inject(FultonApp)
    protected app: FultonApp;

    constructor(protected repository: MongoRepository<TEntity>) {
    }

    get currentUser(): IUser {
        return this.app.userService.currentUser;
    }

    async find(queryParams: QueryParams): Promise<QueryResult> {
        let skip, take, index;

        if (queryParams.pagination) {
            index = queryParams.pagination.index || 0;
            take = queryParams.pagination.size || this.app.options.settings.paginationSize;

            skip = index * take;
        } else {
            index = 0;
            take = this.app.options.settings.paginationSize;
        }

        // TODO: projection, includes

        let result = await this.repository.findAndCount({
            where: queryParams.filter,
            skip: skip,
            take: take
        });

        return {
            data: result[0],
            pagination: {
                total: result[1],
                index: index,
                size: take
            }
        }
    }

    findById(): Promise<TEntity> {
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