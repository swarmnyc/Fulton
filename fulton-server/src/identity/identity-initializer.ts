import * as lodash from 'lodash';
import * as passport from 'passport';
import { EventKeys } from '../keys';
import { IFultonApp } from '../fulton-app';
import { IUser, IUserService, IIdentityRouter, StrategyVerifyDone, OauthStrategyVerifier, AccessToken } from './interfaces';
import { Request, Response, NextFunction } from '../interfaces';
import { FultonLog } from '../fulton-log';
import { OauthStrategyOptions } from './options/oauth-strategy-options';
import { StrategyOptions } from './options/strategy-options';

module.exports = async function identityInitializer(app: IFultonApp) {
    let opts = app.options.identity;

    let userService: IUserService<IUser>;

    if (opts.userService instanceof Function) {
        userService = new (opts.userService)();
    } else {
        userService = opts.userService;
    }

    userService.init(app)

    // assign userService
    app.userService = userService;
    app.express.request.constructor.prototype.userService = userService;

    let router: IIdentityRouter;
    if (opts.router instanceof Function) {
        router = new (opts.router)();
    } else {
        router = opts.router;
    }

    app.express.use(passport.initialize());

    // init passport Strategies
    // add pre-defined login strategy
    if (opts.login.enabled) {
        if (opts.login.verifier == null) {
            opts.login.verifier = defaultLoginStrategyVerifier
        }

        opts.addStrategy(opts.login, require("passport-local").Strategy);
    }

    // add pre-defined bearer strategy
    if (opts.bearer.enabled) {
        if (opts.bearer.verifier == null) {
            opts.bearer.verifier = defaultBearerStrategyVerifier
        }

        opts.addStrategy(opts.bearer, require("passport-http-bearer").Strategy);
    }

    // add pre-defined google strategy
    if (opts.google.enabled) {
        opts.addStrategy(opts.google, require('./strategies/google-strategy').GoogleStrategy)
    }

    // add pre-defined github strategy
    if (opts.github.enabled) {
        opts.addStrategy(opts.github, require("passport-github").Strategy)
    }

    // add pre-defined github strategy
    if (opts.facebook.enabled) {
        opts.addStrategy(opts.facebook, require("passport-facebook").Strategy)
    }

    // first just prepare variables
    for (const settings of opts.strategies) {
        if (!settings.options.enabled) continue;

        let options = settings.options as StrategyOptions;
        let strategy = settings.strategy;

        if (strategy instanceof Function) {
            options.strategyOptions = options.strategyOptions || {}

            if (options instanceof OauthStrategyOptions) {
                lodash.defaults(options.strategyOptions, {
                    clientId: options.clientId,
                    clientID: options.clientId,
                    clientSecret: options.clientSecret,
                    callbackUrl: options.callbackUrl,
                    callbackURL: options.callbackUrl,
                    scope: options.scope,
                    passReqToCallback: true
                });

                if (options.verifier == null) {
                    let fn = options.verifierFn || defaultOauthStrategyVerifierFn

                    options.verifier = fn(options);
                }
            } else {
                lodash.defaults(options.strategyOptions, {
                    passReqToCallback: true
                });
            }

            strategy = settings.strategy = new strategy(options.strategyOptions, options.verifier);
        }

        options.name = options.name || strategy.name;

        if (options.addToDefaultAuthenticateList) {
            opts.defaultAuthSupportStrategies.push(options.name);
        }
    }

    // make defaultAuthenticate first, so other middleware can get the current user
    if (opts.defaultAuthSupportStrategies.length > 0) {
        app.express.use(opts.defaultAuthenticate || defaultAuthenticate);
    }

    router.init(app, opts)

    app.events.emit(EventKeys.AppDidInitIdentity, this);
}

function defaultAuthenticate(req: Request, res: Response, next: NextFunction) {
    // authenticate every request to get user info.
    let fn = passport.authenticate(req.fultonApp.options.identity.defaultAuthSupportStrategies, function (error, user, _) {
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

    });

    fn(req, res, next);
}

function defaultLoginStrategyVerifier(req: Request, username: string, password: string, done: StrategyVerifyDone) {
    req.userService
        .login(username, password)
        .then((user: IUser) => {
            done(null, user);
        }).catch((error: any) => {
            FultonLog.warn("login failed by", error)
            done(error);
        });
}

/**
 * for TokenStrategyVerify like bearer
 */
async function defaultBearerStrategyVerifier(req: Request, token: string, done: StrategyVerifyDone) {
    try {
        let user = await req.userService.loginByAccessToken(token);

        if (user) {
            user.currentToken = token

            return done(null, user);
        } else {
            return done(null, false);
        }
    } catch (error) {
        FultonLog.warn("loginByAccessToken failed by", error)
        return done(null, false);
    }
}

/**
 * the wrapper of auth verifier, the purpose of it is to call req.userService.loginByOauth with the formated parameters.
 */
function defaultOauthStrategyVerifierFn(options: OauthStrategyOptions): OauthStrategyVerifier {
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
}