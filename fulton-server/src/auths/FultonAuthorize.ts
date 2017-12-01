import { IFultonRouterContext } from "../routers/IFultonRouterContext";

export function FultonDefaultAuthorize(context: IFultonRouterContext, next: () => Promise<any>): void {
    if (context.user == null) {
        context.throw(401)
    } else {
        next()        
    }
}