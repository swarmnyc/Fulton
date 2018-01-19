import { FultonRouter } from "./fulton-router";
import { FultonEntityService } from "../services/FultonEntityService";
import { IFultonContext } from "../cores/IFultonContext";
import { FindManyOptions } from "typeorm";
import { DeepPartial } from "typeorm/common/DeepPartial";

export type ListFuncDelegate<TEntity> =  (context:IFultonContext, query?: FindManyOptions<TEntity>) => Promise<TEntity[]>;
export type DetailFuncDelegate<TEntity> =  (context:IFultonContext, id: any) => Promise<TEntity>;
export type CreateFuncDelegate<TEntity> =  (context: IFultonContext, obj: DeepPartial<TEntity>) => Promise<DeepPartial<TEntity>>;
export type UpdateFuncDelegate<TEntity> =  (context:IFultonContext, id: any, obj: DeepPartial<TEntity>) => Promise<void>;
export type DeleteFuncDelegate<TEntity> =  (context:IFultonContext, id: any) => Promise<void>;

// has 5 pre-definied action based to operate Entity
export abstract class FultonEntityRouter<TEntity> extends FultonRouter {
    protected listDelegate: ListFuncDelegate<TEntity>; 
    protected detailDelegate: DetailFuncDelegate<TEntity>;
    protected createDelegate: CreateFuncDelegate<TEntity>;
    protected updateDelegate: UpdateFuncDelegate<TEntity>;
    protected deleteDelegate: DeleteFuncDelegate<TEntity>;

    constructor(protected dataService: FultonEntityService<TEntity>) {
        super();

        this.listDelegate = this.dataService.find;
        this.detailDelegate = this.dataService.findById;
        this.createDelegate = this.dataService.create;
        this.updateDelegate = this.dataService.updateById;
        this.deleteDelegate = this.dataService.deleteById;
    }

    list(context:IFultonContext){

    }

    detail(context:IFultonContext){
        
    }

    create(context:IFultonContext){
        
    }

    update(context:IFultonContext){
        
    }

    delete(context:IFultonContext){
        
    }
}