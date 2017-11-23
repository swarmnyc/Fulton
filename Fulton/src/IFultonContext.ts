import { IUser } from "./auths/IUser";
import { ILogger } from "./cores/ILogger";

export interface IFultonContext<TUser extends IUser> {
    user:TUser
    logger: ILogger
}