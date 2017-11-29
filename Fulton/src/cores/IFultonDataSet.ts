export interface FultonDataSetWhere {
    [name: string]: any;
}

export interface DataSetFields {
    [name: string]: boolean;
}

export interface FultonDataSetSort {
    [name: string]: boolean;
}

export interface FultonDataSetQuery {
    where?: FultonDataSetWhere;
    fields?: DataSetFields;
    sort?: FultonDataSetSort;
    page?: number;
    limit?: number;
}

export interface IFultonDataSet<TModel = any> {  
    tableName?: string

    find(query?: FultonDataSetQuery): Promise<TModel[]>;
    findOne(where: FultonDataSetWhere): Promise<TModel>;
    create(obj: TModel): Promise<TModel>;
    update(obj: TModel): Promise<TModel>;

    updateBy(where: FultonDataSetWhere, obj: TModel): Promise<number>;
    deleteBy(where: FultonDataSetWhere): Promise<number>;

    blukCreate(objs: TModel[]): Promise<TModel[]>;
    blukUpdate(objs: TModel[]): Promise<TModel[]>;
    blukDelete(objs: TModel[]): Promise<TModel[]>;
}

