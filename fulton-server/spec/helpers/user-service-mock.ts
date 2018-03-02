import * as lodash from 'lodash';

import { AccessToken, IUserRegister, IUserService } from '../../src/identity/interfaces';
import { inject, injectable } from "../../src/interfaces";

import { FultonApp } from "../../src/fulton-app";
import { FultonError } from '../../src/common/fulton-error';
import { FultonUser } from '../../src/identity/fulton-impl/fulton-user';

export class UserServiceMock implements IUserService<FultonUser> {
    currentUser: FultonUser;

    constructor(public app: FultonApp) {
    }

    login(username: string, password: string): Promise<FultonUser> {
        let error = new FultonError();

        if (!lodash.some(username)) {
            error.addError("username", "username is required")
        }

        if (!lodash.some(password)) {
            error.addError("password", "password is required")
        }

        if (error.hasErrors()) {
            return Promise.reject(error);
        }

        if (/fail/i.test(password)) {
            error.setMessage("username or password isn't correct");
            return Promise.reject(error);
        } else {
            let user = new FultonUser();
            user.id = username;
            user.username = username;
            return Promise.resolve(user);
        }
    }

    loginByOauth(token: AccessToken, profile: FultonUser): Promise<FultonUser> {
        return Promise.resolve(profile);
    }

    loginByAccessToken(token: string): Promise<FultonUser> {
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

        if (errors.verifyRequired(input, ["username", "password", "email"])) {
            return Promise.resolve(input as FultonUser);
        } else {
            return Promise.reject(errors);
        }
    }

    issueAccessToken(user: FultonUser): Promise<AccessToken> {
        return Promise.resolve({
            access_token: `${user.username}-accessToken`,
            token_type: this.app.options.identity.accessToken.type,
            expires_in: this.app.options.identity.accessToken.duration
        });
    }

    refreshAccessToken(token: string): Promise<AccessToken> {
        throw new Error("Method not implemented.");
    }
}