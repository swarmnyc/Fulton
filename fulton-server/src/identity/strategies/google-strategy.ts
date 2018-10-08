import { OAuth2Client } from 'google-auth-library';
import { Strategy } from 'passport-strategy';
import { fultonDebug } from '../../helpers/debug';
import { Request } from '../../interfaces';
import { AccessToken, IOauthProfile, IUser, OauthStrategyVerifier } from '../interfaces';
import { GoogleStrategyOptions } from '../options/google-strategy-options';

export class GoogleStrategy extends Strategy {
    // only require google-auth-library when options.google.enabled = true;
    private googleAuthLibrary = require("google-auth-library");
    private jws = require("jws");

    name: string = "google";
    constructor(private options: GoogleStrategyOptions, private verify: OauthStrategyVerifier) {
        super();
    }

    authenticate(req: Request, options: GoogleStrategyOptions) {
        options = Object.assign({}, this.options, options);

        if (!options.clientId) return this.error(new Error("clientId is required for GoogleStrategy"))
        if (!options.clientSecret) return this.error(new Error("clientSecret is required for GoogleStrategy"))

        let oauthClient: OAuth2Client = new this.googleAuthLibrary.OAuth2Client(options.clientId, options.clientSecret, options.callbackUrl);

        if (req.query && req.query.code) {
            // callback
            oauthClient.getToken(req.query.code, (err: any, token: AccessToken) => {
                if (err) {
                    return this.error(new Error('Failed to obtain access token by' + err.message));
                }

                fultonDebug("google", "google token: %O\t", token);

                let verified = (err: any, user: IUser, info: any) => {
                    if (err) {
                        return this.error(err);
                    }

                    if (!user) {
                        return this.fail(info);
                    }

                    this.success(user, info);
                }

                let profile: IOauthProfile;

                if (token.id_token) {
                    let jwt = this.jws.decode(token.id_token);

                    fultonDebug("google", "google id_token : ", jwt);

                    let payload = jwt.payload;
                    if (typeof payload == "string") {
                        payload = JSON.parse(payload);
                    }

                    profile = {
                        id: payload.sub,
                        email: payload.email,
                        username: payload.name,
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
                scope: options.scope,
                state: options.state
            });

            fultonDebug("google", "google redirect url: %s", redirectUrl);

            return this.redirect(redirectUrl);
        }
    }
}