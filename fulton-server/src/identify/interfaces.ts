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
    find(username: string, password: string): IUser;
    findByOauth(soruce: string, profile: any): IUser;
    findByToken(token: string): IUser;
    register(user: IUser): Promise<IUser>;
}

export interface LocalStrategyVerifyOptions {
    message: string;
}

export interface LocalStrategyAuthenticate {
    (req: Request, username: string, password: string, done: (error: any, user?: any, options?: LocalStrategyVerifyOptions) => void): void;
}