import { Middleware, NextFunction, Request, Response } from "../alias";
import { AuthenticateOptions } from "./types";

let passport:any 
function requirePassport(){
    // load passport module if identity is enabled
    if (!passport) passport = require("passport")

    return passport
}

/**
 * custom authenticate for router action
 * for example
 * ```
 * @router("/user")
 * export class UserRouter extends Router {
 *     @httpPost("/login", authenticate("local", { failureRedirect: "/user/login" }))
 *     login(req: Request, res: Response) {
 *         res.redirect("/");
 *     }
 * }
 * ```
 * @param name name of the strategy 
 */
export function authenticate(name:string, options?: AuthenticateOptions, callback?: (...args: any[]) => any) : Middleware {
    return requirePassport().authenticate(name, options, callback)
}

/**
 * the default authenticate for  
 */
export function defaultAuthenticate(req: Request, res: Response, next: NextFunction) {
    // authenticate every request to get user info.
    requirePassport().authenticate(req.fultonApp.options.identity.defaultAuthSupportStrategies, function (error:any, user:any) {
        if (error) {
            next(error);
        } else if (user) {
            req.logIn(user, { session: false }, (err) => {
                next(err);
            });
        } else {
            if (req.fultonApp.options.identity.defaultAuthenticateErrorIfFailure) {
                res.sendStatus(401);
            } else {
                next();
            }
        }

    })(req, res, next);
}