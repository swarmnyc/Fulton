import { IUser } from "./IUser";

export interface IUserManager<TUser extends IUser> {
    login(input: any) : Promise<TUser>
    exists(input: any) : Promise<TUser>
    register(input: any) : Promise<TUser>
    hashPassword(password:string): string
    comparePassword(password:string, hashedPassword:string): boolean;
}