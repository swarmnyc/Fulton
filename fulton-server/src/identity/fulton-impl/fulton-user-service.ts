import * as crypto from 'crypto';
import * as lodash from 'lodash';
import * as passwordHash from 'password-hash';

import { AccessToken, FultonAccessToken, IFultonUser, IUserRegister, IUserService } from "../interfaces";
import { EntityRepository, MongoRepository, Repository } from "typeorm";
import { Inject, Injectable } from "../../interfaces";

import { FultonApp } from "../../fulton-app";
import { FultonError } from "../../common";
import { FultonUser } from "./fulton-user";
import { IdentityOptions } from '../identity-options';

//TODO: multiple database engines supports

interface IRunner {
    addAccessToken(user: FultonUser, userToken: FultonAccessToken): Promise<any>
    updateOAuthToken?(user: FultonUser, oauthToken: AccessToken): Promise<any>
}

class MongoRunner implements IRunner {
    constructor(private userRepository: MongoRepository<FultonUser>) {

    }

    addAccessToken(user: FultonUser, userToken: FultonAccessToken): Promise<any> {
        return this.userRepository.updateOne({ _id: user.id }, {
            "$push": { "accessTokens": userToken }
        });
    }

    updateOAuthToken(user: FultonUser, oauthToken: AccessToken): Promise<any> {
        return this.userRepository.updateOne({ _id: user.id }, {
            "$push": { "oauthes": oauthToken }
        });
    }
}

class SqlRunner implements IRunner {
    constructor(private userRepository: Repository<FultonUser>) {

    }

    addAccessToken(user: FultonUser, userToken: FultonAccessToken): Promise<any> {
        return;
    }
}


@Injectable()
export class FultonUserService implements IUserService<FultonUser> {
    private options: IdentityOptions;
    private runner: IRunner;

    constructor( @Inject(FultonApp) private app: FultonApp,
        @Inject("UserRepository") private userRepository: Repository<FultonUser>) {
        this.options = app.options.identity;

        if (userRepository instanceof MongoRepository) {
            this.runner = new MongoRunner(this.userRepository as MongoRepository<FultonUser>)
        } else {
            this.runner = new SqlRunner(this.userRepository)
        }
    }

    get currentUser(): FultonUser {
        let zone = (global as any).Zone;
        if (zone && zone.current.ctx) {
            return zone.current.ctx.request.user;
        } else {
            return null;
        }
    }

    async register(input: IUserRegister): Promise<FultonUser> {
        let errors = new FultonError();
        let registorOptions = this.app.options.identity.register;

        // verify username, password, email
        errors.verifyRequireds(input, ["username", "email"])

        if (!input.oauthToken) {
            // if oauth register, no need password.
            errors.verifyRequired(input, "password")
        }

        if (input.password && registorOptions.passwordVerify) {
            let pwResult: boolean;
            if (registorOptions.passwordVerify instanceof Function) {
                pwResult = registorOptions.passwordVerify(input.password)
            } else {
                pwResult = registorOptions.passwordVerify.test(input.password)
            }

            if (!pwResult) {
                errors.addError("password", "password is invalid.")
            }
        }

        if (errors.hasErrors()) {
            throw errors;
        }

        //TODO: verify email

        input.email = input.email.toLocaleLowerCase();
        input.username = input.username.toLocaleLowerCase();

        let fileds = ["username", "email", "userImageUrl"].concat(registorOptions.otherFileds);
        let newUser = lodash.pick(input, fileds) as FultonUser;

        // verify existence
        let count = await this.userRepository.count({
            username: newUser.username,
        });

        if (count > 0) {
            errors.addError("username", "the username is existed")
        }

        count = await this.userRepository.count({
            email: input.email,
        });

        if (count > 0) {
            errors.addError("email", "the email is existed")
        }

        if (errors.hasErrors()) {
            throw errors;
        }

        if (input.oauthToken) {
            newUser.oauthes = [
                {
                    accessToken: input.oauthToken.access_token,
                    refreshToken: input.oauthToken.refresh_token,
                    provider: input.oauthToken.provider,
                    expiredAt: input.oauthToken.expires_at,
                    issuredAt: new Date()
                }
            ]
        }

        if (input.password) {
            newUser.hashedPassword = passwordHash.generate(input.password, registorOptions.passwordHashOptons);
        }

        return this.userRepository.save(newUser);
    }

    async login(username: string, password: string): Promise<FultonUser> {
        let errors = new FultonError();

        if (!lodash.some(username)) {
            errors.addError("username", "username is required")
        }

        if (!lodash.some(password)) {
            errors.addError("password", "password is required")
        }

        if (errors.hasErrors()) {
            throw errors;
        }

        let user = await this.userRepository.findOne({
            username: username,
        });

        if (user.hashedPassword && passwordHash.verify(password, user.hashedPassword)) {
            return user;
        } else {
            throw errors.addError("$", "username or password isn't correct");
        }
    }

    async loginByOauth(token: AccessToken, profile: any): Promise<FultonUser> {
        let errors = new FultonError();

        // verify username, password, email
        if (!errors.verifyRequired(profile, "email")) {
            throw errors;
        }

        profile.email = profile.email.toLocaleLowerCase();

        // verify existence
        let user = await this.userRepository.findOne({
            email: profile.email,
        });

        if (user) {
            // email is the same
            await this.runner.updateOAuthToken(user, {
                provider: token.provider,                
                accessToken: token.access_token,
                refreshToken: token.refresh_token,
                expiredAt: token.expires_at,
                issuredAt: new Date()
            });

            return user;
        } else {
            // create a new user
            let newUser: IUserRegister = {
                email: profile.email,
                username: profile.username || profile.email,
                oauthToken: token
            }

            return this.register(newUser);
        }
    }

    findByAccessToken(token: string): Promise<FultonUser> {
        throw new Error("Method not implemented.");
    }

    async issueAccessToken(user: FultonUser): Promise<AccessToken> {
        const hash = crypto.createHmac('sha256', (Math.random() * 10000).toString());
        let token = hash.update(user.id.toString()).digest("base64");

        let now = new Date();
        let userToken = {
            token: token,
            issuredAt: now,
            expiredAt: new Date(now.valueOf() + (this.app.options.identity.accessTokenDuration * 1000)),
            revoked: false
        };

        await this.runner.addAccessToken(user, userToken);

        return {
            access_token: token,
            token_type: this.app.options.identity.accessTokenType,
            expires_in: this.app.options.identity.accessTokenDuration
        }
    }

    checkRoles(user: FultonUser, ...roles: string[]): boolean {
        return false;
    }

    resetPassword(email: string) {

    }

    refreshAccessToken(token: string): Promise<AccessToken> {

        throw new Error("Method not implemented.");
    }
}