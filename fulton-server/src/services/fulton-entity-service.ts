import { FultonService, Injectable } from "../index";
import { Repository } from "typeorm";

// // ?
// export interface IAuditableEntity {
//     createdBy: IUser;
//     createdAt: Date;
//     updatedBy: IUser;
//     updatedAt: Date;
// }

@Injectable()
export class FultonEntityService<TEntity> extends FultonService {
    constructor(protected repository: Repository<TEntity>) {
        super();
    }

    find(): Promise<TEntity[]> {
        throw new Error("not imploment");
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