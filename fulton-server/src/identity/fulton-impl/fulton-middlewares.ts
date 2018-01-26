import * as lodash from 'lodash';
import * as passport from 'passport';

import { LocalStrategyVerifyDone, StrategyResponseOptions, StrategyVerifyDone, IUserRegister, AccessToken } from "../interfaces";
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
        });
}

/**
 * for TokenStrategyVerify like bearer
 */
export async function fultonTokenStrategyVerify(req: Request, token: string, done: StrategyVerifyDone) {
    let user = await req.userService.findByAccessToken(token);

    if (user) {
        return done(null, user);
    } else {
        return done(null, false);
    }
}

/**
 * for oauth strategy verify like google
 */
export async function fultonOAuthStrategyVerify(req: Request, token: AccessToken, profile: any, done: StrategyVerifyDone) {
    req.userService
        .loginByOauth(token, profile)
        .then((user) => {
            done(null, user);
        }).catch((error) => {
            done(error);
        });
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
    passport.authenticate(req.fultonApp.options.identity.enabledStrategies,
        function (error, user, info) {
            if (error) {
                next(error);
            } else if (user) {
                req.logIn(user, { session: false }, (err) => {
                    next(err);
                });
            } else {
                if (req.fultonApp.options.identity.defaultAuthenticateErrorIfFailure) {
                    // TODO: web-view
                    res.sendResult(401);
                } else {
                    next();
                }
            }

        })(req, res, next);
};


/**
 * handler OAuth Authenticate
 * @param name 
 */
export function fultonOauthAuthenticateHandler(name: string): Middleware {
    return (req: Request, res: Response, next: NextFunction) => {
        passport.authenticate(name,
            function (error, user, info) {
                if (error) {
                    next(error);
                } else if (user) {
                    req.logIn(user, { session: false }, (err) => {
                        // TODO: web-view
                        fultonStategySuccessHandler(req, res);
                    });
                } else {
                    // TODO: web-view
                    res.sendResult(401);
                }

            })(req, res, next);
    }
};


/**
 * for register 
 */
export function fultonRegisterHandler(req: Request, res: Response, next: NextFunction) {
    let options = req.fultonApp.options.identity.register;

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