import * as passport from "passport";

import { Middleware, NextFunction, Request, Response } from "../interfaces";

import { AuthenticateOptions } from "./interfaces";

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
    return passport.authenticate(name, options, callback)
}


