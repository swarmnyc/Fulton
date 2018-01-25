import { FultonUser, IUserService, AccessToken, Inject, Injectable } from "../../src/index";
import { FultonApp } from "../../src/fulton-app";

export class UserServiceMock implements IUserService<FultonUser> {
    currentUser: FultonUser;
    
    constructor(public app: FultonApp) {
    }

    login(username: string, password: string): Promise<FultonUser> {
        if (/fail/i.test(password)) {
            return Promise.resolve(null);
        } else {
            let user = new FultonUser();
            user.id = username;
            user.username = username;
            return Promise.resolve(user);
        }
    }

    loginByOauth(soruce: string, profile: any): Promise<FultonUser> {
        throw new Error("Method not implemented.");
    }

    findByAccessToken(token: string): Promise<FultonUser> {
        let info = token.split("-");
        if (info[1] == "accessToken") {
            let user = new FultonUser();
            user.id = info[0];
            user.username = info[0];
            return Promise.resolve(user);
        } else {
            return Promise.resolve(null);
        }
    }

    register(user: FultonUser): Promise<FultonUser> {
        return Promise.resolve(user);
    }

    issueAccessToken(user: FultonUser): Promise<AccessToken> {
        return Promise.resolve({
            access_token: `${user.username}-accessToken`,
            token_type: this.app.options.identify.accessTokenType,
            expires_in: this.app.options.identify.accessTokenDuration
        });
    }

    refreshAccessToken(token: string): Promise<AccessToken> {
        throw new Error("Method not implemented.");
    }
}