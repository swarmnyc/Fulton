import { FultonService, Injectable, IUser, OperationReault, QueryColumnStates } from "../index";
import { MongoRepository } from "typeorm";
import { IEntityService, Inject, QueryParams, OperationOneReault } from "../interfaces";
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
        try {
            this.transformQueryParams(queryParams);

            let skip, take, index;

            if (queryParams.pagination) {
                index = queryParams.pagination.index || 0;
                take = queryParams.pagination.size || this.app.options.settings.paginationSize;
                skip = index * take;
            } else {
                index = 0;
                take = this.app.options.settings.paginationSize;
            }

            // let select = this.transformSelect(queryParams);

            let data = await this.repository.findAndCount({
                where: queryParams.filter,
                skip: skip,
                take: take,
                order: queryParams.sort as any
            });

            if (queryParams.includes) {
                await this.includes(data[0], queryParams.includes);
            }

            return {
                data: data[0],
                pagination: {
                    total: data[1],
                    index: index,
                    size: take
                }
            }
        } catch (error) {
            return {
                errors: {
                    "": error.message
                }
            }
        }
    }

    async findOne(queryParams: QueryParams): Promise<OperationOneReault> {
        try {
            this.transformQueryParams(queryParams);

            //let select = this.transformSelect(queryParams);

            let data = await this.repository.findOne({
                where: queryParams.filter,
                order: queryParams.sort as any
            });

            if (queryParams.includes) {
                await this.includes(data, queryParams.includes);
            }

            return {
                data: data
            }
        } catch (error) {
            return {
                errors: {
                    "": error.message
                }
            }
        }
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

    protected includes(data: TEntity | TEntity[], columns: string[]): Promise<any> {
        // TODO: includes
        return;
    }

    /**
     * transform like change id to _id, change $like to {$regex, $options} 
     */
    protected transformQueryParams(queryParams: QueryParams): void {
        if (queryParams.filter) {
            this.transformFilter(queryParams.filter);
        }

        if (queryParams.sort && queryParams.sort["id"]) {
            queryParams.sort["_id"] = queryParams.sort["id"];
            delete queryParams.sort["id"]
        }
    }

    /**
     * transform select to mongo projection
     * @param queryParams 
     */
    protected transformSelect(queryParams: QueryParams): QueryColumnStates {
        // TODO: typeorm has bug on prjection on mongodb
        return;
    }

    /**
     * transform like change id to _id, change $like to {$regex, $options} 
     */
    private transformFilter(target: any) {
        for (const name of Object.getOwnPropertyNames(target)) {
            let value = target[name];
            if (name == "id") {
                target["_id"] = value;
                delete target["id"]
            } else if (name == "$like") {
                target["$regex"] = value;
                target["$options"] = "i";
                delete target["$like"]
            } else if (typeof value == "object") {
                this.transformFilter(value);
            }
        }
    }
}