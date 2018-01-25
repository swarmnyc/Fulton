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

export async function fultonDefaultStategySuccessHandler(req: Request, res: Response) {
    let accessToken = await req.userService.issueAccessToken(req.user);
    res.send(accessToken);
}

export function fultonDefaultAuthenticateHandler(req: Request, res: Response, next: NextFunction) {
    // authenticate every request to get user info.
    passport.authenticate(req.fultonApp.options.identify.enabledStrategies,
        function (error, user, info) {
            if (error) {
                next(error);
            } else if (user) {
                req.logIn(user, { session: false }, (err) => {
                    next(err);
                });
            } else {
                if (req.fultonApp.options.identify.defaultAuthenticateErrorIfFailure) {
                    res.sendResult(401);
                } else {
                    next();
                }
            }

        })(req, res, next);
};

export function fultonDefaultRegisterHandler(req: Request, res: Response, next: NextFunction) {
    let options = req.fultonApp.options.identify.register;
    let input = {
        username: req.body[options.usernameField],
        password: req.body[options.passwordField],
        email: req.body[options.emailField]
    }

    if (!input.username && !input.password && !input.email) {
        res.sendStatus(400);
        return;
    }

    req.userService
        .register(input)
        .then(async (user) => {
            if (req.fultonApp.mode == "api") {
                let accessToken = await req.userService.issueAccessToken(user);
                res.send(accessToken);
            } else {
                res.redirect(options.webViewOptions.successRedirect);
            }
        })
};