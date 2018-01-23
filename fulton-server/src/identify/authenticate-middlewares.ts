import { Request, Response, NextFunction, Middleware } from "../index";
import * as passport from "passport";

export type AuthenticateOptions = passport.AuthenticateOptions;

export function authenticate(name:string, options?: AuthenticateOptions, callback?: (...args: any[]) => any) : Middleware {
    return passport.authenticate(name, options, callback)
}


