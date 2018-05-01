import * as lodash from 'lodash';
import * as passport from 'passport';
import { DiKeys } from '../keys';
import { FultonApp } from '../fulton-app';
import { getRepository } from 'typeorm';
import { GoogleStrategy } from './strategies/google-strategy';
import { Helper } from '../helpers/helper';
import { IFultonUser, IUser, IUserService } from './interfaces';
import { IStrategyOptionsWithRequest, Strategy as LocalStrategy } from 'passport-local';
import { Strategy as BearerStrategy } from 'passport-http-bearer';
import { Strategy } from 'passport';
import { Type } from '../interfaces';

module.exports = async function identityInitializer(app: FultonApp) {
    let idOptions = app.options.identity;
    if (idOptions.enabled) {
        if (idOptions.userService == null) {
            throw new Error("identity.userService can't be null when userService.enabled is true.");
        }

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
            let registerOptions = idOptions.register;
            let httpMethod = app.express[registerOptions.httpMethod];
            httpMethod.call(app.express, registerOptions.path, registerOptions.handler);
        }

        // add pre-defined login strategy
        if (idOptions.login.enabled) {
            let opts = idOptions.login;

            idOptions.addStrategy({
                httpMethod: opts.httpMethod,
                path: opts.path,
                verifier: opts.verifier,
                successMiddleware: opts.successMiddleware,
                strategyOptions: {
                    usernameField: opts.usernameField,
                    passwordField: opts.passwordField
                },
                authenticateOptions: opts.authenticateOptions
            }, LocalStrategy);
        }

        // add pre-defined bearer strategy
        if (idOptions.bearer.enabled) {
            let opts = idOptions.bearer;

            idOptions.addStrategy({
                addToDefaultAuthenticateList: true,
                verifier: opts.verifier
            }, BearerStrategy);
        }

        // add pre-defined google strategy
        if (idOptions.google.enabled) {
            let opts = idOptions.google;

            lodash.defaultsDeep(opts, {
                strategyOptions: {
                    accessType: opts.accessType
                }
            });

            idOptions.addStrategy(
                idOptions.google,
                GoogleStrategy
            )
        }

        // add pre-defined github strategy
        if (idOptions.github.enabled) {
            let opts = idOptions.github;

            lodash.defaultsDeep(opts, {
                profileTransformer: (profile: any) => {
                    let email;
                    if (profile.emails instanceof Array) {
                        email = profile.emails.find((e: any) => e.primary || e.primary == null).value;
                    } else {
                        email = profile.email;
                    }

                    let user: IFultonUser = {
                        id: profile.id,
                        email: email,
                        username: profile.displayName,
                        portraitUrl: profile._json.avatar_url
                    };

                    return user;
                }
            });

            // require passport-github when github.enabled = true;
            let githubStrategy = require("passport-github").Strategy;
            idOptions.addStrategy(
                opts,
                githubStrategy
            )
        }

        // add pre-defined github strategy
        if (idOptions.facebook.enabled) {
            let opts = idOptions.facebook;

            lodash.defaultsDeep(opts, {
                strategyOptions: {
                    profileFields: opts.profileFields
                },
                profileTransformer: (profile: any) => {
                    let email;
                    if (profile.emails instanceof Array && profile.emails.length > 0) {
                        email = profile.emails[0].value
                    } else {
                        email = profile.email;
                    }

                    let portraitUrl;
                    if (profile.photos instanceof Array && profile.photos.length > 0) {
                        portraitUrl = profile.photos[0].value
                    }

                    let user: IFultonUser = {
                        id: profile.id,
                        email: email,
                        username: profile.displayName,
                        portraitUrl: portraitUrl
                    };

                    return user;
                }
            });

            // require passport-facebook when facebook.enabled = true;
            let facebookStrategy = require("passport-facebook").Strategy;
            idOptions.addStrategy(
                opts,
                facebookStrategy
            )
        }

        // first just prepare variables
        for (const settings of idOptions.strategies) {
            if (!settings.options.enabled) continue;

            let options = settings.options;
            let strategy = settings.strategy;

            if (strategy instanceof Function) {
                lodash.defaultsDeep(options, {
                    strategyOptions: {
                        clientId: options.clientId,
                        clientID: options.clientId,
                        clientSecret: options.clientSecret,
                        callbackUrl: options.callbackUrl,
                        callbackURL: options.callbackUrl,
                        scope: options.scope,
                        passReqToCallback: true
                    }
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

        // register strategies to passport and express
        for (const { options, strategy } of idOptions.strategies) {
            if (!options.enabled) continue;

            // register to passport
            passport.use(options.name, strategy as Strategy);

            // register to express
            if (options.path) {
                // for regular strategy
                let args: any[] = [];

                lodash.defaultsDeep(options, {
                    authenticateOptions: {
                        passReqToCallback: true,
                        session: false
                    }
                });

                if (options.authenticateFn) {
                    args.push(options.authenticateFn(options))
                } else {
                    args.push(passport.authenticate(options.name, options.authenticateOptions))
                }

                if (options.successMiddleware) {
                    args.push(options.successMiddleware);
                }

                let httpMethod = app.express[options.httpMethod || "get"];
                httpMethod.apply(app.express, [options.path, args]);
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
    }
}