import { Env } from '../../helpers';
import { BaseOptions } from '../../options/options';
import { FultonIdentityImpl } from '../fulton-impl/fulton-impl';
import { OauthStrategyOptions } from './oauth-strategy-options';
import { IFultonUser } from '../interfaces';
import * as lodash from 'lodash';

/**
 * pre-defined facebook strategy
 * path is `/auth/facebook`
 * callback is `/auth/facebook/callback`
 * scope is empty
 * profileFields is ['id', 'displayName', 'photos', 'email']
 * 
 * ## Require "passport-facebook" package ##
 * run `npm install passport-facebook` to install it
 * 
 * clientId can be overridden by env["{appName}.options.identity.facebook.clientId"]
 * clientSecret can be overridden by env["{appName}.options.identity.facebook.clientSecret"]
 */
export class FacebookStrategyOptions extends OauthStrategyOptions {
    /**
     * the default value is ['id', 'displayName', 'photos', 'email']
     * this value is a shortcut of strategyOptions.profileFields
     */
    profileFields?: string[];

    constructor(protected appName?: string, protected appMode?: string, protected type?: string) {
        super(appName, appMode);

        this.path = "/auth/facebook";
        this.callbackPath = "/auth/facebook/callback";
        this.scope = "read:user user:email";
        this.profileFields = ['id', 'displayName', "photos", 'email']

        this.verifierFn = FultonIdentityImpl.oauthVerifierFn;
        this.authenticateFn = FultonIdentityImpl.oauthAuthenticateFn;
        this.callbackAuthenticateFn = FultonIdentityImpl.oauthCallbackAuthenticateFn;

        this.profileTransformer = (profile: any) => {
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
    }

    init?(): void {
        this.enabled = Env.getBoolean(`${this.appName}.options.identity.facebook.enabled`, this.enabled);
        this.clientId = Env.get(`${this.appName}.options.identity.facebook.clientId`, this.clientId)
        this.clientSecret = Env.get(`${this.appName}.options.identity.facebook.clientSecret`, this.clientSecret)

        lodash.defaults(this.strategyOptions, {
            profileFields: this.profileFields
        })
    }
}