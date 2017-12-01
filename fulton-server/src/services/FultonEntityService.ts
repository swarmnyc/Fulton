import { Repository, MongoRepository } from "typeorm"
import { FindManyOptions } from "typeorm/find-options/FindManyOptions";
import { DeepPartial } from "typeorm/common/DeepPartial";
import { IFultonContext } from "../cores/IFultonContext";
import { IUser } from "../index";


// ?
export interface IAuditableEntity {
    createdBy: IUser;
    createdAt: Date;
    updatedBy: IUser;
    updatedAt: Date;
}

// TModel is default Model, this 5 methods match the route actions
// if we want to get currect user, we have to pass context on each method
// because DataService is created at Router construction which is created at App Start
// also it is mess if the currentUser is global for Server Site
export interface IFultonEntityService<TEntity> {
    find(context: IFultonContext, query?: FindManyOptions<TEntity>): Promise<TEntity[]>;
    findById(context: IFultonContext, id: any): Promise<TEntity>;
    create(context: IFultonContext, obj: DeepPartial<TEntity>): Promise<DeepPartial<TEntity>>;
    updateById(context: IFultonContext, id: any, obj: DeepPartial<TEntity>): Promise<void>;
    deleteById(context: IFultonContext, id: any): Promise<void>;
}

export abstract class FultonEntityService<TEntity> implements IFultonEntityService<TEntity> {
    private readonly defalutRepository: Repository<TEntity>;
    constructor(defalutRepository: Repository<TEntity> | MongoRepository<TEntity>) {
        this.defalutRepository = defalutRepository;
    }

    find(context: IFultonContext, query?: FindManyOptions<TEntity>): Promise<TEntity[]> {
        return this.defalutRepository.find(query);
    }

    findById(context: IFultonContext, id: any): Promise<TEntity> {
        return this.defalutRepository.findOneById(id);
    }

    create(context: IFultonContext, obj: DeepPartial<TEntity>): Promise<DeepPartial<TEntity>> {
        return this.defalutRepository.save(obj);
    }

    updateById(context: IFultonContext, id: any, obj: DeepPartial<TEntity>): Promise<void> {
        return this.defalutRepository.updateById(id, obj)
    }

    deleteById(context: IFultonContext, id: any): Promise<void> {
        return this.defalutRepository.deleteById(id);
    }
}