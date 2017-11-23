import { IFultonContext } from "../IFultonContext";
import { IUser } from "./IUser";
import { ILogger } from "../cores/ILogger";

export interface IFultonAuthenticate {
    authenticate(context: IFultonContext<IUser>): IUser
}