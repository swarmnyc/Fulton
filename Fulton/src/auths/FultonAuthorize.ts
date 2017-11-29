import { IFultonContext } from "../cores/IFultonContext";
import { IUser } from "../index";

export function FultonDefaultAuthorize(context: IFultonContext, next: () => Promise<any>): void {
    if (context.user == null) {
        context.throw(401)
    } else {
        next()        
    }
}