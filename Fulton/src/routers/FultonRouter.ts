import { IFultonContext } from "../IFultonContext";
import { IUser } from "../auths/IUser";

export interface IFultonRouter {

}

export abstract class JsonApiFultonRouter implements IFultonRouter {

}

export abstract class RestApiFultonRouter implements IFultonRouter {

}

export abstract class AuthFultonRouter implements IFultonRouter {
    abstract auth(context: IFultonContext<IUser>) : void
}