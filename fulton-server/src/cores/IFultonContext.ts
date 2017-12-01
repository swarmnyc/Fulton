import { IUser } from "../auths/IUser";
import { ILogger } from "./ILogger";
import { Context } from "koa";
import { IUserManager } from "../index";
import { IContainer } from "../../node_modules/tsioc";
import { FultonApp } from "../FultonApp";

export interface IFultonContext<TUser extends IUser = IUser> extends Context {
    fultonApp: FultonApp;
    user: TUser;
    logger: ILogger;
    container: IContainer;
}