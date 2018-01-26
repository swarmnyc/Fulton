import { Request, PathIdentifier, Middleware } from "../interfaces";
import { Strategy } from "passport-strategy";

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
     * the default value is false,
     * when turn to true, you have to install googleapis package
     * `npm install googleapis`
     */
    enabled?: boolean;

    /**
     * the route path for google auth
     * the default value is /auth/google
     */
    path?: PathIdentifier;

    /**
     * the route path for google auth callback
     * the default value is /auth/google/callback
     * It can be overrided by procces.env["{appName}.options.identity.google.callbackPath"]
     */
    callbackPath?: string;

    /**
     * the clientId that google provides to you
     * It can be overrided by procces.env["{appName}.options.identity.google.clientId"]
     */
    clientId?: string;

    /**
     * the clientId that google provides to you
     * It can be overrided by procces.env["{appName}.options.identity.google.clientSecret"]
     */
    clientSecret?: string;

    /**
     * the callback url google will redirect to, for example `https://www.example.com/auth/google/callback`
     * if it is empty, fulton will combine req.originUrl + options.callbackPath
     */
    callbackUrl?: string;

    /**
     * the permission scopes to request access to,
     * default is `profile email`
     */
    scope?: string | string[];

    /**
     * verify the oauth request.
     */
    verifier?: OAuthStrategyVerifier;

    /**
     * either use successCallback or responseOptions for response
     * the default value is sendAccessToken
     */
    successCallback?: Middleware;

    /**
    * either use successCallback or responseOptions for response
    * the default value is null
    */
    responseOptions?: StrategyResponseOptions;
}

export interface GoogleStrategyOptions extends StrategyOptions {
    /**
     * Can be `online` (default) or `offline` (gets refresh_token)
     */
    accessType?: "online" | "offline";

    /**
    * the permission scopes to request access to,
    * default is `profile email`
    */
    scope?: string | string[];
}

export interface CustomStrategyOptions extends StrategyOptions {
    /**
     * Custom passport-strategy
     */
    strategy?: Strategy;

    [key: string]: any;
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

export interface LocalStrategyVerifyOptions {
    message: string;
}

export interface LocalStrategyVerifyDone {
    (error: any, user?: any, options?: LocalStrategyVerifyOptions): void
}

export interface LocalStrategyVerifier {
    (req: Request, username: string, password: string, done: LocalStrategyVerifyDone): void;
}

export interface TokenStrategyVerifier {
    (req: Request, accessToken: string, done: StrategyVerifyDone): void;
}

export interface OAuthStrategyVerifier {
    (req: Request, access_token: string, refresh_token: string, profile: any, done: StrategyVerifyDone): void;
}
