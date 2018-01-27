import * as passport from 'passport';

import { FultonUser, Type } from '../index';
import { IStrategyOptionsWithRequest, Strategy as LocalStrategy } from 'passport-local';
import { Strategy } from 'passport';
import { IUser, IUserService } from './interfaces';

import { AuthenticateOptions } from './authenticate-middlewares';
import { Strategy as BearerStrategy } from 'passport-http-bearer';
import { FultonApp } from "../fulton-app";
import { getRepository } from 'typeorm';
import { GoogleStrategy } from './strategies/google-strategy';

module.exports = async function identityInitializer(app: FultonApp) {
    let idOptions = app.options.identity;
    if (idOptions.enabled) {
        if (idOptions.userService == null) {
            throw new Error("identity.userService can't be null when userService.enabled is true.");
        }

        let userService: IUserService<IUser>;

        if (idOptions.userService instanceof Function) {
            if (idOptions.userRepository) {
                // use specical repository
                if (idOptions.userRepository instanceof Function) {
                    app.container.bind("UserRepository").to(idOptions.userRepository);
                } else {
                    app.container.bind("UserRepository").toConstantValue(idOptions.userRepository);
                }
            } else {
                // use typeorm repository
                let userRepository = getRepository(idOptions.userType);

                app.container.bind("UserRepository").toConstantValue(userRepository);
            }

            userService = app.container.resolve(idOptions.userService as Type);
        } else {
            userService = idOptions.userService as IUserService<IUser>;
        }

        // register userService
        app.server.request.constructor.prototype.userService = userService;

        app.server.use(passport.initialize());

        // for register
        if (idOptions.register.enabled) {
            let registerOptions = idOptions.register;
            let httpMethod = app.server[registerOptions.httpMethod];
            httpMethod.call(app.server, registerOptions.path, registerOptions.handler);
        }

        // for login
        if (idOptions.login.enabled) {
            let opts = idOptions.login;

            idOptions.addStrategy({
                httpMethod: opts.httpMethod,
                path: opts.path,
                verifier: opts.verifier,
                successMiddleware: opts.successMiddleware,
                strageyOptions: {
                    usernameField: opts.usernameField,
                    passwordField: opts.passwordField
                },
                authenticateOptions: opts.authenticateOptions
            }, LocalStrategy);
        }

        // for bearer
        if (idOptions.bearer.enabled) {
            let opts = idOptions.bearer;

            idOptions.addStrategy({
                addToDefaultAuthenticateList: true,
                verifier: opts.verifier
            }, BearerStrategy);
        }

        if (idOptions.google.enabled) {
            passport.use(new GoogleStrategy(idOptions.google, idOptions.google.verifier));

            let authOptions: AuthenticateOptions;

            if (app.mode == "api") {
                authOptions = {
                    session: false,
                    passReqToCallback: true
                };
            } else {
                authOptions = idOptions.google.authenticateOptions;
            }

            app.server.get(idOptions.google.path, passport.authenticate('google'));
            app.server.get(idOptions.google.callbackPath, idOptions.google.successMiddleware);
        }

        if (idOptions.google.enabled) {
            let opts = idOptions.google;

            opts.strageyOptions = opts.strageyOptions || {
                clientId: opts.clientId,
                clientSecret: opts.clientSecret,
                callbackPath: opts.callbackPath,
                callbackUrl: opts.callbackUrl,
                accessType: opts.accessType,
                scope: opts.scope,
            };

            idOptions.addStrategy(
                opts,
                GoogleStrategy
            )
        }

        for (const { options, strategy } of idOptions.strategies) {
            if (!options.enabled) continue;

            let instance: Strategy;

            if (strategy instanceof Function) {
                let opts = options.strategyOptions || {};
                opts.passReqToCallback = opts.passReqToCallback == null ? true : opts.passReqToCallback;

                instance = new strategy(opts, options.verifier);
            } else {
                instance = strategy
            }

            options.name = options.name || instance.name;

            passport.use(options.name, instance);

            // for regular strategy
            if (options.path) {
                let args: any[] = [];

                let opts = options.authenticateOptions || {};
                opts.passReqToCallback = opts.passReqToCallback == null ? true : opts.passReqToCallback;
                opts.session = opts.session == null ? false : opts.session;

                if (options.authenticateFn) {
                    args.push(options.authenticateFn(options))
                } else {
                    args.push(passport.authenticate(options.name, opts))
                }

                if (options.successMiddleware) {
                    args.push(options.successMiddleware);
                }

                let httpMethod = app.server[options.httpMethod || "get"];
                httpMethod.apply(app.server, [options.path, args]);
            }

            // for oauth strategy
            if (options.callbackPath) {
                let args: any[] = [];

                let opts = options.callbackAuthenticateOptions || {};
                opts.passReqToCallback = opts.passReqToCallback == null ? true : opts.passReqToCallback;
                opts.session = opts.session == null ? false : opts.session;

                if (options.callbackAuthenticateFn) {
                    args.push(options.callbackAuthenticateFn(options))
                } else {
                    args.push(passport.authenticate(options.name, opts))
                }

                if (options.callbackSuccessMiddleware) {
                    args.push(options.callbackSuccessMiddleware);
                }

                let httpMethod = app.server[options.callbackHttpMethod || "get"];
                httpMethod.apply(app.server, [options.callbackPath, args]);
            }

            if (options.addToDefaultAuthenticateList) {
                idOptions.defaultAuthSupportStrategies.push(options.name);
            }
        }

        if (idOptions.defaultAuthenticate && idOptions.defaultAuthSupportStrategies.length > 0) {
            app.server.use(idOptions.defaultAuthenticate);
        }
    }
}