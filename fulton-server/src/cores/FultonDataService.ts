import { IFultonDataSet, FultonQuery, FultonQueryWhere, FultonId } from "../datasets/IFultonDataSet";

//TModel is default Model, this 5 methods match the route actions
export interface IFultonDataService<TModel> {
    find(query?: FultonQuery): Promise<TModel[]>;
    findById(id: number | string): Promise<TModel>;
    create(obj: TModel): Promise<TModel>;
    updateById(id: FultonId, obj: TModel): Promise<boolean>;
    deleteById(id: FultonId): Promise<boolean>;
}

export abstract class FultonDataService<TModel = any> {
    constructor(private defalutDataSet: IFultonDataSet) {
    }

    find(query?: FultonQuery): Promise<TModel[]> {
        return this.defalutDataSet.find(query);
    }

    findById(id: number | string): Promise<TModel> {
        return this.defalutDataSet.findById(id);
    }

    create(obj: TModel): Promise<TModel> {
        return this.defalutDataSet.create(obj);
    }

    updateById(id: FultonId, obj: TModel): Promise<boolean> {
        return this.defalutDataSet.updateById(id, obj)
    }

    deleteById(id: FultonId): Promise<boolean> {
        return this.defalutDataSet.deleteById(id);
    }
}