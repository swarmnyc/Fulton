import { Request } from "../interfaces";

export interface IUser {

}

interface FultonUser extends IUser {
    id?: string;
    email?: string;
    username?: string;
    hashedPassword?: string;
    accessTokens: FultonAccessToken[];
    oauth: FultonUserOauth[];
    roles: string[];
    [key: string]: any;
}

interface FultonUserOauth {
    source?: string;
    userId?: string;
    accessToken?: string;
    refreshToken?: string;
    issuredAt?: Date;
    expiredAt?: Date;
}

interface FultonAccessToken {
    token?: string;
    issuredAt?: Date;
    expiredAt?: Date;
    actived?: boolean;
}

export interface IUserManager {
    findByUsernamePassword(username: string, password: string): IUser;
    findByToken(token: string): IUser;
    register(user: IUser): Promise<IUser>;
}

export interface LocalStrategyVerifyOptions {
    message: string;
}

export interface LocalStrategyAuthenticate {
    (req: Request, username: string, password: string, done: (error: any, user?: any, options?: LocalStrategyVerifyOptions) => void): void;
}