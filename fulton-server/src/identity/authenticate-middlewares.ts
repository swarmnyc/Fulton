import * as passport from "passport";

import { Middleware, NextFunction, Request, Response } from "../interfaces";

import { AuthenticateOptions } from "./interfaces";

export function authenticate(name:string, options?: AuthenticateOptions, callback?: (...args: any[]) => any) : Middleware {
    return passport.authenticate(name, options, callback)
}


