import * as passport from 'passport';
import { Middleware, NextFunction, Request, Response } from '../alias';
import { IFultonApp } from '../fulton-app';
import { Type } from "../interfaces";
import { IdentityOptions } from './identity-options';
import { OauthStrategyOptions } from './options/oauth-strategy-options';

export type Strategy = passport.Strategy;
export type AuthenticateOptions = passport.AuthenticateOptions;

export interface IUser {
    [key: string]: any;
}

export interface IOauthProfile {
    id?: string;
    email?: string;
    displayName?: string;
    portraitUrl?: string;
    [key: string]: any;
}

export interface RegisterModel {
    email?: string;
    username?: string;
    password?: string;
    portraitUrl?: string;
    [key: string]: any;
}

export interface UpdateLocalModel {
    email?: string;
    username?: string;
    password?: string;
}

export interface IFultonUser extends IUser {
    id?: any;
    displayName?: string;
    portraitUrl?: string;
    email?: string;
    roles?: string[];
    registeredAt?: Date
}

export interface IFultonUserClaims {
    id?: string;
    type?: string;
    [key: string]: any;
}

export interface IIdentityRouter {
    init(app: IFultonApp, options: IdentityOptions): void;
    register(req: Request, res: Response, next: NextFunction): void
    forgotPassword(req: Request, res: Response, next: NextFunction): void
    verifyResetPassword(req: Request, res: Response, next: NextFunction): void
    resetPassword(req: Request, res: Response, next: NextFunction): void
    logout(req: Request, res: Response, next: NextFunction): void
    profile(req: Request, res: Response, next: NextFunction): void
    updateProfile(req: Request, res: Response, next: NextFunction): void
    updateLocalClaim(req: Request, res: Response, next: NextFunction): void

    issueAccessToken(req: Request, res: Response): void

    /** generate the authenticate middleware for oauth strategies */
    oauthFn(options: OauthStrategyOptions): Middleware

    /** generate the callback middleware for oauth strategies */
    oauthCallbackFn(options: OauthStrategyOptions): Middleware
}

export interface IIdentityService<T extends IUser> {
    app: IFultonApp;

    init(): void;

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
    updateProfile(userId: any, input:T): Promise<void>;
    updateLocalClaim(userId: any, input:UpdateLocalModel): Promise<void>;
    issueAccessToken(user: T): Promise<AccessToken>;
    forgotPassword(usernameOrEmail: string): Promise<ForgotPasswordModel>;
    resetPassword(token: string, code: string, password: string): Promise<void>;
    verifyResetPassword(token: string, code: string): Promise<void>;
    getUser(userId: any): Promise<T>;
    getUserClaims(userId: any): Promise<IFultonUserClaims[]>;
    getCurrentUser(): T;
    revokeAccessToken(userId: string, token: string): Promise<void>;
    revokeAllAccessTokens(userId: string): Promise<void>;
    cleanUserCache(userId: any): void;
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
     * if it is identity.{name}.callbackUrl is empty, fulton will generate the value by combining req.originUrl + callbackPath
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

export interface DefaultStrategyVerifier {
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

export type StrategyVerifier = DefaultStrategyVerifier | LocalStrategyVerifier | TokenStrategyVerifier | OauthStrategyVerifier

export interface ForgotPasswordModel {
    token: string,
    expires_in: number
}

export interface NotificationModel {
    displayName: string,
    email: string
}

export interface WelcomeNotificationModel extends NotificationModel {
}

export interface ForgotPasswordNotificationModel extends NotificationModel {
    url: string,
    token: string,
    code: string
}
