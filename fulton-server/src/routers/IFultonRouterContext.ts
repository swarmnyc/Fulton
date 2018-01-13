import { IUser } from "../auths/IUser";
import { ILogger } from "../cores/ILogger";
import { IContainer } from "../../node_modules/tsioc";
// import { Context } from "koa";

export interface IFultonRouterContext<TUser extends IUser = IUser> {
    user: TUser;
    logger: ILogger;
    container: IContainer;
}