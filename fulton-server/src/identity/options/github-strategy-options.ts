import { Env } from '../../helpers';
import { BaseOptions } from '../../options/options';
import { OauthStrategyOptions } from './oauth-strategy-options';
import { IFultonUser } from '../interfaces';

/**
 * pre-defined github strategy
 * path is `/auth/github`
 * callback is `/auth/github/callback`
 * scope is `profile email`
 * 
 * ## Require "passport-github" package ##
 * run `npm install passport-github` to install it
 * 
 * clientId can be overridden by env["{appName}.options.identity.github.clientId"]
 * clientSecret can be overridden by env["{appName}.options.identity.github.clientSecret"]
 */
export class GithubStrategyOptions extends OauthStrategyOptions {
    constructor(protected appName?: string, protected appMode?: string, protected type?: string) {
        super(appName, appMode);

        this.path = "/auth/github";
        this.callbackPath = "/auth/github/callback";
        this.scope = "read:user user:email";

        this.profileTransformer = (profile) => {
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
        };
    }

    init?(): void {
        this.enabled = Env.getBoolean(`${this.appName}.options.identity.github.enabled`, this.enabled);
        this.clientId = Env.get(`${this.appName}.options.identity.github.clientId`, this.clientId)
        this.clientSecret = Env.get(`${this.appName}.options.identity.github.clientSecret`, this.clientSecret)
    }
}