import { Request, Response } from "../interfaces";
import { NextFunction } from "express";
import * as lodash from 'lodash';

// TODO: AuthorizeOptions for web-view;

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

/**
 * check the request is authenticated.
 * @param options 
 */
export function authorized(options?: AuthorizeOptions) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (req.isAuthenticated()) {
            next();
        } else {
            res.sendStatus(401);
        }
    };
}

/**
 * authorize the current user has the role
 * @param roles 
 * @param options 
 */
export function authorizedByRole(role: string, options?: AuthorizeOptions) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (req.isAuthenticated()) {
            let userRoles = req.user.roles;
            if (userRoles) {
                if (lodash.includes(userRoles, role)) {
                    next();
                    return;
                }
            }
        }

        res.sendStatus(403);
    };
}

/**
 * authorize the current user has of the roles 
 * @param roles 
 * @param options 
 */
export function authorizedByRoles(roles: string[], options?: AuthorizeOptions) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (req.isAuthenticated()) {
            let userRoles = req.user.roles;
            if (userRoles) {
                if (lodash.intersection(userRoles, roles).length > 0) {
                    next();
                    return;
                }
            }
        }

        res.sendStatus(403);
    };
}

