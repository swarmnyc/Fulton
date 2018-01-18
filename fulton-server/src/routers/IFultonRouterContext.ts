import { IUser } from "../auths/IUser";
// import { Context } from "koa";

export interface IFultonRouterContext<TUser extends IUser = IUser> {
    user: TUser;
    container: any;
}