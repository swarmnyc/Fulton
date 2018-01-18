import { IUser } from "../auths/IUser";

export interface IFultonContext<TUser extends IUser = IUser> {
    user: TUser;
    container: any;
}