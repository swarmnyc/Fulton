import * as lodash from 'lodash';
import * as querystring from 'querystring';
import * as url from 'url';
import * as https from 'https';

import { AccessToken, IUser, Request } from '../../index';

import { OAuth2Client } from "google-auth-library";
import { OAuthStrategyVerify } from '../interfaces';
import { Strategy } from 'passport-strategy';
import { fultonDebug } from '../../helpers/debug';

// reference https://github.com/RiptideElements/passport-google-auth
// but it is not readly I want, so I change it a little

export interface GoogleStrategyOptions {
    clientId?: string;
    clientSecret?: string;
    callbackPath?: string;
    callbackUrl?: string;
    accessType?: string;
    scope?: string | string[];
}

export class GoogleStrategy extends Strategy {
    // only require google-auth-library when options.google.enabled = true;
    private googleAuthLibrary = require("google-auth-library");
    private jws = require("jws");

    name: string = "google";
    constructor(private options: GoogleStrategyOptions, private verify: OAuthStrategyVerify) {
        super();
    }

    authenticate(req: Request, options: GoogleStrategyOptions) {
        options = lodash.assign({}, this.options, options);

        if (!options.callbackUrl) {
            options.callbackUrl = url.resolve(`${req.protocol}://${req.get("host")}`, this.options.callbackPath);
        }

        let oauthClient: OAuth2Client = new this.googleAuthLibrary.OAuth2Client(options.clientId, options.clientSecret, options.callbackUrl);

        if (req.query && req.query.code) {
            // callback
            oauthClient.getToken(req.query.code, (err: any, token: AccessToken) => {
                if (err) {
                    return this.error(new Error('Failed to obtain access token ' + err.message));
                }

                token.provider = this.name;

                if (token.expiry_date) {
                    token.expires_at = new Date(token.expiry_date);
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

                    let payload = JSON.parse(jwt.payload);
                    profile = {
                        email: payload.email,
                        name: payload.name,
                        userImageUrl: payload.picture
                    }
                } else {
                    this.error(new Error("google token don't have id_token"));
                }

                try {
                    this.verify(req, token, profile, verified)
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