import { IUser } from "./IUser";

export interface IUserManager<TUser extends IUser> {
    login(input: any) : TUser
    exists(input: any) : TUser
    register(input: any) : TUser
    hashPassword(password:string): string
    comparePassword(password:string, hashedPassword:string): boolean;
}