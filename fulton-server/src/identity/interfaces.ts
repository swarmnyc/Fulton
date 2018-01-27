import { Request, PathIdentifier, Middleware } from "../interfaces";
import { Strategy, AuthenticateOptions } from "passport";
import { Type, HttpMethod } from "../index";

export interface IUser {
    [key: string]: any;
}

export interface IUserRegister extends IUser {
    email?: string;
    username?: string;
    password?: string;
    oauthToken?: AccessToken;
}

export interface IFultonUser extends IUser {
    id?: string;
    email?: string;
    username?: string;
    hashedPassword?: string;
    accessTokens: FultonAccessToken[];
    roles: string[];
}

export interface FultonUserOauth {
    provider?: string;
    userId?: string;
    accessToken?: string;
    refreshToken?: string;
    issuredAt?: Date;
    expiredAt?: Date;
}

export interface FultonAccessToken {
    token?: string;
    issuredAt?: Date;
    expiredAt?: Date;
    revoked?: boolean;
}

export interface IUserService<T extends IUser> {
    currentUser: IUser;
    login(username: string, password: string): Promise<T>;
    loginByOauth(token: AccessToken, profile: any): Promise<T>;
    findByAccessToken(token: string): Promise<T>;
    register(user: IUserRegister): Promise<T>;
    issueAccessToken(user: T): Promise<AccessToken>;
    refreshAccessToken(token: string): Promise<AccessToken>;
}

export interface AccessToken {
    access_token?: string;
    token_type?: string;
    expires_in?: number;
    refresh_token?: string;
    scope?: string;
    provider?: string;
    expiry_date?: number;
    expires_at?: Date;
    [key: string]: any;
}


export interface StrategyResponseOptions {
    /**
     * default is true
     */
    session?: boolean,

    /**
     * the default value is /
     */
    successRedirect?: string;

    /**
     * the default value is /auth/login
     */
    failureRedirect?: string;

    /**
     * the default value is false
     */
    failureFlash?: string | boolean;

    /**
     * the default value is Login Failed
     */
    failureMessage?: string;
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
    * new LocalStrategy(options.strageyOptions, options.verifier)
    * the default value is null
    */
    strageyOptions?: any;

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

    [key: string]: any;
}

export interface OAuthStrategyOptions extends StrategyOptions {
     /**
     * the default value is get
     */
    callbackHttpMethod?: HttpMethod;

    /**
     * the route path for google auth callback
     * the default value is /auth/google/callback
     * It can be overrided by procces.env["{appName}.options.identity.google.callbackPath"]
     */
    callbackPath?: string;

    /**
     * the callback url google will redirect to, for example `https://www.example.com/auth/google/callback`
     * if it is empty, fulton will combine req.originUrl + options.callbackPath
     */
    callbackUrl?: string;

    /**
     * the clientId that google provides to you
     */
    clientId?: string;

    /**
     * the clientId
     */
    clientSecret?: string;

    /**
     * the permission scopes to request access to,
     */
    scope?: string | string[];

    /**
     * verify the oauth request.
     */
    verifier?: OAuthStrategyVerifier;

    /**
     * the middleware next to authenticate
     * the default value is null
     */
    callbackSuccessMiddleware?: Middleware;

    /**
    * for passport
    * the default value is null
    */
    callbackAuthenticateOptions?: AuthenticateOptions;

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
     */
    accessType?: "online" | "offline";
}

export interface CustomStrategySettings {
    options:  OAuthStrategyOptions;
    /**
     * Custom passport-strategy
     */
    strategy: Strategy | Type<Strategy>;
}

export interface StrategyResponseOptions {
    /**
     * for web-viwe mode
     * the default value is /
     */
    successRedirect?: string;

    /**
     * for web-viwe mode
     * the default value is /auth/login
     */
    failureRedirect?: string;
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
