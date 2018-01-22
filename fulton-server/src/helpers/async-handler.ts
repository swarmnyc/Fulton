import { Request, Response, Middleware, NextFunction } from "../interfaces";
import { RequestHandler } from "express"

/**
 * async and await wrap, if return true, will call next
 */
export const asyncHandler = function (middleware: Middleware) {
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