import * as lodash from 'lodash';
import { FultonError } from '../../src/common/fulton-error';
import { FultonApp } from "../../src/fulton-app";
import { FultonUser } from '../../src/identity/fulton-impl/fulton-user';
import { AccessToken, IFultonUserClaims, IIdentityService, IOauthProfile, IUser, RegisterModel } from '../../src/identity/types';

export class IdentityServiceMock implements IIdentityService<IUser> {
    app: FultonApp

    init() {
    }

    getCurrentUser(): IUser {
        throw new Error("Method not implemented.");
    }

    login(username: string, password: string): Promise<IUser> {
        let error = new FultonError();

        if (!lodash.some(username)) {
            error.addDetail("username", "username is required")
        }

        if (!lodash.some(password)) {
            error.addDetail("password", "password is required")
        }

        if (error.hasError()) {
            return Promise.reject(error);
        }

        if (/fail/i.test(password)) {
            error.set("username or password isn't correct");
            return Promise.reject(error);
        } else {
            let user = new FultonUser();
            user.id = username;
            user.displayName = username;
            return Promise.resolve(user);
        }
    }

    loginByOauth(userId: string, token: AccessToken, profile: IOauthProfile): Promise<IUser> {
        profile.displayName = profile.displayName
        return Promise.resolve(profile);
    }

    loginByAccessToken(token: string): Promise<IUser> {
        let info = token.split("-");
        if (info[1] == "accessToken") {
            let user = new FultonUser();
            user.id = info[0];
            user.displayName = info[0];
            user.roles = [info[0]];
            return Promise.resolve(user);
        } else {
            return Promise.resolve(null);
        }
    }

    register(input: RegisterModel): Promise<IUser> {
        let error = new FultonError();

        if (error.verifyRequiredList(input, ["username", "password", "email"])) {
            var user = Object.assign(new FultonUser(), {
                displayName: input.username,
                email: input.email
            })

            return Promise.resolve(user);
        } else {
            return Promise.reject(error);
        }
    }

    issueAccessToken(user: IUser): Promise<AccessToken> {
        return Promise.resolve({
            access_token: `${user.displayName}-accessToken`,
            token_type: this.app.options.identity.accessToken.type,
            expires_in: this.app.options.identity.accessToken.duration / 1000
        });
    }

    forgotPassword(usernameOrEmail: string): Promise<any> {
        throw new Error("Method not implemented.");
    }

    resetPassword(token: string, code: string, password: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    verifyResetPassword(token: string, code: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    revokeResetPassword(token: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    refreshAccessToken(token: string): Promise<AccessToken> {
        throw new Error("Method not implemented.");
    }

    revokeAccessToken(userId: string, token: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    revokeAllAccessTokens(userId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    updateProfile(userId: any, input: FultonUser): Promise<void> {
        throw new Error("Method not implemented.");
    }
    updateLocalClaim(userId: any, input: any): Promise<void> {
        throw new Error("Method not implemented.");
    }

    getUser(userId: any): Promise<FultonUser> {
        throw new Error("Method not implemented.");
    }

    getUserClaims(userId: any): Promise<IFultonUserClaims[]> {
        throw new Error("Method not implemented.");
    }

    cleanUserCache(userId: any): void {
        throw new Error("Method not implemented.");
    }
}