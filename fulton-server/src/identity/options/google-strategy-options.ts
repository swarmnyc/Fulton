import { Env } from '../../helpers';
import { BaseOptions } from '../../options/options';
import { FultonIdentityImpl } from '../fulton-impl/fulton-impl';
import { OauthStrategyOptions } from './oauth-strategy-options';
import * as lodash from 'lodash';

/**
 * pre-defined google strategy
 * path is `/auth/google`
 * callback is `/auth/google/callback`
 * scope is `profile email`
 * accessType is `online`
 * 
 * ## Require "google-auth-library" package ##
 * run `npm install google-auth-library` to install it
 * 
 * clientId can be overridden by env["{appName}.options.identity.google.clientId"]
 * clientSecret can be overridden by env["{appName}.options.identity.google.clientSecret"]
 */
export class GoogleStrategyOptions extends OauthStrategyOptions {
    /**
     * Can be `online` (default) or `offline` (gets refresh_token)
     * this value is a shortcut of strategyOptions.accessType
     */
    accessType?: "online" | "offline";

    constructor(protected appName?: string, protected appMode?: string, protected type?: string) {
        super(appName, appMode);

        this.path = "/auth/google";
        this.callbackPath = "/auth/google/callback";
        this.accessType = "online";
        this.scope = "profile email";

        this.verifierFn = FultonIdentityImpl.oauthVerifierFn;
        this.authenticateFn = FultonIdentityImpl.oauthAuthenticateFn;
        this.callbackAuthenticateFn = FultonIdentityImpl.oauthCallbackAuthenticateFn;
    }

    init?(): void {
        this.enabled = Env.getBoolean(`${this.appName}.options.identity.google.enabled`, this.enabled);
        this.clientId = Env.get(`${this.appName}.options.identity.google.clientId`, this.clientId)
        this.clientSecret = Env.get(`${this.appName}.options.identity.google.clientSecret`, this.clientSecret)

        lodash.defaults(this.strategyOptions, {
            accessType: this.accessType
        })
    }
}