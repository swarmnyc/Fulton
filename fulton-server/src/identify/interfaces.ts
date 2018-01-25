import { Request } from "../interfaces";

export interface IUser {
    [key: string]: any;
}

export interface IUserRegister extends IUser {
    email?: string;
    username?: string;
    password?: string;
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
    source?: string;
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
    loginByOauth(soruce: string, profile: any): Promise<T>;
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
    (error: any, user?: any): void
}

export interface LocalStrategyVerifyOptions {
    message: string;
}

export interface LocalStrategyVerifyDone {
    (error: any, user?: any, options?: LocalStrategyVerifyOptions): void
}

export interface LocalStrategyVerify {
    (req: Request, username: string, password: string, done: LocalStrategyVerifyDone): void;
}

export interface TokenStrategyVerify {
    (req: Request, accessToken: string, done: StrategyVerifyDone): void;
}