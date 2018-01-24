import * as passport from 'passport';

import { FultonUser, Type } from '../index';
import { IStrategyOptionsWithRequest, Strategy as LocalStrategy } from 'passport-local';
import { IUser, IUserService } from './interfaces';

import { AuthenticateOptions } from './authenticate-middlewares';
import { Strategy as BearerStrategy } from 'passport-http-bearer';
import { FultonApp } from "../fulton-app";
import { fultonLoadUserMiddleware } from "./fulton-impl/fulton-middlewares";
import { getRepository } from 'typeorm';
import { isFunction } from 'util';

module.exports = async function identifyInitializer(app: FultonApp) {
    let idOptions = app.options.identify;
    if (idOptions.enabled) {
        if (idOptions.userService == null) {
            throw new Error("identify.userService can't be null when userService.enabled is true.");
        }

        let userService: IUserService<IUser>;

        if (isFunction(idOptions.userService)) {
            if (idOptions.userRepository) {
                // use specical repository
                if (isFunction(idOptions.userRepository)) {
                    app.container.bind("UserRepository").to(idOptions.userRepository as Type);
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

        // register local
        app.server.use(passport.initialize());

        if (idOptions.local.enabled) {
            let localOptions = idOptions.local;
            let localStrategyOptions: IStrategyOptionsWithRequest = {
                passReqToCallback: true,
                usernameField: localOptions.usernameField,
                passwordField: localOptions.passwordField
            }

            passport.use(new LocalStrategy(localStrategyOptions, localOptions.verify));

            let httpMethod = app.server[localOptions.httpMethod];

            let authOptions: AuthenticateOptions;

            if (app.mode == "api") {
                authOptions = {
                    session: false,
                    passReqToCallback: true
                };
            } else {
                authOptions = localOptions.webViewOptions;
            }

            httpMethod.apply(app.server,
                [localOptions.path,
                [passport.authenticate("local", authOptions),
                localOptions.response]]);
        }

        let strategies = [];
        if (idOptions.bearer.enabled) {
            passport.use(new BearerStrategy({
                scope: null,
                realm: null,
                passReqToCallback: true
            }, idOptions.bearer.verify));

            strategies.push("bearer")
        }

        if (idOptions.authenticateEveryRequest && strategies.length > 0) {
            app.server.use(fultonLoadUserMiddleware(strategies));
        }
    }
}