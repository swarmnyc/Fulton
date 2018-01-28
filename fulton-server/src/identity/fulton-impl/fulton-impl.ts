import * as lodash from 'lodash';
import * as passport from 'passport';
import * as url from 'url';

import { StrategyVerifyDone, IUserRegister, AccessToken, OAuthStrategyVerifier, StrategyOptions, OAuthStrategyOptions } from "../interfaces";
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

    /**
     * the wrapper of auth verifier, the purpose of it is to call req.userService.loginByOauth with the formated parameters.
     * @param provider 
     * @param options 
     * @param prfoileTransformer 
     */
    oauthVerifierFn(options: OAuthStrategyOptions): OAuthStrategyVerifier {
        return (req: Request, access_token: string, fresh_token: string, profile: any, done: StrategyVerifyDone) => {
            let token: AccessToken = {
                provider: options.name,
                access_token: access_token,
                refresh_token: fresh_token
            }

            if (options.prfoileTransformer) {
                profile = options.prfoileTransformer(profile);
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

    /**
     * the wrapper for passport.authenticate, the purpose of it is that generate callbackUrl dynamically
     * @param options 
     */
    oauthAuthenticateFn(options: OAuthStrategyOptions): Middleware {
        return (req: Request, res: Response, next: NextFunction) => {
            if (!options.callbackUrl) {
                options.strategyOptions.callbackUrl = url.resolve(`${req.protocol}://${req.get("host")}`, options.callbackPath);
            }

            passport.authenticate(options.name, options.authenticateOptions)(req, res, next);
        }
    },

    /**
     * the wrapper for passport.authenticate for oauth callback, the purpose of it is that generate callbackUrl dynamically
     * @param options 
     */
    oauthCallbackAuthenticateFn(options: OAuthStrategyOptions): Middleware {
        return (req: Request, res: Response, next: NextFunction) => {
            if (!options.callbackUrl) {
                options.strategyOptions.callbackUrl = url.resolve(`${req.protocol}://${req.get("host")}`, options.callbackPath);
            }

            passport.authenticate(options.name,
                function (error, user, info) {
                    if (error) {
                        next(error);
                        return;
                    }

                    if (user) {
                        let opts = options.callbackAuthenticateOptions;
                        req.logIn(user, opts, (err) => {
                            if (opts && opts.successRedirect) {
                                res.redirect(opts.successRedirect);
                            } else {
                                if (options.callbackSuccessMiddleware) {
                                    options.callbackSuccessMiddleware(req, res, next);
                                } else {
                                    FultonImpl.successMiddleware(req, res);
                                }
                            }
                        });

                        return;
                    }

                    // TODO: web-view mode
                    res.sendResult(401);
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

