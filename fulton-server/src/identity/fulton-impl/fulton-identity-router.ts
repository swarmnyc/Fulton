import * as lodash from 'lodash';
import * as passport from 'passport';
import { ErrorCodes, FultonError } from "../../common";
import { IFultonApp } from "../../fulton-app";
import { FultonLog } from "../../fulton-log";
import { Helper } from '../../helpers';
import { Middleware, NextFunction, Request, Response } from "../../interfaces";
import { IdentityOptions } from "../identity-options";
import { IIdentityRouter, IUser, OauthAuthenticateOptions } from "../interfaces";
import { OauthStrategyOptions } from '../options/oauth-strategy-options';

type Strategy = passport.Strategy;

export class FultonIdentityRouter implements IIdentityRouter {
    protected app: IFultonApp;
    protected options: IdentityOptions;

    init(app: IFultonApp, options: IdentityOptions) {
        this.app = app;
        this.options = options;

        this.initRegister();

        this.initForgotPassword();

        this.initLogout();

        this.initProfile();

        this.initStrategy();

        // todo: OAuth disconnection 
    }

    initRegister() {
        if (this.options.register.enabled) {
            this.app.express.post(this.options.register.path, this.register.bind(this));
        }
    }

    initForgotPassword() {
        if (this.options.forgotPassword.enabled) {
            this.app.express.post(this.options.forgotPassword.requirePath, this.forgotPassword.bind(this));
            this.app.express.post(this.options.forgotPassword.verifyPath, this.verifyResetPassword.bind(this));
            this.app.express.post(this.options.forgotPassword.resetPath, this.resetPassword.bind(this));
        }
    }

    initLogout() {
        if (this.options.logout.enabled) {
            this.app.express.get(this.options.logout.path, this.logout.bind(this))
            this.app.express.post(this.options.logout.path, this.logout.bind(this))
        }
    }

    initProfile() {
        if (this.options.profile.enabled) {
            this.app.express.get(this.options.profile.path, this.profile.bind(this))
        }

        if (this.options.profile.updateEnabled) {
            this.app.express.post(this.options.profile.path, this.updateProfile.bind(this))
        }

        if (this.options.profile.updateLocalIdentityEnabled) {
            this.app.express.post(this.options.profile.updateLocalIdentityPath, this.updateLocalClaim.bind(this))
        }
    }

    initStrategy() {
        // register strategies to passport and express
        for (const { options, strategy } of this.options.strategies) {
            if (!options.enabled) continue;

            // register to passport
            passport.use(options.name, strategy as Strategy);

            // register to express
            if (options.path) {
                let middlewares: any[] = [];

                options.authenticateOptions = options.authenticateOptions || {}
                lodash.defaults(options.authenticateOptions, {
                    passReqToCallback: true,
                    session: false
                });

                if (options instanceof OauthStrategyOptions) {
                    // oauth use oauthFn to generate the action
                    middlewares.push(this.oauthFn(options))
                } else {
                    // for regular strategy
                    middlewares.push(passport.authenticate(options.name, options.authenticateOptions))
                    middlewares.push(this.issueAccessToken.bind(this))
                }

                let httpMethod = this.app.express[options.httpMethod || "get"];
                httpMethod.apply(this.app.express, [options.path, middlewares]);
            }

            if (options instanceof OauthStrategyOptions) {
                if (options.callbackPath || options.callbackUrl) {
                    // for oauth strategy 
                    let middlewares: any[] = [];

                    lodash.defaultsDeep(options, {
                        callbackAuthenticateOptions: {
                            passReqToCallback: true,
                            session: false
                        }
                    });

                    middlewares.push(this.oauthCallbackFn(options))

                    let httpMethod = this.app.express[options.callbackHttpMethod || "get"];
                    httpMethod.apply(this.app.express, [options.callbackPath, middlewares]);
                }
            }
        }
    }

    register(req: Request, res: Response, next: NextFunction) {
        let opts = this.options.register;

        let input = req.body;

        // rename
        input.username = input[opts.usernameField];
        input.password = input[opts.passwordField];
        input.email = input[opts.emailField];

        req.userService
            .register(input)
            .then((user: IUser) => {
                // passport.login
                req.logIn(user, opts, (err) => {
                    if (opts.responseOptions && opts.responseOptions.successRedirect) {
                        res.redirect(opts.responseOptions.successRedirect)
                    } else {
                        this.issueAccessToken(req, res);
                    }
                })
            })
            .catch((error: any) => {
                FultonLog.warn("user register failed by", error)
                if (opts.responseOptions && opts.responseOptions.failureRedirect) {
                    res.redirect(opts.responseOptions.failureRedirect)
                } else {
                    if (error instanceof FultonError) {
                        next(error)
                    } else {
                        next(new FultonError(ErrorCodes.Unknown));
                    }
                }
            });
    }

    forgotPassword(req: Request, res: Response, next: NextFunction) {
        let username = req.body.username;
        let email = req.body.email;

        if (username || email) {
            // send notification
            req.userService
                .forgotPassword(username || email)
                .then((result) => {
                    res.send({
                        data: result
                    })
                }).catch(next)
        } else {
            next(new FultonError(ErrorCodes.Invalid, "the one of parameters, username or email, was missed."))
        }
    }

    verifyResetPassword(req: Request, res: Response, next: NextFunction) {
        let token = req.query.token || req.body.token;
        let code = req.query.code || req.body.code;

        if (token && code) {
            req.userService
                .verifyResetPassword(token, code)
                .then(() => {
                    res.send({
                        status: 200
                    })
                }).catch(next)
        } else {
            next(new FultonError(ErrorCodes.Invalid, "the one of parameters, token or code, was missed."))
        }
    }

    resetPassword(req: Request, res: Response, next: NextFunction) {
        let token = req.body.token;
        let code = req.body.code;

        let password = req.body.password;

        if (token && code && password) {
            req.userService
                .resetPassword(token, code, password)
                .then(() => {
                    res.send({
                        status: 200
                    })
                }).catch(next)
        } else {
            next(new FultonError(ErrorCodes.Invalid, "the one of parameters, token, code or password, was missed."))
        }
    }

    logout(req: Request, res: Response, next: NextFunction) {
        let options = req.fultonApp.options.identity.logout;

        if (req.user) {
            let all = Helper.getBoolean(req.query.all, false);

            let task: Promise<void>;

            if (all) {
                task = req.userService.revokeAllAccessTokens(req.user.id)
            } else {
                let token = req.user.currentToken;

                if (token == null) {
                    return next(new FultonError(ErrorCodes.Unknown));
                }

                task = req.userService.revokeAccessToken(req.user.id, token)
            }

            task.then(() => {
                req.logout();

                if (options.responseOptions && options.responseOptions.successRedirect) {
                    res.redirect(options.responseOptions.successRedirect)
                } else {
                    res.send({
                        status: 200
                    })
                }
            }).catch((error: any) => {
                FultonLog.warn("user logout failed by", error)
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
        } else {
            res.sendStatus(403)
        }
    }

    profile(req: Request, res: Response, next: NextFunction) {
        if (req.isAuthenticated()) {
            res.send(lodash.pick(req.user, this.options.profile.readableFields))
        } else {
            res.sendStatus(401)
        }
    }

    updateProfile(req: Request, res: Response, next: NextFunction) {
        if (req.isAuthenticated()) {
            req.userService.updateProfile(req.user.id, req.body).then(() => {
                res.send({
                    status: 200
                })
            }).catch(next)
        } else {
            res.sendStatus(401)
        }
    }

    updateLocalClaim(req: Request, res: Response, next: NextFunction) {
        if (req.isAuthenticated()) {
            req.userService.updateLocalClaim(req.user.id, req.body).then(() => {
                res.send({
                    status: 200
                })
            }).catch(next)
        } else {
            res.sendStatus(401)
        }

    }

    /**
     * the wrapper for passport.authenticate, the purpose of it is that generate callbackUrl dynamically
     * @param options 
     */
    oauthFn(options: OauthStrategyOptions): Middleware {
        return (req: Request, res: Response, next: NextFunction) => {
            this.setCallbackUrl(req, options, options.authenticateOptions)

            // if there is a user, put userId on state
            if (req.user) {
                options.authenticateOptions.state = req.user.id.toString();
            }

            passport.authenticate(options.name, options.authenticateOptions)(req, res, next);
        }
    }

    /**
     * the wrapper for passport.authenticate for oauth callback, the purpose of it is that generate callbackUrl dynamically
     * @param options 
     */
    oauthCallbackFn(options: OauthStrategyOptions): Middleware {
        return (req: Request, res: Response, next: NextFunction) => {
            let finished = (error: any, user: any, info: any) => {
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
                            this.issueAccessToken(req, res);
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
                this.setCallbackUrl(req, options, options.callbackAuthenticateOptions)

                // normal flow, providers return a code, use the code to get access_token and profile
                passport.authenticate(options.name, options.callbackAuthenticateOptions, finished)(req, res, next);
            }
        }
    }

    async issueAccessToken(req: Request, res: Response) {
        let accessToken = await req.userService.issueAccessToken(req.user);
        res.send(accessToken);
    }

    private setCallbackUrl(req: Request, options: OauthStrategyOptions, target: OauthAuthenticateOptions) {
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
}