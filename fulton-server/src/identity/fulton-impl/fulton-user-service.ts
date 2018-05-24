import * as jws from 'jws';
import * as lodash from 'lodash';
import * as passwordHash from 'password-hash';
import * as validator from 'validator';
import { AccessToken, ForgotPasswordModel, ForgotPasswordNotificationModel, IFultonUser, IOauthProfile, IUserService, RegisterModel, WelcomeNotificationModel, IFultonIdentity } from '../interfaces';
import { codeGenerate, numberCodeGenerate } from '../../helpers/crypto-helper';
import { DiKeys, EventKeys } from '../../keys';
import { EntityMetadata } from 'typeorm/metadata/EntityMetadata';
import { ErrorCodes } from '../../common/fulton-error';
import { FultonAccessToken, FultonIdentity, FultonUser } from './fulton-user';
import { FultonError } from '../../common';
import { getManager, MongoEntityManager, MongoRepository } from 'typeorm';
import { Helper } from '../../helpers/helper';
import { IdentityOptions } from '../identity-options';
import { IFultonApp } from '../../fulton-app';
import { inject, injectable, NotificationMessage, Request } from '../../interfaces';
import { ObjectId } from 'bson';

interface JWTPayload {
    id: string;
    ts: number; // timestamp

    username?: string;
    portraitUrl?: string;
    email?: string;
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
    findUserById(userId: any): Promise<FultonUser>;
    findUserByLocal(usernameOrEmail: string, password: string): Promise<FultonUser>;
    findUserByOauth(type: string, sourceUserId: string): Promise<FultonUser>;
    findIdentities(user:IFultonUser): Promise<FultonIdentity[]>
    findIdentity(type: string, sourceUserId: string): Promise<FultonIdentity>;
    findIdentityByLocal(usernameOrEmail: string): Promise<FultonIdentity>;
    findIdentityByLocalResetToken(token: string, code: string): Promise<FultonIdentity>;
    findUserByToken(token: string): Promise<FultonUser>;
    countUserName(name: string): Promise<number>;
    countUserEmail(email: string): Promise<number>;
}

class MongoRunner implements IRunner {
    userRepository: MongoRepository<FultonUser>
    identityRepository: MongoRepository<FultonIdentity>
    tokenRepository: MongoRepository<FultonAccessToken>

    constructor(private app: IFultonApp, private manager: MongoEntityManager) {
        this.userRepository = manager.getMongoRepository(FultonUser) as any
        this.identityRepository = manager.getMongoRepository(FultonIdentity) as any
        this.tokenRepository = manager.getMongoRepository(FultonAccessToken) as any

        this.updateMetadata(this.userRepository.metadata);
        this.updateMetadata(this.identityRepository.metadata);
        this.updateMetadata(this.tokenRepository.metadata);
    }

    convertUserId(userId: any): ObjectId {
        return new ObjectId(userId)
    }

    updateMetadata(metadata: EntityMetadata) {
        // make metadata is for mongo 
        let idColumn = metadata.ownColumns.find((c) => c.propertyName == "id")

        idColumn.isObjectId = true;
        idColumn.givenDatabaseName =
            idColumn.databaseNameWithoutPrefixes =
            idColumn.databaseName = "_id";

        metadata.generatedColumns = [idColumn]
        metadata.objectIdColumn = idColumn
    }

    addUser(user: FultonUser): Promise<FultonUser> {
        return this.userRepository.insertOne(user).then((result) => {
            user["id"] = result.insertedId;
            return user;
        });
    }

    addAccessToken(accesstoken: FultonAccessToken): Promise<any> {
        return this.tokenRepository.insertOne(accesstoken);
    }

    addIdentity(identity: FultonIdentity): Promise<any> {
        return this.identityRepository.insertOne(identity);
    }

    updateIdentity(identity: FultonIdentity): Promise<any> {
        let id = identity.id
        delete identity.id
        return this.identityRepository.updateOne({ "_id": id }, { $set: identity }).then(() => {
            identity.id = id
        });
    }

    countUserName(name: string): Promise<number> {
        return this.identityRepository.count({
            "type": "local",
            username: name,
        })
    }

    countUserEmail(email: string): Promise<number> {
        return this.identityRepository.count({
            "type": "local",
            email: email,
        })
    }

    async findUserById(userId: any): Promise<FultonUser> {
        return this.userRepository.findOne(userId);
    }

    async findUserByLocal(nameOrEmail: string, password: string): Promise<FultonUser> {
        var id = await this.identityRepository.findOne({
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
        var id = await this.identityRepository.findOne({
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

    findIdentities(user:IFultonUser): Promise<FultonIdentity[]> {
        return this.identityRepository.find({
            "userId": user.id
        });
    }

    findIdentity(type: string, sourceUserId: string): Promise<FultonIdentity> {
        return this.identityRepository.findOne({
            "type": type,
            "sourceUserId": sourceUserId
        });
    }

    findIdentityByLocal(nameOrEmail: string): Promise<FultonIdentity> {
        return this.identityRepository.findOne({
            "type": "local",
            "$or": [
                { username: nameOrEmail },
                { email: nameOrEmail }
            ]
        } as any);
    }

    findIdentityByLocalResetToken(token: string, code: string): Promise<FultonIdentity> {
        return this.identityRepository.findOne({
            "type": "local",
            "resetPasswordCode": code,
            "resetPasswordToken": token,
            "resetPasswordExpiredAt": { "$gt": new Date() }
        } as any);
    }
}

@injectable()
export class FultonUserService implements IUserService<FultonUser> {
    private runner: IRunner;

    constructor(@inject(DiKeys.FultonApp) protected app: IFultonApp) {
        let manager = getManager(app.options.identity.databaseConnectionName)

        if (manager instanceof MongoEntityManager) {
            this.runner = new MongoRunner(app, manager)
        } else {
            //this.runner = new SqlRunner(manager)
        }
    }

    private get options(): IdentityOptions {
        return this.app.options.identity;
    }

    get currentUser(): IFultonUser {
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
        var username = input.username
        var email = input.email
        var password = input.password

        this.verifyUserName(error, username)
        this.verifyPassword(error, password)
        this.verifyEmail(error, email)

        if (error.hasError()) {
            throw error;
        }

        // verify existence
        let lUsername = username.toLocaleLowerCase()
        let count = await this.runner.countUserName(lUsername);

        if (count > 0) {
            error.addDetail("username", "existed", "the username is existed")
        }

        let lEmail = email.toLocaleLowerCase()
        count = await this.runner.countUserEmail(lEmail);

        if (count > 0) {
            error.addDetail("email", "existed", "the email is existed")
        }

        if (error.hasError()) {
            throw error;
        }

        // add user
        let userInput = {
            username,
            email: input.email,
            registeredAt: new Date()
        } as FultonUser;

        if (input["portraitUrl"]) {
            userInput.portraitUrl = input["portraitUrl"]
        }

        if (registerOptions.otherFields.length > 0) {
            Object.assign(userInput, lodash.pick(input, registerOptions.otherFields))
        }

        let user = await this.runner.addUser(userInput);

        // add local itentity
        var hashedPassword = passwordHash.generate(password, registerOptions.passwordHashOptions);

        await this.runner.addIdentity({
            type: "local",
            userId: user.id,
            email: lEmail,
            username: lUsername,
            hashedPassword: hashedPassword
        })

        this.sendWelcomeNotification({
            username: user.username,
            email: email
        });

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
            this.app.events.emit(EventKeys.UserDidLogin, user);

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
        let identity = await this.runner.findIdentity(token.provider, profile.id);

        if (identity) {
            // existed
            if (userId && userId != identity.userId.toString()) {
                throw error.set("existed", "the account has been linked.")
            }

            // update token info
            identity.accessToken = token.access_token
            identity.refreshToken = token.refresh_token || identity.refreshToken
            identity.issuedAt = new Date()

            await this.runner.updateIdentity(identity);

            userId = identity.userId
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
                    userInput.email = profile.email
                }

                userInput.registeredAt = new Date()

                user = await this.runner.addUser(userInput);
                userId = user.id;
            }

            identity = await this.runner.addIdentity({
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
            this.app.events.emit(EventKeys.UserDidLogin, user);

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
        let token = this.encodeJwtToken(user)

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

    async forgotPassword(usernameOrEmail: string): Promise<ForgotPasswordModel> {
        let identity = await this.runner.findIdentityByLocal(usernameOrEmail);
        if (identity) {
            let token = identity.resetPasswordToken = codeGenerate()
            let code = identity.resetPasswordCode = numberCodeGenerate()

            identity.resetPasswordExpiredAt = new Date(Date.now() + this.options.forgotPassword.duration * 1000)

            await this.runner.updateIdentity(identity);

            let user = await this.runner.findUserById(identity.userId);

            this.app.events.emit(EventKeys.UserForgotPassword, identity);

            var url = Helper.urlJoin(this.app.baseUrl, this.options.forgotPassword.path)
            this.sendForgotPasswordNotification({
                username: user.username,
                email: identity.email,
                url: `${url}?token=${token}&code=${code}`,
                token: token,
                code: code
            })

            return {
                token: token,
                expires_in: this.options.forgotPassword.duration
            }
        } else {
            throw new FultonError(ErrorCodes.NotExisted)
        }
    }

    async resetPassword(token: string, code: string, password: string): Promise<void> {
        let error = new FultonError("ErrorCodes.Invalid")

        if (this.verifyPassword(error, password)) {
            let identity = await this.runner.findIdentityByLocalResetToken(token, code)

            if (identity) {
                identity.hashedPassword = passwordHash.generate(password, this.options.register.passwordHashOptions)
                identity.resetPasswordCode = null;
                identity.resetPasswordToken = null;
                identity.resetPasswordExpiredAt = null;

                this.runner.updateIdentity(identity);

                this.app.events.emit(EventKeys.UserDidResetPassword, identity);
            } else {
                throw error.set(ErrorCodes.Invalid, "the reset token and code are invalid");
            }
        } else {
            throw error;
        }
    }

    verifyResetPassword(token: string, code: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.runner.findIdentityByLocalResetToken(token, code).then((identity) => {
                if (identity == null) {
                    reject(new FultonError(ErrorCodes.Invalid, "the reset token and code are invalid"))
                } else {
                    resolve()
                }
            }).catch(reject);
        })
    }

    refreshAccessToken(token: string): Promise<AccessToken> {
        throw new Error("Method not implemented.");
    }

    getUserIdentities(user: IFultonUser): Promise<IFultonIdentity[]> {
        return this.runner.findIdentities(user);
    }

    private get jwtSecret(): string | Buffer {
        return this.options.accessToken.secret || this.app.appName;
    }

    private sendWelcomeNotification(model: WelcomeNotificationModel) {
        var opts = this.options.register.notification
        if (opts.extraVariables) {
            Object.assign(model, opts.extraVariables)
        }
        if (opts.email.enabled && model.email) {
            var message: NotificationMessage = {
                email: {
                    to: model.email,
                    subjectTemplate: opts.email.subjectTemplate,
                    bodyTemplate: opts.email.bodyTemplate,
                    variables: model
                }
            }

            this.app.sendNotifications(message);
        }
    }

    private sendForgotPasswordNotification(model: ForgotPasswordNotificationModel) {
        var opts = this.options.forgotPassword.notification
        if (opts.extraVariables) {
            Object.assign(model, opts.extraVariables)
        }
        if (opts.email.enabled && model.email) {
            var message: NotificationMessage = {
                email: {
                    to: model.email,
                    subjectTemplate: opts.email.subjectTemplate,
                    bodyTemplate: opts.email.bodyTemplate,
                    variables: model
                }
            }

            this.app.sendNotifications(message);
        }
    }

    private verifyUserName(error: FultonError, username: any) {
        if (error.verifyRequired(username, "username")) {
            let unResult: boolean;
            if (this.options.register.usernameVerifier instanceof Function) {
                unResult = this.options.register.usernameVerifier(username)
            } else {
                unResult = this.options.register.usernameVerifier.test(username)
            }

            if (!unResult) {
                error.addDetail("username", "invalid", "the username is invalid")
            }
        }
    }

    private verifyPassword(error: FultonError, password: any): boolean {
        let pwResult: boolean = false;

        if (error.verifyRequired(password, "password")) {
            if (this.options.register.passwordVerifier instanceof Function) {
                pwResult = this.options.register.passwordVerifier(password)
            } else {
                pwResult = this.options.register.passwordVerifier.test(password)
            }

            if (!pwResult) {
                error.addDetail("password", "invalid", "the password is invalid")
            }
        }

        return pwResult;
    }

    private verifyEmail(error: FultonError, email: string) {
        if (error.verifyRequired(email, "email")) {
            if (!validator.isEmail(email)) {
                error.addDetail("email", "invalid", "the email is invalid")
            }
        }
    }

    private encodeJwtToken(user: IFultonUser): string {
        let payload: JWTPayload = {
            id: user.id,
            ts: Date.now()
        };

        this.options.accessToken.scopes.forEach(scope => {
            payload[scope] = user[scope];
        });

        var token = jws.sign({
            header: {
                alg: "HS256"
            },
            secret: this.jwtSecret,
            payload: payload
        });

        return token
    }

    private decodeJwtToken(token: string): JWTPayload {
        let jwt = jws.decode(token);
        let json;

        var payload: JWTPayload = JSON.parse(json);

        if (payload.id) {
            payload.id = this.runner.convertUserId(payload.id)
        }

        return payload;
    }
}