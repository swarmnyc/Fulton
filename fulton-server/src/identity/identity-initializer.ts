import * as lodash from 'lodash';
import * as passport from 'passport';
import { IFultonApp } from '../fulton-app';
import { EventKeys } from '../keys';
import { defaultAuthenticate } from './authenticate-middlewares';
import { defaultBearerStrategyVerifier, defaultLoginStrategyVerifier, defaultOauthStrategyVerifierFn } from './identity-defaults';
import { IIdentityRouter, IUser, IUserService } from './interfaces';
import { OauthStrategyOptions } from './options/oauth-strategy-options';
import { StrategyOptions } from './options/strategy-options';

module.exports = async function identityInitializer(app: IFultonApp) {
    let opts = app.options.identity;

    // assign userService
    app.userService = opts.userService as IUserService<IUser>
    app.express.request.constructor.prototype.userService = app.userService;

    app.userService.init(app)

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

        // set app, for custom strategy
        (<any>strategy).app = app

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