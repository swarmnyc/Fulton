import { HttpMethod, Middleware } from '../../interfaces';
import { OauthAuthenticateOptions, OauthStrategyVerifier } from '../interfaces';
import { StrategyOptions } from './strategy-options';

export class OauthStrategyOptions extends StrategyOptions {
    /**
    * the default value is get
    */
    callbackHttpMethod?: HttpMethod;

    /**
     * the route path for google auth callback
     * the default value is /auth/google/callback
     */
    callbackPath?: string;

    /**
     * the callback url for redirection, for example `https://www.example.com/auth/google/callback`
     * if it is empty, fulton will combine req.originUrl + callbackPath dynamically 
     * this value is a shortcut of strategyOptions.callbackUrl and strategyOptions.callbackURL
     */
    callbackUrl?: string;

    /**
     * the clientId that provider(like google, facebook) provides to you,
     * It can be overridden by process.env["{appName}.options.identity.{name}.clientId"]
     * this value is a shortcut of strategyOptions.clientId and strategyOptions.clientID
     */
    clientId?: string;

    /**
     * the clientSecret that provider(like google, facebook) provides to you
     * It can be overridden by process.env["{appName}.options.identity.{name}.clientSecret"]
     * this value is a shortcut of strategyOptions.clientSecret
     */
    clientSecret?: string;

    /**
     * the permission scopes to request access to,
     * this value is a shortcut of strategyOptions.scope
     */
    scope?: string | string[];

    /**
     * the data to carry
     */
    state?: string;

    /**
     * verify the oauth request.
     */
    verifier?: OauthStrategyVerifier;

    /**
     * if provided, call this function to get the verifier
     */
    verifierFn?: (options: OauthStrategyOptions) => OauthStrategyVerifier;

    /**
     * transform the oauth profile to our user format
     */
    profileTransformer?: (profile: any) => any;

    /**
     * the options to pass to passport when call passport.authenticate()
     */
    authenticateOptions?: OauthAuthenticateOptions;

    /**
     * the middleware next to authenticate
     * the default value is null
     */
    callbackSuccessMiddleware?: Middleware;

    /**
    * for passport
    * the default value is {}
    */
    callbackAuthenticateOptions?: OauthAuthenticateOptions = {};

    /**
     * if provided, call this function to get the middleware, like
     * app.use(options.callbackAuthenticateFn(options))
     * 
     * otherwise use
     * app.use(passport.authenticate(options.name, options.callbackAuthenticateOptions))
     */
    callbackAuthenticateFn?: (options: OauthStrategyOptions) => Middleware
}