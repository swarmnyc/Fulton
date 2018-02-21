import * as https from 'https';
import * as lodash from 'lodash';
import * as querystring from 'querystring';
import * as url from 'url';

import { AccessToken, GoogleStrategyOptions, IUser, OAuthStrategyVerifier } from '../interfaces';

import { OAuth2Client } from "google-auth-library";
import { Request } from '../../interfaces';
import { Strategy } from 'passport-strategy';
import { fultonDebug } from '../../helpers/debug';

export class GoogleStrategy extends Strategy {
    // only require google-auth-library when options.google.enabled = true;
    private googleAuthLibrary = require("google-auth-library");
    private jws = require("jws");

    name: string = "google";
    constructor(private options: GoogleStrategyOptions, private verify: OAuthStrategyVerifier) {
        super();
    }

    authenticate(req: Request, options: GoogleStrategyOptions) {
        options = lodash.defaults(options, this.options);

        if (!options.clientId) return this.error(new Error("clientId is required for GoogleStrategy"))
        if (!options.clientSecret) return this.error(new Error("clientSecret is required for GoogleStrategy"))
        if (!options.callbackUrl) return this.error(new Error("clientUrl or clientPath is required for GoogleStrategy"))

        let oauthClient: OAuth2Client = new this.googleAuthLibrary.OAuth2Client(options.clientId, options.clientSecret, options.callbackUrl);

        if (req.query && req.query.code) {
            // callback
            oauthClient.getToken(req.query.code, (err: any, token: AccessToken) => {
                if (err) {
                    return this.error(new Error('Failed to obtain access token ' + err.message));
                }

                fultonDebug("google token: %O", token);

                let verified = (err: any, user: IUser, info: any) => {
                    if (err) {
                        return this.error(err);
                    }

                    if (!user) {
                        return this.fail(info);
                    }

                    this.success(user, info);
                }

                let profile;

                if (token.id_token) {
                    let jwt = this.jws.decode(token.id_token);

                    fultonDebug("google id_token", jwt);

                    let payload = jwt.payload;
                    if (typeof payload == "string"){
                        payload = JSON.parse(payload);
                    }

                    profile = {
                        email: payload.email,
                        username: payload.email,
                        dispalyName: payload.name,
                        portraitUrl: payload.picture
                    }
                } else {
                    this.error(new Error("google token don't have id_token"));
                }

                try {
                    this.verify(req, token.access_token, token.refresh_token, profile, verified)
                } catch (error) {
                    this.error(error);
                }

            });
        } else {
            // redirect
            let redirectUrl = oauthClient.generateAuthUrl({
                access_type: options.accessType,
                scope: options.scope
            });

            fultonDebug("google redirect url: %s", redirectUrl);

            return this.redirect(redirectUrl);
        }
    }
}