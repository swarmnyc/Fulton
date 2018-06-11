import * as lodash from 'lodash';
import * as passport from 'passport';
import { EventKeys } from '../keys';
import { IFultonApp } from '../fulton-app';
import { IUser, IUserService } from './interfaces';
import { Type } from '../interfaces';

type Strategy = passport.Strategy;

module.exports = async function identityInitializer(app: IFultonApp) {
    let idOptions = app.options.identity;

    let userService: IUserService<IUser>;

    if (idOptions.userService instanceof Function) {
        userService = app.container.resolve(idOptions.userService as Type);
    } else {
        userService = idOptions.userService as IUserService<IUser>;
    }

    // assign userService
    app.userService = userService;
    app.express.request.constructor.prototype.userService = userService;

    app.express.use(passport.initialize());

    // for register
    if (idOptions.register.enabled) {
        let httpMethod = app.express[idOptions.register.httpMethod];
        httpMethod.call(app.express, idOptions.register.path, idOptions.register.handler);
    }

    // for forgot password
    if (idOptions.forgotPassword.enabled) {
        app.express.post(idOptions.forgotPassword.path, idOptions.forgotPassword.handler)
    }

    // add pre-defined login strategy
    if (idOptions.login.enabled) {
        let LocalStrategy = require("passport-local").Strategy;

        idOptions.addStrategy(idOptions.login, LocalStrategy);
    }

    // add pre-defined bearer strategy
    if (idOptions.bearer.enabled) {
        let BearerStrategy = require("passport-http-bearer").Strategy;
        idOptions.addStrategy(idOptions.bearer, BearerStrategy);
    }

    // add pre-defined google strategy
    if (idOptions.google.enabled) {
        let GoogleStrategy = require('./strategies/google-strategy').GoogleStrategy
        idOptions.addStrategy(idOptions.google, GoogleStrategy)
    }

    // add pre-defined github strategy
    if (idOptions.github.enabled) {
        // require passport-github when github.enabled = true;
        let GithubStrategy = require("passport-github").Strategy;
        idOptions.addStrategy(idOptions.github, GithubStrategy)
    }

    // add pre-defined github strategy
    if (idOptions.facebook.enabled) {
        // require passport-facebook when facebook.enabled = true;
        let FacebookStrategy = require("passport-facebook").Strategy;
        idOptions.addStrategy(idOptions.facebook, FacebookStrategy)
    }

    // first just prepare variables
    for (const settings of idOptions.strategies) {
        if (!settings.options.enabled) continue;

        let options = settings.options;
        let strategy = settings.strategy;

        if (strategy instanceof Function) {
            options.strategyOptions = options.strategyOptions || {}

            lodash.defaults(options.strategyOptions, {
                clientId: options.clientId,
                clientID: options.clientId,
                clientSecret: options.clientSecret,
                callbackUrl: options.callbackUrl,
                callbackURL: options.callbackUrl,
                scope: options.scope,
                passReqToCallback: true
            });

            if (options.verifierFn) {
                options.verifier = options.verifierFn(options);
            }

            strategy = settings.strategy = new strategy(options.strategyOptions, options.verifier);
        }

        options.name = options.name || strategy.name;

        if (options.addToDefaultAuthenticateList) {
            idOptions.defaultAuthSupportStrategies.push(options.name);
        }
    }

    // make defaultAuthenticate first, so other strategies can get the current user
    if (idOptions.defaultAuthenticate && idOptions.defaultAuthSupportStrategies.length > 0) {
        app.express.use(idOptions.defaultAuthenticate);
    }

    // for logout, if have to after defaultAuthenticate in order to get the current user
    if (idOptions.logout.enabled) {
        app.express.get(idOptions.logout.path, idOptions.logout.handler)
        app.express.post(idOptions.logout.path, idOptions.logout.handler)
    }

    // register strategies to passport and express
    for (const { options, strategy } of idOptions.strategies) {
        if (!options.enabled) continue;

        // register to passport
        passport.use(options.name, strategy as Strategy);

        // register to express
        if (options.path) {
            // for regular strategy
            let middlewares: any[] = [];

            options.authenticateOptions = options.authenticateOptions || {}
            lodash.defaults(options.authenticateOptions, {
                passReqToCallback: true,
                session: false
            });

            if (options.authenticateFn) {
                middlewares.push(options.authenticateFn(options))
            } else {
                middlewares.push(passport.authenticate(options.name, options.authenticateOptions))
            }

            if (options.successMiddleware) {
                middlewares.push(options.successMiddleware);
            }

            let httpMethod = app.express[options.httpMethod || "get"];
            httpMethod.apply(app.express, [options.path, middlewares]);
        }

        if (options.callbackPath || options.callbackUrl) {
            // for oauth strategy 
            let args: any[] = [];

            lodash.defaultsDeep(options, {
                callbackAuthenticateOptions: {
                    passReqToCallback: true,
                    session: false
                }
            });

            if (options.callbackAuthenticateFn) {
                args.push(options.callbackAuthenticateFn(options))
            } else {
                args.push(passport.authenticate(options.name, options.callbackAuthenticateOptions))
            }

            if (options.callbackSuccessMiddleware) {
                args.push(options.callbackSuccessMiddleware);
            }

            let httpMethod = app.express[options.callbackHttpMethod || "get"];
            httpMethod.apply(app.express, [options.callbackPath, args]);
        }
    }

    app.events.emit(EventKeys.AppDidInitIdentity, this);
}