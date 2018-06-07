import * as passport from 'passport';
import { AccessToken, IUser, OauthAuthenticateOptions, OauthStrategyVerifier, StrategyVerifyDone } from '../interfaces';
import { FultonError, ErrorCodes } from '../../common/fulton-error';
import { FultonLog } from '../../fulton-log';
import { Helper } from '../../helpers/helper';
import { Middleware, NextFunction, Request, Response } from '../../interfaces';
import { OauthStrategyOptions } from '../options/oauth-strategy-options';

function setCallbackUrl(req: Request, options: OauthStrategyOptions, target: OauthAuthenticateOptions) {
    if (Helper.getBoolean(req.query.noRedirectUrl, false)) {
        // the callbackUrl have to null for mobile, at least for Google 
        target.callbackUrl = target.callbackURL = null
    } else {
        if (options.callbackUrl) {
            target.callbackUrl = target.callbackURL = options.callbackUrl;
        } else {
            // if the callbackUrl is null, use current Url + callbackPath
            target.callbackUrl = target.callbackURL = Helper.urlResolve(req, options.callbackPath);
        }
    }
}

/**
 * Default Fulton Identity Implementations for passport and middlewares
 */
export let FultonIdentityImpl = {
    /**
     * for LocalStrategyVerify like login
     */
    localStrategyVerifier(req: Request, username: string, password: string, done: StrategyVerifyDone) {
        req.userService
            .login(username, password)
            .then((user: IUser) => {
                done(null, user);
            }).catch((error: any) => {
                FultonLog.warn("login failed by", error)
                done(error);
            });
    },

    /**
     * for TokenStrategyVerify like bearer
     */
    async tokenStrategyVerifier(req: Request, token: string, done: StrategyVerifyDone) {
        try {
            let user = await req.userService.loginByAccessToken(token);

            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        } catch (error) {
            FultonLog.warn("loginByAccessToken failed by", error)
            return done(null, false);
        }
    },

    /**
     * for StrategySuccessHandler like login, bearer
     */
    async issueAccessToken(req: Request, res: Response) {
        //TODO: Web-view for fultonStrategySuccessCallback
        let accessToken = await req.userService.issueAccessToken(req.user);
        res.send(accessToken);
    },


    /**
     * the default authenticate middleware
     */
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
                        res.sendStatus(401);
                    } else {
                        next();
                    }
                }

            })(req, res, next);
    },

    /**
     * the wrapper for passport.authenticate, the purpose of it is that generate callbackUrl dynamically
     * @param options 
     */
    oauthAuthenticateFn(options: OauthStrategyOptions): Middleware {
        return (req: Request, res: Response, next: NextFunction) => {
            setCallbackUrl(req, options, options.authenticateOptions)

            // if there is a user, put userId on state
            if (req.user) {
                options.authenticateOptions.state = req.user.id.toString();
            }

            passport.authenticate(options.name, options.authenticateOptions)(req, res, next);
        }
    },
    /**
     * the wrapper of auth verifier, the purpose of it is to call req.userService.loginByOauth with the formated parameters.
     */
    oauthVerifierFn(options: OauthStrategyOptions): OauthStrategyVerifier {
        return (req: Request, access_token: string, fresh_token: string, profile: any, done: StrategyVerifyDone) => {
            let token: AccessToken = {
                provider: options.name,
                access_token: access_token,
                refresh_token: fresh_token
            }

            if (options.profileTransformer) {
                profile = options.profileTransformer(profile);
            }

            // if the state has value, it should be userId
            var userId = req.query["state"];

            req.userService
                .loginByOauth(userId, token, profile)
                .then((user: IUser) => {
                    done(null, user);
                }).catch((error: any) => {
                    done(error);
                });
        }
    },

    /**
     * the wrapper for passport.authenticate for oauth callback, the purpose of it is that generate callbackUrl dynamically
     * @param options 
     */
    oauthCallbackAuthenticateFn(options: OauthStrategyOptions): Middleware {
        return (req: Request, res: Response, next: NextFunction) => {
            function finished(error: any, user: any, info: any) {
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
                                FultonIdentityImpl.issueAccessToken(req, res);
                            }
                        }
                    });

                    return;
                }

                // TODO: web-view mode
                res.sendStatus(401);
            }

            if (req.query.access_token) {
                // mobile flow, like facebook login on Android, android app get access_token already, so here just get profile
                // this is hack passport to skip one step.
                let strategy = passport._strategy(options.name)
                if (strategy.userProfile) {
                    strategy.userProfile(req.query.access_token, (error, profile) => {
                        if (error) {
                            next(error);
                            return;
                        }

                        strategy._verify(req, req.query.access_token, req.query.refresh_token, profile, finished)
                    })
                } else {
                    next(new FultonError(ErrorCodes.Unknown));
                }
            } else {
                setCallbackUrl(req, options, options.callbackAuthenticateOptions)

                // normal flow, providers return a code, use the code to get access_token and profile
                passport.authenticate(options.name, options.callbackAuthenticateOptions, finished)(req, res, next);
            }
        }
    },

    registerHandler(req: Request, res: Response, next: NextFunction) {
        let options = req.fultonApp.options.identity.register;

        let input = req.body;

        // rename
        input.username = input[options.usernameField];
        input.password = input[options.passwordField];
        input.email = input[options.emailField];

        req.userService
            .register(input)
            .then((user: IUser) => {
                req.logIn(user, options, (err) => {
                    if (options.responseOptions && options.responseOptions.successRedirect) {
                        res.redirect(options.responseOptions.successRedirect)
                    } else {
                        options.successCallback(req, res, next);
                    }
                })
            })
            .catch((error: any) => {
                FultonLog.warn("user register failed by", error)
                if (options.responseOptions && options.responseOptions.failureRedirect) {
                    res.redirect(options.responseOptions.failureRedirect)
                } else {
                    if (error instanceof FultonError) {
                        next(error)
                    } else {
                        next(new FultonError(ErrorCodes.Unknown));
                    }
                }
            });
    },

    forgotPasswordHandler(req: Request, res: Response, next: NextFunction) {
        let options = req.fultonApp.options.identity.forgotPassword;

        let username = req.body.username;
        let email = req.body.email;

        let token = req.body.token;
        let code = req.body.code;

        let password = req.body.password;

        if (username || email) {
            // send notification
            req.userService
                .forgotPassword(username || email)
                .then((result) => {
                    res.send({
                        data: result
                    })
                }).catch(next)
        } else if (token && code && password) {
            // reset password
            req.userService
                .resetPassword(token, code, password)
                .then(() => {
                    res.send({
                        status: 200
                    })
                }).catch(next)
        } else if (token && code) {
            // verify the token and code
            // reset password
            req.userService
                .verifyResetPassword(token, code)
                .then(() => {
                    res.send({
                        status: 200
                    })
                }).catch(next)
        } else {
            next(new FultonError(ErrorCodes.Invalid))
        }
    }
}

