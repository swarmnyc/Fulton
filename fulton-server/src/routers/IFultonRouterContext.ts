import { IUser } from "../auths/IUser";
import { IContainer } from "../../node_modules/tsioc";
// import { Context } from "koa";

export interface IFultonRouterContext<TUser extends IUser = IUser> {
    user: TUser;
    container: IContainer;
}