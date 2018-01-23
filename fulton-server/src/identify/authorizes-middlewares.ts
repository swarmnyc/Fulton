import { Request, Response } from "../index";
import { NextFunction } from "express";

/**
 * For api mode
 * the default value is { failureStatusCode: true }
 * 
 * For web-view mode
 * the default value is { failureRedirect: '/auth/login' }
 */
export interface AuthorizeOptions {
    failureStatusCode?: true;
    failureSend?: any;
    failureRedirect?: string;
}


// TODO: authorize middleware
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

