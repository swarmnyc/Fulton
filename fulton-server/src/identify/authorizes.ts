import { Request, Response } from "../index";
import { NextFunction } from "express";

export interface AuthorizeOptions {
    failureStatusCode?: true;
    failureSend?: any;
    failureRedirect?: string;
}

export function authorize(options?: AuthorizeOptions) {
    return (req: Request, res: Response, next: NextFunction) => {

    };
}

export function authorizeByRole(role: string, options?: AuthorizeOptions) {
    return (req: Request, res: Response, next: NextFunction) => {

    };
}

export function authorizeByRoles(roles: string[], options?: AuthorizeOptions) {
    return (req: Request, res: Response, next: NextFunction) => {

    };
}

