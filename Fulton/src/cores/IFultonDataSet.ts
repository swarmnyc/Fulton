import { type } from "os";

export interface FultonQueryWhere {
    [name: string]: any;
}

export interface FultonQueryFields {
    [name: string]: boolean;
}

export interface FultonQuerySort {
    [name: string]: boolean;
}

export interface FultonQuery {
    where?: FultonQueryWhere;
    fields?: FultonQueryFields;
    sort?: FultonQuerySort;
    page?: number;
    limit?: number;
}

export type FultonId = number | string;


export interface IFultonSchema {
    //?
}
export interface IFultonDataSet<TModel = any> {
    scheam : IFultonSchema;
    
    find(query?: FultonQuery): Promise<TModel[]>;
    findById(id: FultonId): Promise<TModel>;
    create(obj: TModel): Promise<TModel>;
    update(obj: TModel): Promise<boolean>;
    delete(obj: TModel): Promise<boolean>;

    updateBy(where: FultonQueryWhere, obj: TModel): Promise<number>;
    deleteBy(where: FultonQueryWhere): Promise<number>;

    updateById(id: FultonId, obj: TModel): Promise<boolean>;
    deleteById(id: FultonId): Promise<boolean>;

    blukCreate(objs: TModel[]): Promise<TModel[]>;
    blukUpdate(objs: TModel[]): Promise<number>;
    blukDelete(objs: TModel[]): Promise<number>;
}

