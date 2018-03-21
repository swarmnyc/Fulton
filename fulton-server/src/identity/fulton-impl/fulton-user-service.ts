import * as crypto from 'crypto';
import * as jws from 'jws';
import * as lodash from 'lodash';
import * as passwordHash from 'password-hash';
import * as validator from 'validator';

import { AccessToken, IFultonUser, IProfile, IUserRegister, IUserService } from "../interfaces";
import { DiKeys, Request, inject, injectable, Type } from "../../interfaces";
import { EntityRepository, MongoRepository, Repository, getManager, MongoEntityManager, EntityManager } from "typeorm";

import { FultonError } from "../../common";
import { FultonUser, FultonAccessToken, FultonOauthToken } from './fulton-user';
import { IFultonApp } from "../../fulton-app";
import { IdentityOptions } from '../identity-options';
import { ObjectId } from 'bson';

interface TokenPayload {
    id?: string;
    email?: string;
    username?: string;
    displayName?: string;
    portraitUrl?: string;
    roles?: string[];
    expiredAt: number;
}

//TODO: multiple database engines supports, move to other files
interface IRunner {
    addAccessToken?(accessToken: FultonAccessToken): Promise<any>
    addOauthToken?(oauthToken: FultonOauthToken): Promise<any>
    findUserByToken?(token: string): Promise<FultonUser>;
}

class MongoRunner implements IRunner {
    userRepository: MongoRepository<FultonUser>
    oauthRepository: MongoRepository<FultonOauthToken>
    tokenRepository: MongoRepository<FultonAccessToken>

    constructor(private manager: MongoEntityManager) {
        this.userRepository = manager.getMongoRepository(FultonUser)
        this.oauthRepository = manager.getMongoRepository(FultonOauthToken)
        this.tokenRepository = manager.getMongoRepository(FultonAccessToken)
    }

    addAccessToken(accesstoken: FultonAccessToken): Promise<any> {
        return this.tokenRepository.insert(accesstoken);
    }

    addOauthToken(oauthToken: AccessToken): Promise<any> {
        return this.oauthRepository.insert(oauthToken);
    }

    async findUserByToken(token: string): Promise<FultonUser> {
        let userToken = await this.tokenRepository.findOne({
            "token": token,
            "revoked": false,
            "expiredAt": { "$gt": new Date() }
        } as any)

        return this.userRepository.findOne({ id: userToken.id })
    }
}

class SqlRunner implements IRunner {
    constructor(private manager: EntityManager) {
    }

    addAccessToken?(accessToken: FultonAccessToken): Promise<any> {
        return null
    }

    addOauthToken?(oauthToken: FultonOauthToken): Promise<any> {
        return null
    }

    findUserByToken?(token: string): Promise<FultonUser> {
        return null
    }
}

@injectable()
export class FultonUserService implements IUserService<FultonUser> {
    private runner: IRunner;
    private userRepository: Repository<FultonUser>

    constructor(@inject(DiKeys.FultonApp) protected app: IFultonApp) {
        let manager = getManager(app.options.identity.databaseConnectionName)

        this.userRepository = manager.getRepository(FultonUser)

        if (manager instanceof MongoEntityManager) {
            this.runner = new MongoRunner(manager)
        } else {
            this.runner = new SqlRunner(manager)
        }
    }

    private get options(): IdentityOptions {
        return this.app.options.identity;
    }

    get currentUser(): FultonUser {
        if (this.app.options.settings.zoneEnabled) {
            let res: Request = Zone.current.get("res");
            if (res) {
                return res.user;
            } else {
                return null;
            }
        }
    }

    async register(input: IUserRegister): Promise<FultonUser> {
        let error = new FultonError();
        let registerOptions = this.options.register;

        // verify username, password, email
        error.verifyRequired(input, ["username", "email"])

        if (!input.oauthToken) {
            // if oauth register, no need password.
            error.verifyRequired(input, "password")

            let pwResult: boolean;
            if (registerOptions.passwordVerifier instanceof Function) {
                pwResult = registerOptions.passwordVerifier(input.password)
            } else {
                pwResult = registerOptions.passwordVerifier.test(input.password)
            }

            if (!pwResult) {
                error.addDetail("password", "password is invalid")
            }

            // if oauth register, skip username verify.            
            let unResult: boolean;
            if (registerOptions.usernameVerifier instanceof Function) {
                unResult = registerOptions.usernameVerifier(input.username)
            } else {
                unResult = registerOptions.usernameVerifier.test(input.username)
            }

            if (!unResult) {
                error.addDetail("username", "username is invalid")
            }
        }

        if (!validator.isEmail(input.email)) {
            error.addDetail("email", "email is invalid")
        }

        if (error.hasError()) {
            error.setMessage("register failed");
            throw error;
        }

        input.email = input.email.toLocaleLowerCase();
        input.username = input.username.toLocaleLowerCase();

        let fields = ["username", "email", "portraitUrl"].concat(registerOptions.otherFields);
        let newUser = lodash.pick(input, fields) as FultonUser;

        // verify existence
        let count = await this.userRepository.count({
            username: newUser.username,
        });

        if (count > 0) {
            error.addDetail("username", "the username is existed")
        }

        count = await this.userRepository.count({
            email: input.email,
        });

        if (count > 0) {
            error.addDetail("email", "the email is existed")
        }

        if (error.hasError()) {
            error.setMessage("register failed");
            throw error;
        }

        if (input.password) {
            newUser.hashedPassword = passwordHash.generate(input.password, registerOptions.passwordHashOptions);
        }


        let user = await this.userRepository.save(newUser);

        if (input.oauthToken) {
            this.runner.addOauthToken({
                accessToken: input.oauthToken.access_token,
                refreshToken: input.oauthToken.refresh_token,
                provider: input.oauthToken.provider,
                issuedAt: new Date(),
                userId: user.id
            })
        }

        return user;
    }

    async login(username: string, password: string): Promise<FultonUser> {
        let error = new FultonError();

        if (!lodash.some(username)) {
            error.addDetail("username", "username is required")
        }

        if (!lodash.some(password)) {
            error.addDetail("password", "password is required")
        }

        if (error.hasError()) {
            error.setMessage("login failed");
            throw error;
        }

        let user = await this.userRepository.findOne({
            username: username,
        });

        if (user && user.hashedPassword && passwordHash.verify(password, user.hashedPassword)) {
            return user;
        } else {
            throw error.setMessage("username or password isn't correct");
        }
    }

    async loginByOauth(token: AccessToken, profile: IProfile): Promise<FultonUser> {
        let error = new FultonError();

        // verify email
        if (!error.verifyRequired(profile, "email")) {
            throw error;
        }

        profile.email = profile.email.toLocaleLowerCase();

        // verify existence
        let user = await this.userRepository.findOne({
            email: profile.email,
        });

        if (user) {
            // email is the same            
            await this.runner.addOauthToken({
                provider: token.provider,
                accessToken: token.access_token,
                refreshToken: token.refresh_token,
                issuedAt: new Date(),
                userId: user.id
            });

            return user;
        } else {
            // create a new user
            let newUser: IUserRegister = {
                email: profile.email,
                username: profile.email, // use email to avoid the same name
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
                let decipher = crypto.createDecipher("aes-128-ecb", this.cipherPassword)
                let json = decipher.update(jwt.payload, "base64", "utf8");
                json += decipher.final();

                payload = JSON.parse(json);

                if (payload.id && ObjectId.isValid(payload.id)) {
                    // convert id to ObjectId
                    payload.id = new ObjectId(payload.id) as any
                }

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
            // if level greater than low, encrypt the payload 
            // java only support aes 128
            let cipher = crypto.createCipher("aes-128-ecb", this.cipherPassword)
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

        let userToken: FultonAccessToken = {
            token: token,
            issuedAt: now,
            expiredAt: new Date(expiredAt),
            revoked: false,
            userId: user.id
        };

        await this.runner.addAccessToken(userToken);

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