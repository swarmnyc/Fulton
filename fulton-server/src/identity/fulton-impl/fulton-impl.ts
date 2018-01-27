import * as lodash from 'lodash';
import * as passport from 'passport';

import { StrategyResponseOptions, StrategyVerifyDone, IUserRegister, AccessToken, OAuthStrategyVerifier, StrategyOptions } from "../interfaces";
import { Middleware, Request, Response, NextFunction } from "../../interfaces";

import { FultonApp } from '../../fulton-app';
import { FultonUser } from "./fulton-user";
import { FultonError } from '../../common/fulton-error';
import FultonLog from '../../fulton-log';


/**
 * Default Fulton Implements
 */
export let FultonImpl = {
    /**
     * for LocalStrategyVerify like login
     */
    localStrategyVerifier(req: Request, username: string, password: string, done: StrategyVerifyDone) {
        req.userService
            .login(username, password)
            .then((user) => {
                done(null, user);
            }).catch((error) => {
                done(error);
            });
    },

    /**
     * for TokenStrategyVerify like bearer
     */
    async tokenStrategyVerifier(req: Request, token: string, done: StrategyVerifyDone) {
        let user = await req.userService.findByAccessToken(token);

        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    },

    /**
     * for StategySuccessHandler like login, bearer
     */
    async successMiddleware(req: Request, res: Response) {
        //TODO: Web-view for fultonStategySuccessCallback
        let accessToken = await req.userService.issueAccessToken(req.user);
        res.send(accessToken);
    },

    defaultAuthenticate(req: Request, res: Response, next: NextFunction) {
        // authenticate every request to get user info.
        passport.authenticate(req.fultonApp.options.identity.defaultAuthSupportStrategies,
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
    },

    oauthVerifierFn(provider: string, options: StrategyOptions, prfoileTransformer?: (profile: any) => any): OAuthStrategyVerifier {
        return (req: Request, access_token: string, fresh_token: string, profile: any, done: StrategyVerifyDone) => {
            let token: AccessToken = {
                provider: provider,
                access_token: access_token,
                refresh_token: fresh_token
            }

            if (prfoileTransformer) {
                profile = prfoileTransformer(profile);
            }

            req.userService
                .loginByOauth(token, profile)
                .then((user) => {
                    done(null, user);
                }).catch((error) => {
                    done(error);
                });
        }
    },

    callbackAuthenticateFn(options: StrategyOptions): Middleware {
        return (req: Request, res: Response, next: NextFunction) => {
            passport.authenticate(options.name,
                function (error, user, info) {
                    if (error) {
                        next(error);
                    } else if (user) {
                        req.logIn(user, { session: false }, (err) => {
                            options.successMiddleware(req, res, next);
                        });
                    } else {
                        // TODO: web-view
                        res.sendResult(401);
                    }

                })(req, res, next);
        }
    },

    registerHandler(req: Request, res: Response, next: NextFunction) {
        let options = req.fultonApp.options.identity.register;

        let input = req.body;
        input.username = req.body[options.usernameField];
        input.password = req.body[options.passwordField];
        input.email = req.body[options.emailField];

        req.userService
            .register(input)
            .then(async (user) => {
                req.logIn(user, options, (err) => {
                    if (options.responseOptions && options.responseOptions.successRedirect) {
                        res.redirect(options.responseOptions.successRedirect)
                    } else {
                        options.successCallback(req, res, next);
                    }
                })
            })
            .catch((error) => {
                if (options.responseOptions && options.responseOptions.failureRedirect) {
                    res.locals.error = error;
                    res.redirect(options.responseOptions.failureRedirect)
                } else {
                    if (error instanceof FultonError) {
                        res.status(400).send(error);
                    } else {
                        res.sendStatus(400);
                    }
                }
            });
    }
}

