import { Request } from "../interfaces";

export interface IUser {
    [key: string]: any;
}

export interface IFultonUser extends IUser {
    id?: string;
    email?: string;
    username?: string;
    hashedPassword?: string;
    accessTokens: FultonAccessToken[];
    oauth: FultonUserOauth[];
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
    actived?: boolean;
}

export interface IUserService {
    login(username: string, password: string): IUser;
    loginByOauth(soruce: string, profile: any): IUser;
    findByAccessToken(token: string): IUser;
    register(user: IUser): Promise<IUser>;
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