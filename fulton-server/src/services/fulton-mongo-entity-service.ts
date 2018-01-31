import { FultonService, Injectable, IUser, OperationReault, QueryColumnStates } from "../index";
import { MongoRepository } from "typeorm";
import { IEntityService, Inject, QueryParams } from "../interfaces";
import { FultonApp } from "../fulton-app";
import { EntityMetadataHelper } from "../helpers/entity-metadata-helper";

@Injectable()
export class MongoEntityService<TEntity> implements IEntityService<TEntity> {
    @Inject(FultonApp)
    protected app: FultonApp;

    constructor(protected repository: MongoRepository<TEntity>) {
    }

    private get metadataHelper(): EntityMetadataHelper {
        return this.app["entityMetadataHelper"];
    }

    get currentUser(): IUser {
        return this.app.userService.currentUser;
    }

    async find(queryParams: QueryParams): Promise<OperationReault> {
        let skip, take, index;

        if (queryParams.pagination) {
            index = queryParams.pagination.index || 0;
            take = queryParams.pagination.size || this.app.options.settings.paginationSize;
            skip = index * take;
        } else {
            index = 0;
            take = this.app.options.settings.paginationSize;
        }

        // includes
        let select = this.generateSelect(queryParams);

        let result = await this.repository.findAndCount({
            where: queryParams.filter,
            skip: skip,
            take: take,
            order: queryParams.sort as any
        });

        if (queryParams.includes){
            await this.includes(result[0], queryParams.includes);
        }

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

    private generateSelect(queryParams: QueryParams): QueryColumnStates {
        // TODO: typeorm has bug on prjection on mongodb
        return;
    }

    private includes(data: TEntity[], columns: string[]): Promise<any> {
        // TODO: includes
        return;
    }
}