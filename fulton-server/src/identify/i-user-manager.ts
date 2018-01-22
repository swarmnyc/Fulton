import { IUser } from "./i-user";

export interface IUserManager {
    findByUsernamePassword(username: string, password: string): IUser;
    findByToken(token: string): IUser;
    register(user: IUser): Promise<IUser>;
}