import { IUser } from "../auths/IUser";
import { IContainer } from "../../node_modules/tsioc";

export interface IFultonContext<TUser extends IUser = IUser> {
    user: TUser;
    container: IContainer;
}