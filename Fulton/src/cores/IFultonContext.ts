import { IUser } from "../auths/IUser";
import { ILogger } from "./ILogger";
import { Context } from "koa";
import { IUserManager } from "../index";

export interface IFultonContext<TUser extends IUser = IUser> extends Context {
    user: TUser
    userManager: IUserManager<TUser>
    logger: ILogger
}