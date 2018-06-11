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
    email?: string;
    roles?: string[];
    registeredAt?: Date
}

export interface IFultonIdentity {
    id?: string;
    type?: string;
    [key: string]: any;
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
    loginByOauth(userId: string, token: AccessToken, profile: IOauthProfile): Promise<T>;
    loginByAccessToken(token: string): Promise<T>;
    register(input: RegisterModel): Promise<T>;
    issueAccessToken(user: T): Promise<AccessToken>;
    forgotPassword(usernameOrEmail: string): Promise<ForgotPasswordModel>;
    resetPassword(token: string, code: string, password: string): Promise<void>;
    verifyResetPassword(token: string, code: string): Promise<void>;
    getUserIdentities(user: T): Promise<IFultonIdentity[]>;
    revokeAccessToken(userId: string, token: string): Promise<void>;
    revokeAllAccessTokens(userId: string): Promise<void>;
    //refreshAccessToken(token: string): Promise<AccessToken>;
    //removeUserIdentities(...identities:IFultonIdentity[]): Promise<any>;
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

export interface OauthStrategyVerifier {
    (req: Request, access_token: string, refresh_token: string, profile: any, done: StrategyVerifyDone): void;
}

export interface ForgotPasswordModel {
    token: string,
    expires_in: number
}

export interface NotificationModel {
    username: string,
    email: string
}

export interface WelcomeNotificationModel extends NotificationModel {
}

export interface ForgotPasswordNotificationModel extends NotificationModel {
    url: string,
    token: string,
    code: string
}
