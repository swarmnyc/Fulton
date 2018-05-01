import * as passport from 'passport';
import { Request, PathIdentifier, Middleware, Type, HttpMethod } from "../interfaces";

export type Strategy = passport.Strategy;
export type AuthenticateOptions = passport.AuthenticateOptions;

export interface IUser {
    [key: string]: any;
}

export interface IOauthProfile {
    id?: string;
    email: string;
    username?: string;
    portraitUrl?: string;
    [key: string]: any;
}

export interface RegisterModel {
    email?: string;
    username?: string;
    password?: string;
    [key: string]: any;
}

export interface IFultonUser extends IUser {
    id?: string;
    username?: string;
    portraitUrl?: string;
    emails?: string[];
    roles?: string[];
    registeredAt?: Date
}

export interface IUserService<T extends IUser> {
    currentUser: IUser;
    login(username: string, password: string): Promise<T>;
    /**
     * There are 3 scenarios
     * 1. userId is provided, add the oauth info to his identity
     * 2. userId is not provided, add it is new oauth user, create a new user then, add the oauth info to his identity
     * 3. userId is not provided, add it is existed oauth user, update the oauth info
     */
    loginByOauth(userId:string, token: AccessToken, profile: IOauthProfile): Promise<T>;
    loginByAccessToken(token: string): Promise<T>;
    register(input: RegisterModel): Promise<T>;
    issueAccessToken(user: T): Promise<AccessToken>;
    refreshAccessToken(token: string): Promise<AccessToken>;
    //revokeAccessToken(user: T): Promise<any>;
    //revokeAccessTokens(user: T): Promise<any>;
}

export interface AccessToken {
    access_token?: string;
    token_type?: string;
    expires_in?: number;
    refresh_token?: string;
    scope?: string;
    provider?: string;
    [key: string]: any;
}

export interface StrategyOptions {
    /**
     * strategy name, if undefined, use Strategy.Name
     */
    name?: string;

    /**
     * the default value is get
     */
    httpMethod?: HttpMethod;

    /**
     * the default value is false,
     */
    enabled?: boolean;

    /**
     * the route path for example /auth/google
     */
    path?: PathIdentifier;

    /**
    * for passport, use it when create new Strategy object, like
    * new LocalStrategy(options.strategyOptions, options.verifier)
    * the default value is null
    */
    strategyOptions?: { [key: string]: any };

    /**
     * verify the oauth request.
     */
    verifier?: StrategyVerifier | LocalStrategyVerifier | any;

    /**
     * the middleware next to authenticate
     * the default value is null
     */
    successMiddleware?: Middleware;

    /**
    * for passport
    * the default value is null
    */
    authenticateOptions?: AuthenticateOptions;

    /**
      * if provided,call this function to get the middleware, like
     * app.use(options.authenticateFn(options))
     * 
     * otherwise use
     * app.use(passport.authenticate(options.name, options.authenticateOptions))
     */
    authenticateFn?: (options: OAuthStrategyOptions) => Middleware

    /**
     * if true, add to defaultAuthenticate support list. which means this strategy will be called by every incoming requests.
     * the default value is false.
     */
    addToDefaultAuthenticateList?: boolean;
}

export interface OAuthStrategyOptions extends StrategyOptions {
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
    verifier?: OAuthStrategyVerifier;

    /**
     * if provided, call this function to get the verifier
     */
    verifierFn?: (options: OAuthStrategyOptions) => OAuthStrategyVerifier;

    /**
     * transform the oauth profile to our user format
     */
    profileTransformer?: (profile: any) => any;

    /**
    * for passport
    * the default value is null
    */
    authenticateOptions?: OauthAuthenticateOptions;

    /**
     * the middleware next to authenticate
     * the default value is null
     */
    callbackSuccessMiddleware?: Middleware;

    /**
    * for passport
    * the default value is null
    */
    callbackAuthenticateOptions?: OauthAuthenticateOptions;

    /**
     * if provided, call this function to get the middleware, like
     * app.use(options.callbackAuthenticateFn(options))
     * 
     * otherwise use
     * app.use(passport.authenticate(options.name, options.callbackAuthenticateOptions))
     */
    callbackAuthenticateFn?: (options: OAuthStrategyOptions) => Middleware
}

export interface GoogleStrategyOptions extends OAuthStrategyOptions {
    /**
     * Can be `online` (default) or `offline` (gets refresh_token)
     * this value is a shortcut of strategyOptions.accessType
     */
    accessType?: "online" | "offline";
}

export interface FacebookStrategyOptions extends OAuthStrategyOptions {
    /**
     * the default value is ['id', 'displayName', 'profileUrl', 'email']
     * this value is a shortcut of strategyOptions.profileFields
     */
    profileFields?: string[];
}

export interface OauthAuthenticateOptions extends AuthenticateOptions {
    /**
     * the callback url for redirection, for example `https://www.example.com/auth/google/callback`
     * if it is identity.{name}.callbackUrl is empty, fultion will generate the value by combining req.originUrl + callbackPath
     * so don't set this value manually
     */
    callbackUrl?: string;
    callbackURL?: string;
    /**
     * the data to carry
     */
    state?: string;
}

export interface CustomStrategySettings {
    options: OAuthStrategyOptions;
    /**
     * Custom passport-strategy
     */
    strategy: Strategy | Type<Strategy>;
}

export interface StrategyVerifyDone {
    (error: any, user?: any, info?: any): void
}

export interface StrategyVerifier {
    (req: Request, ...args: any[]): void;
    (req: Request, done: StrategyVerifyDone): void;
}

export interface LocalStrategyVerifier {
    (req: Request, username: string, password: string, done: StrategyVerifyDone): void;
}

export interface TokenStrategyVerifier {
    (req: Request, accessToken: string, done: StrategyVerifyDone): void;
}

export interface OAuthStrategyVerifier {
    (req: Request, access_token: string, refresh_token: string, profile: any, done: StrategyVerifyDone): void;
}
