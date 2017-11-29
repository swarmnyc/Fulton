import { IFultonContext } from "../cores/IFultonContext";
import { IUser } from "./IUser";

export function FultonHeaderAuthenticate(context: IFultonContext, next: () => Promise<any>): void {
    // check header
    context.user = null 

    next()
}

