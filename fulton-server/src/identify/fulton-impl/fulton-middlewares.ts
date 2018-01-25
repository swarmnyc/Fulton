import * as lodash from 'lodash';
import * as passport from 'passport';

import { LocalStrategyVerifyDone, StrategyResponseOptions, StrategyVerifyDone, IUserRegister } from "../interfaces";
import { Middleware, NextFunction, Request, Response } from "../../interfaces";

import { FultonApp } from '../../fulton-app';
import { FultonUser } from "./fulton-user";
import { FultonError } from '../../common/fulton-error';
import FultonLog from '../../fulton-log';

/**
 * for LocalStrategyVerify like login
 */
export function fultonLocalStrategyVerify(req: Request, username: string, password: string, done: LocalStrategyVerifyDone) {
    req.userService
        .login(username, password)
        .then((user) => {
            done(null, user);
        }).catch((error) => {
            done(error);
        });;
}

/**
 * for TokenStrategyVerify like bearer
 */
export async function fultonTokenStrategyVerify(req: Request, token: string, done: StrategyVerifyDone) {
    if (!token) {
        done(new FultonError({ "token": ["token is required"] }));
    }

    let user = await req.userService.findByAccessToken(token);

    if (user) {
        return done(null, user);
    } else {
        return done(null, false);
    }
}

/**
 * for StategySuccessHandler like login, bearer
 */
export async function fultonStategySuccessHandler(req: Request, res: Response) {
    let accessToken = await req.userService.issueAccessToken(req.user);
    res.send(accessToken);
}

/**
 * for DefaultAuthenticateHandler 
 */
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

/**
 * for register 
 */
export function fultonRegisterHandler(req: Request, res: Response, next: NextFunction) {
    let options = req.fultonApp.options.identify.register;

    let input = req.body;
    input.username = req.body[options.usernameField];
    input.password = req.body[options.passwordField];
    input.email = req.body[options.emailField];

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
        .catch((error) => {
            if (error instanceof FultonError) {
                res.status(400).send(error);
            } else {
                res.sendStatus(400);
            }
        });
};