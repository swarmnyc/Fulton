import { IUser } from "../index";

// TODO: AuditableEntity
export abstract class AuditableEntity {
    createdBy: IUser;
    createdAt: Date;
    updatedBy: IUser;
    updatedAt: Date;
}