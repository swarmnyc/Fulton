import { FultonRouter } from "./FultonRouter";
import { IFultonDataSet } from "../datasets/IFultonDataSet";
import { FultonDataService } from "../cores/FultonDataService";
import { FultonQuery, FultonId, IFultonContext } from "../index";

export type ListFuncDelegate<TModel> =  (query?: FultonQuery) => Promise<TModel[]>;
export type DetailFuncDelegate<TModel> =  (key: any) => Promise<TModel>;
export type UpdateFuncDelegate<TModel> =  (key: any, obj: TModel) => Promise<boolean>;


// has 5 pre-definied action based on model
export abstract class FultonModelRouter<TModel = any> extends FultonRouter {
    protected listDelegate: ListFuncDelegate<TModel>; // 
    protected detailDelegate: DetailFuncDelegate<TModel>;
    protected createDelegate: UpdateFuncDelegate<TModel>;

    constructor(protected dataService: FultonDataService) {
        super();

        this.listDelegate = this.dataService.find;
        this.detailDelegate = this.dataService.findById;
        this.create = this.dataService.create;
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