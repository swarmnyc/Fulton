import * as lodash from 'lodash';
import * as passport from 'passport';
import { IFultonApp } from '../fulton-app';
import { EventKeys } from '../keys';
import { defaultAuthenticate } from './authenticate-middlewares';
import { IIdentityRouter, IUser, IUserService } from './interfaces';
import { OauthStrategyOptions } from './options/oauth-strategy-options';
import { StrategyOptions } from './options/strategy-options';

module.exports = async function identityInitializer(app: IFultonApp) {
    let opts = app.options.identity;

    // assign userService
    app.userService = new opts.userService()
    app.express.request.constructor.prototype.userService = app.userService;
    app.userService.app = app
    app.userService.init()

    let router: IIdentityRouter;
    if (opts.router instanceof Function) {
        router = new (opts.router)();
    } else {
        router = opts.router;
    }

    app.express.use(passport.initialize());

    // first just prepare variables
    for (const settings of opts.strategies) {
        if (!settings.options.enabled) continue;

        let options = settings.options as StrategyOptions;
        let strategy = settings.strategy;

        if (strategy instanceof Function) {
            options.strategyOptions = options.strategyOptions || {}
            let overwrite
            if (options instanceof OauthStrategyOptions) {
                overwrite = {
                    clientId: options.clientId,
                    clientID: options.clientId,
                    clientSecret: options.clientSecret,
                    callbackUrl: options.callbackUrl,
                    callbackURL: options.callbackUrl,
                    scope: options.scope,
                    passReqToCallback: true
                };
            } else {
                overwrite = {
                    passReqToCallback: true
                };
            }

            lodash.defaults(options.strategyOptions, overwrite);

            if (options.verifierFn) {
                options.verifier = options.verifierFn(options);
            }

            strategy = settings.strategy = new strategy(options.strategyOptions, options.verifier);
        }

        // set app, for custom strategy
        strategy.app = app

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