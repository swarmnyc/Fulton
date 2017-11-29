export interface DataSetWhere {
    [name: string]: any;
}

export interface DataSetFields {
    [name: string]: boolean;
}

export interface DataSetSort {
    [name: string]: boolean;
}

export interface DataSetQuery {
    where?: DataSetWhere;
    fields?: DataSetFields;
    sort?: DataSetSort;
    page?: number;
    limit?: number;
}

export interface IDateSet<TModel> {  
    tableName?: string

    find(query?: DataSetQuery): Promise<TModel[]>;
    findOne(where: DataSetWhere): Promise<TModel>;
    create(obj: TModel): Promise<TModel>;
    update(obj: TModel): Promise<TModel>;

    updateBy(where: DataSetWhere, obj: TModel): Promise<number>;
    deleteBy(where: DataSetWhere): Promise<number>;

    blukCreate(objs: TModel[]): Promise<TModel[]>;
    blukUpdate(objs: TModel[]): Promise<TModel[]>;
    blukDelete(objs: TModel[]): Promise<TModel[]>;
}

