import * as lodash from 'lodash';
import * as passport from 'passport';

import { LocalStrategyVerifyDone, StrategyResponseOptions, StrategyVerifyDone } from "../interfaces";
import { Middleware, NextFunction, Request, Response } from "../../interfaces";

import { FultonApp } from '../../fulton-app';
import { FultonUser } from "./fulton-user";

export async function fultonLocalStrategyVerify(req: Request, username: string, password: string, done: LocalStrategyVerifyDone) {
    if (!username || !password) {
        done(null, false);
    }

    let user = await req.userService.login(username, password) as FultonUser;
    if (user) {
        return done(null, user);
    } else {
        return done(null, false);
    }
}

export async function fultonTokenStrategyVerify(req: Request, token: string, done: StrategyVerifyDone) {
    if (!token) {
        done(null, false);
    }

    let user = await req.userService.findByAccessToken(token);

    if (user) {
        return done(null, user);
    } else {
        return done(null, false);
    }
}

export async function fultonStrategyResponse(req: Request, res: Response) {
    let accessToken = await req.userService.issueAccessToken(req.user);
    res.send(accessToken);
}

export function fultonLoadUserMiddleware(strategies: string[]): Middleware {
    return (req: Request, res: Response, next: NextFunction) => {
        // authenticate every request to get user info.
        passport.authenticate(strategies, { session: false },
            function (error, user, info) {
                if (error) {
                    return next(error);
                }
                if (user) {
                    req.user = user;
                }
                next();
            })(req, res, next);
    };
};