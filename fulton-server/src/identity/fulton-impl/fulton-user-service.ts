import * as crypto from 'crypto';
import * as jws from 'jws';
import * as lodash from 'lodash';
import * as passwordHash from 'password-hash';
import * as validator from 'validator';

import { AccessToken, FultonAccessToken, IFultonUser, IUserRegister, IUserService } from "../interfaces";
import { EntityRepository, MongoRepository, Repository } from "typeorm";
import { inject, injectable } from "../../interfaces";

import { FultonApp } from "../../fulton-app";
import { FultonError } from "../../common";
import { FultonUser } from "./fulton-user";
import { IProfile, Request } from '../../index';
import { IdentityOptions } from '../identity-options';

interface TokenPayload {
    id?: string;
    email?: string;
    username?: string;
    displayName?: string;
    portraitUrl?: string;
    roles?: string[];
    expiredAt: number;
}

//TODO: multiple database engines supports

interface IRunner {
    addAccessToken(user: FultonUser, userToken: FultonAccessToken): Promise<any>
    updateOAuthToken?(user: FultonUser, oauthToken: AccessToken): Promise<any>
    findUserByToken?(token: string): Promise<FultonUser>;
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

    findUserByToken(token: string): Promise<FultonUser> {
        return this.userRepository.findOne({
            "accessTokens":
                {
                    "$elemMatch":
                        {
                            "token": token,
                            "revoked": false,
                            "expiredAt": { "$gt": new Date() }
                        }
                }
        } as any);
    }
}

class SqlRunner implements IRunner {
    constructor(private userRepository: Repository<FultonUser>) {

    }

    addAccessToken(user: FultonUser, userToken: FultonAccessToken): Promise<any> {
        return;
    }
}


@injectable()
export class FultonUserService implements IUserService<FultonUser> {
    private options: IdentityOptions;
    private runner: IRunner;

    constructor( @inject(FultonApp) private app: FultonApp,
        @inject("UserRepository") private userRepository: Repository<FultonUser>) {
        this.options = app.options.identity;

        if (userRepository instanceof MongoRepository) {
            this.runner = new MongoRunner(this.userRepository as MongoRepository<FultonUser>)
        } else {
            this.runner = new SqlRunner(this.userRepository)
        }
    }

    get currentUser(): FultonUser {
        let res: Request = Zone.current.get("res");
        if (res) {
            return res.user;
        } else {
            return null;
        }
    }

    async register(input: IUserRegister): Promise<FultonUser> {
        let errors = new FultonError();
        let registerOptions = this.options.register;

        // verify username, password, email
        errors.verifyRequired(input, ["username", "email"])

        if (!input.oauthToken) {
            // if oauth register, no need password.
            errors.verifyRequired(input, "password")

            let pwResult: boolean;
            if (registerOptions.passwordVerifier instanceof Function) {
                pwResult = registerOptions.passwordVerifier(input.password)
            } else {
                pwResult = registerOptions.passwordVerifier.test(input.password)
            }

            if (!pwResult) {
                errors.addError("password", "password is invalid")
            }

            // if oauth register, skip usename verify.            
            let unResult: boolean;
            if (registerOptions.usernameVerifier instanceof Function) {
                unResult = registerOptions.usernameVerifier(input.username)
            } else {
                unResult = registerOptions.usernameVerifier.test(input.username)
            }

            if (!unResult) {
                errors.addError("username", "username is invalid")
            }
        }

        if (!validator.isEmail(input.email)) {
            errors.addError("email", "email is invalid")
        }

        if (errors.hasErrors()) {
            throw errors;
        }

        input.email = input.email.toLocaleLowerCase();
        input.username = input.username.toLocaleLowerCase();

        let fileds = ["username", "email", "portraitUrl"].concat(registerOptions.otherFileds);
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
                    issuredAt: new Date()
                }
            ]
        }

        if (input.password) {
            newUser.hashedPassword = passwordHash.generate(input.password, registerOptions.passwordHashOptons);
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

    async loginByOauth(token: AccessToken, profile: IProfile): Promise<FultonUser> {
        let errors = new FultonError();

        // verify email
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
            // TODO: Clean Old OAuthTokens
            await this.runner.updateOAuthToken(user, {
                provider: token.provider,
                accessToken: token.access_token,
                refreshToken: token.refresh_token,
                issuredAt: new Date()
            });

            return user;
        } else {
            // create a new user
            let newUser: IUserRegister = {
                email: profile.email,
                username: profile.username || profile.email,
                portraitUrl: profile.portraitUrl,
                oauthToken: token
            }

            return this.register(newUser);
        }
    }

    loginByAccessToken(token: string): Promise<FultonUser> {
        if (jws.verify(token, "HS256", this.jwtSecret)) {

            let level = this.options.accessToken.secureLevel;
            if (level == "high") {
                return this.runner.findUserByToken(token);
            }

            let jwt = jws.decode(token);
            let payload: TokenPayload;
            if (level == "medium") {
                let decipher = crypto.createDecipher("aes256", this.cipherPassword)
                let json = decipher.update(jwt.payload, "base64", "utf8");
                json += decipher.final();

                payload = JSON.parse(json);

            } else {
                payload = JSON.parse(jwt.payload);
            }

            if (payload.expiredAt > Date.now()) {
                return Promise.resolve(payload as FultonUser);
            } else {
                return Promise.reject("Token Expired");
            }

        } else {
            return Promise.reject("Invalid Token");
        }

    }

    async issueAccessToken(user: FultonUser): Promise<AccessToken> {
        let now = new Date();

        let expiredAt = now.valueOf() + (this.options.accessToken.duration * 1000);
        let payload: TokenPayload | string = {
            id: user.id,
            expiredAt: expiredAt
        };

        let level = this.options.accessToken.secureLevel;
        let scopes = this.options.accessToken.scopes;

        if (level != "high") {
            // if high, don't put others into payload
            if (lodash.some(scopes, (s) => s == "profile")) {
                payload.username = user.username;
                payload.displayName = user.displayName;
                payload.email = user.email;
                payload.portraitUrl = user.portraitUrl;
            }

            if (lodash.some(scopes, (s) => s == "roles")) {
                payload.roles = user.roles;
            }
        }

        if (level != "low") {
            // if level greater than low, encrypte the payload 
            let cipher = crypto.createCipher("aes256", this.cipherPassword)
            payload = cipher.update(JSON.stringify(payload), "utf8", "base64");
            payload += cipher.final("base64");
        }

        let token = jws.sign({
            header: {
                alg: "HS256"
            },
            secret: this.jwtSecret,
            payload: payload
        });

        let userToken = {
            token: token,
            issuredAt: now,
            expiredAt: new Date(expiredAt),
            revoked: false
        };

        await this.runner.addAccessToken(user, userToken);

        return {
            access_token: token,
            token_type: this.options.accessToken.type,
            expires_in: this.options.accessToken.duration
        }
    }

    resetPassword(email: string) {
        // TODO: reset password
    }

    refreshAccessToken(token: string): Promise<AccessToken> {
        throw new Error("Method not implemented.");
    }

    private get jwtSecret(): string | Buffer {
        return this.options.accessToken.key || this.app.appName;
    }

    private get cipherPassword(): string | Buffer {
        return this.options.accessToken.key || this.app.appName;
    }
}