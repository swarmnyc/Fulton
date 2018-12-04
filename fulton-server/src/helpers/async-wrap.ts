import { Middleware, NextFunction, Request, Response } from "../alias";

/**
 * async and await wrap, if return true, will call next
 */
export const asyncWrap = function (middleware: Middleware) : any | Promise<any> {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise
            .resolve(middleware(req, res, next))
            .then((result) => {
                if (result == true) {
                    next();
                }
            })
            .catch(next);
    };
}