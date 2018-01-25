import * as lodash from 'lodash';

import { AccessToken, FultonError, FultonUser, IUserService, Inject, Injectable, IUserRegister } from "../../src/index";

import { FultonApp } from "../../src/fulton-app";

export class UserServiceMock implements IUserService<FultonUser> {
    currentUser: FultonUser;

    constructor(public app: FultonApp) {
    }

    login(username: string, password: string): Promise<FultonUser> {
        let errors = new FultonError();

        if (!lodash.some(username)) {
            errors.addError("username", "username is required")
        }

        if (!lodash.some(password)) {
            errors.addError("password", "password is required")
        }

        if (errors.hasErrors()) {
            return Promise.reject(errors);
        }

        if (/fail/i.test(password)) {
            errors.addError("$", "username or password isn't correct");
            return Promise.reject(errors);
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
            user.roles = [info[0]];
            return Promise.resolve(user);
        } else {
            return Promise.resolve(null);
        }
    }

    register(input: IUserRegister): Promise<FultonUser> {
        let errors = new FultonError();

        let newUser = lodash.pick(input, ["username", "password", "email"]);

        if (errors.verifyRequireds(input, ["username", "password", "email"])) {
            return Promise.resolve(input as FultonUser);
        } else {
            return Promise.reject(errors);
        }
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