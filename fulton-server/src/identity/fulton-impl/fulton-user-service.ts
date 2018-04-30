import * as crypto from 'crypto';
import * as jws from 'jws';
import * as lodash from 'lodash';
import * as passwordHash from 'password-hash';
import * as validator from 'validator';
import { AccessToken, IFultonUser, IOauthProfile, IUserService, RegisterModel } from '../interfaces';
import { DiKeys, EventKeys } from '../../keys';
import { EntityManager, EntityRepository, getManager, MongoEntityManager, MongoRepository, Repository } from 'typeorm';
import { EntityMetadata } from 'typeorm/metadata/EntityMetadata';
import { FultonAccessToken, FultonIdentity, FultonUser } from './fulton-user';
import { FultonError } from '../../common';
import { IdentityOptions } from '../identity-options';
import { IFultonApp } from '../../fulton-app';
import { inject, injectable, NotificationMessage, Request, Type } from '../../interfaces';
import { ObjectId } from 'bson';

interface JWTPayload {
    id: string;

    username?: string;
    portraitUrl?: string;
    emails?: string;
    roles?: string[];
    [key: string]: any;
}

//TODO: multiple database engines supports, move to other files
/**
 * the runner is for multiple database engines supports
 */
interface IRunner {
    convertUserId(userId: any): any;
    updateMetadata(metadata: EntityMetadata): void;
    addUser(user: FultonUser): Promise<FultonUser>
    addAccessToken(accessToken: FultonAccessToken): Promise<any>
    addIdentity(identify: FultonIdentity): Promise<any>
    updateIdentity(identify: FultonIdentity): Promise<any>
    findUserById(userId: any): any;
    findUserByLocal(username: string, password: string): Promise<FultonUser>;
    findUserByOauth(type: string, soruceUserId: string): Promise<FultonUser>;
    findIdentity(type: string, soruceUserId: string): Promise<FultonIdentity>;
    findUserByToken(token: string): Promise<FultonUser>;
    countUserName(name: string): Promise<number>;
    countUserEmail(email: string): Promise<number>;
}

class MongoRunner implements IRunner {
    userRepository: MongoRepository<FultonUser>
    identitiesRepository: MongoRepository<FultonIdentity>
    tokenRepository: MongoRepository<FultonAccessToken>

    constructor(private manager: MongoEntityManager) {
        this.userRepository = manager.getMongoRepository(FultonUser) as any
        this.identitiesRepository = manager.getMongoRepository(FultonIdentity) as any
        this.tokenRepository = manager.getMongoRepository(FultonAccessToken) as any

        this.updateMetadata(this.userRepository.metadata);
        this.updateMetadata(this.identitiesRepository.metadata);
        this.updateMetadata(this.tokenRepository.metadata);
    }

    convertUserId(userId: any): ObjectId {
        return new ObjectId(userId)
    }

    updateMetadata(metadata: EntityMetadata) {
        let idColumn = metadata.ownColumns.find((c) => c.propertyName == "id")

        idColumn.isObjectId = true;
        idColumn.givenDatabaseName =
            idColumn.databaseNameWithoutPrefixes =
            idColumn.databaseName = "_id";

        metadata.generatedColumns = [idColumn]
        metadata.objectIdColumn = idColumn
    }

    addUser(user: FultonUser): Promise<FultonUser> {
        return this.userRepository.save(user);
    }

    addAccessToken(accesstoken: FultonAccessToken): Promise<any> {
        return this.tokenRepository.insertOne(accesstoken);
    }

    addIdentity(identity: FultonIdentity): Promise<any> {
        return this.identitiesRepository.insertOne(identity);
    }

    updateIdentity(identity: FultonIdentity): Promise<any> {
        return this.identitiesRepository.save(identity);
    }

    countUserName(name: string): Promise<number> {
        return this.identitiesRepository.count({
            "type": "local",
            username: name,
        })
    }

    countUserEmail(email: string): Promise<number> {
        return this.identitiesRepository.count({
            "type": "local",
            email: email,
        })
    }

    async findUserById(userId: any): Promise<FultonUser> {
        return this.userRepository.findOne(userId);
    }

    async findUserByLocal(nameOrEmail: string, password: string): Promise<FultonUser> {
        var id = await this.identitiesRepository.findOne({
            "type": "local",
            "$or": [
                { username: nameOrEmail },
                { email: nameOrEmail }
            ]
        } as any)

        if (id && passwordHash.verify(password, id.hashedPassword)) {
            return this.userRepository.findOne(id.userId)
        } else {
            return null;
        }
    }

    async findUserByOauth(type: string, sourceUserId: string): Promise<FultonUser> {
        var id = await this.identitiesRepository.findOne({
            "type": type,
            "sourceUserId": sourceUserId
        })

        if (id) {
            return this.userRepository.findOne(id.userId)
        } else {
            return null;
        }
    }

    async findUserByToken(token: string): Promise<FultonUser> {
        let userToken = await this.tokenRepository.findOne({
            "token": token,
            "revoked": false,
            "expiredAt": { "$gt": new Date() }
        } as any)

        return this.userRepository.findOne(userToken.userId)
    }

    findIdentity(type: string, sourceUserId: string): Promise<FultonIdentity> {
        return this.identitiesRepository.findOne({
            "type": type,
            "sourceUserId": sourceUserId
        });
    }
}

@injectable()
export class FultonUserService implements IUserService<FultonUser> {
    private runner: IRunner;

    constructor(@inject(DiKeys.FultonApp) protected app: IFultonApp) {
        let manager = getManager(app.options.identity.databaseConnectionName)

        if (manager instanceof MongoEntityManager) {
            this.runner = new MongoRunner(manager)
        } else {
            //this.runner = new SqlRunner(manager)
        }
    }

    private get options(): IdentityOptions {
        return this.app.options.identity;
    }

    get currentUser(): FultonUser {
        if (this.app.options.miscellaneous.zoneEnabled) {
            let res: Request = Zone.current.get("res");
            if (res) {
                return res.user;
            } else {
                return null;
            }
        }
    }

    async register(input: RegisterModel): Promise<FultonUser> {
        let error = new FultonError("register_failed");
        let registerOptions = this.options.register;

        // verify username, password, email
        this.verifyUserName(error, input)
        this.verifyPassword(error, input)
        this.verifyEmail(error, input)

        if (error.hasError()) {
            throw error;
        }

        // verify existence
        var username = input.username.toLocaleLowerCase();
        let count = await this.runner.countUserName(username);

        if (count > 0) {
            error.addDetail("username", "existed", "the username is existed")
        }

        var email = input.email.toLocaleLowerCase();
        count = await this.runner.countUserEmail(email);

        if (count > 0) {
            error.addDetail("email", "existed", "the email is existed")
        }

        if (error.hasError()) {
            throw error;
        }

        // add user
        let fields = ["username", "portraitUrl"].concat(registerOptions.otherFields);
        let userInput = lodash.pick(input, fields) as FultonUser;
        userInput.emails = [input.email]
        userInput.registeredAt = new Date()

        let user = await this.runner.addUser(userInput);

        // add local itentity
        var hashedPassword = passwordHash.generate(input.password, registerOptions.passwordHashOptions);

        await this.runner.addIdentity({
            type: "local",
            userId: user.id,
            email: email,
            username: username,
            hashedPassword: hashedPassword
        })

        this.sendWelcomeNotification(user)
        this.app.events.emit(EventKeys.UserDidRegister, user);

        return user;
    }

    async login(username: string, password: string): Promise<FultonUser> {
        let error = new FultonError("login_failed");

        if (!lodash.some(username)) {
            error.addDetail("username", "required")
        }

        if (!lodash.some(password)) {
            error.addDetail("password", "required")
        }

        if (error.hasError()) {
            throw error;
        }

        let user = await this.runner.findUserByLocal(username.toLocaleLowerCase(), password);

        if (user) {
            return user;
        } else {
            throw error.set("login_failed", "username or password isn't correct");
        }
    }

    async loginByOauth(userId: string, token: AccessToken, profile: IOauthProfile): Promise<FultonUser> {
        let error = new FultonError();

        // the id is necessary
        if (!error.verifyRequired(profile, "id")) {
            throw error.set("unknown_error", "the oauth provider returned unexpected data.");
        }

        let user;

        // verify existence
        let id = await this.runner.findIdentity(token.provider, profile.id);

        if (id) {
            // existed
            if (userId && userId != id.userId.toString()) {
                throw error.set("existed", "the account has been linked.")
            }

            // update token info
            id.accessToken = token.access_token
            id.refreshToken = token.refresh_token || id.refreshToken
            id.issuedAt = new Date()

            await this.runner.updateIdentity(id);

            userId = id.userId
        } else {
            // not existed
            if (userId) {
                // link to current user   
                userId = this.runner.convertUserId(userId)
            } else {
                // create user
                let userInput = {
                    username: profile.username,
                    portraitUrl: profile.portraitUrl
                } as FultonUser

                if (profile.email) {
                    userInput.emails = [profile.email]
                }

                userInput.registeredAt = new Date()

                user = await this.runner.addUser(userInput);
                userId = user.id;
            }

            id = await this.runner.addIdentity({
                type: token.provider,
                userId: userId,
                accessToken: token.access_token,
                refreshToken: token.refresh_token,
                username: profile.username,
                email: profile.email,
                sourceUserId: profile.id
            })
        }

        if (user) {
            return user;
        } else {
            return this.runner.findUserById(userId);
        }
    }

    loginByAccessToken(token: string): Promise<FultonUser> {
        if (jws.verify(token, "HS256", this.jwtSecret)) {
            return this.runner.findUserByToken(token);
        } else {
            return Promise.reject("Invalid Token");
        }
    }

    async issueAccessToken(user: IFultonUser): Promise<AccessToken> {
        let token = this.encryptJwtToken(user)

        let userToken: FultonAccessToken = {
            token: token,
            issuedAt: new Date(),
            expiredAt: new Date(Date.now() + (this.options.accessToken.duration * 1000)),
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

    private sendWelcomeNotification(user: FultonUser) {
        var opts = this.options.register.notiication
        if (opts.email.enabled && user.emails.length > 0) {
            var message: NotificationMessage = {
                email: {
                    to: user.emails[0],
                    subjectTemplate: opts.email.subjectTemplate,
                    bodyTemplate: opts.email.bodyTemplate,
                    variables: user
                }
            }

            this.app.sendNotifications(message);
        }
    }

    private verifyUserName(error: FultonError, input: any) {
        if (error.verifyRequired(input, "username")) {
            let unResult: boolean;
            if (this.options.register.usernameVerifier instanceof Function) {
                unResult = this.options.register.usernameVerifier(input.username)
            } else {
                unResult = this.options.register.usernameVerifier.test(input.username)
            }

            if (!unResult) {
                error.addDetail("username", "invalid", "the username is invalid")
            }
        }
    }

    private verifyPassword(error: FultonError, input: any) {
        if (error.verifyRequired(input, "password")) {
            let pwResult: boolean;
            if (this.options.register.passwordVerifier instanceof Function) {
                pwResult = this.options.register.passwordVerifier(input.password)
            } else {
                pwResult = this.options.register.passwordVerifier.test(input.password)
            }

            if (!pwResult) {
                error.addDetail("password", "invalid", "the password is invalid")
            }
        }
    }

    private verifyEmail(error: FultonError, input: any) {
        if (error.verifyRequired(input, "email")) {
            if (!validator.isEmail(input.email)) {
                error.addDetail("email", "invalid", "the email is invalid")
            }
        }
    }

    private encryptJwtToken(user: IFultonUser): string {
        let payload: JWTPayload = {
            id: user.id
        };

        this.options.accessToken.scopes.forEach(scope => {
            if (scope == "profile") {
                payload.username = user.username;
                payload.portraitUrl = user.portraitUrl;
            }

            payload[scope] = user[scope];
        });

        let cipher = crypto.createCipher("aes-128-ecb", this.cipherPassword);

        var encryptedPayload;
        if (this.options.accessToken.secureLevel == "low") {
            // if level is low, the payload is plain text
            encryptedPayload = payload
        } else {
            // if level greater than low, encrypt the payload 
            // java only support aes 128
            let cipher = crypto.createCipher("aes-128-ecb", this.cipherPassword)
            encryptedPayload = cipher.update(JSON.stringify(payload), "utf8", "base64");
            encryptedPayload += cipher.final("base64");
        }

        var token = jws.sign({
            header: {
                alg: "HS256"
            },
            secret: this.jwtSecret,
            payload: encryptedPayload
        });

        return token
    }

    private decryptJwtToken(token: string): JWTPayload {
        let jwt = jws.decode(token);
        let json;

        if (typeof jwt.payload == "string" && jwt.payload.startsWith("{")) {
            // plain text payload
            json = jwt.payload
        } else {
            // aes encrypted payload
            let decipher = crypto.createDecipher("aes-128-ecb", this.cipherPassword)
            json = decipher.update(jwt.payload, "base64", "utf8");
            json += decipher.final();
        }

        var payload: JWTPayload = JSON.parse(json);

        if (payload.id) {
            payload.id = this.runner.convertUserId(payload.id)             
        }

        return payload;
    }
}