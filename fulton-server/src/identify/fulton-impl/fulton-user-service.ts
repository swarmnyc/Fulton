import * as passwordHash from 'password-hash';
import * as lodash from 'lodash';

import { AccessToken, IFultonUser, IUserService, IUserRegister } from "../interfaces";
import { Inject, Injectable } from "../../interfaces";

import { FultonApp } from "../../fulton-app";
import { FultonError } from "../../common";
import { FultonUser } from "./fulton-user";
import { Repository } from "typeorm";
import { isFunction } from 'util';
import { throws } from 'assert';
import { MongoEntityManager } from 'typeorm/entity-manager/MongoEntityManager';

@Injectable()
export class FultonUserService implements IUserService<FultonUser> {
    @Inject(FultonApp)
    protected app: FultonApp;

    @Inject("UserRepository")
    private userRepository: Repository<FultonUser>;

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
        let registorOptions = this.app.options.identify.register;
       
        // verify username, password, email
        errors.verifyRequireds(input, ["username", "password", "email"])

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

        if (errors.hasErrors) {
            throw errors;
        }

        let fileds = ["username", "email"].concat(registorOptions.otherFileds);
        let newUser = lodash.pick(input, fileds) as FultonUser;
        
        newUser.email = newUser.email.toLocaleLowerCase();
        newUser.username = newUser.username.toLocaleLowerCase(); 

        // verify existence
        let count = await this.userRepository.count({
            username: newUser.username,
        });

        if (count > 0) {
            errors.addError("username", "the username is existed.")
            throw errors;
        }

        count = await this.userRepository.count({
            email: input.email,
        });

        if (count > 0) {
            errors.addError("email", "the email is existed.")
            throw errors;
        }

        newUser.hashedPassword = passwordHash.generate(input.password, registorOptions.passwordHashOptons);

        return this.userRepository.save(newUser);
    }

    login(username: string, password: string): Promise<FultonUser> {

        //passwordHash.verify(password, user.hashedPassword)
        throw new Error("Method not implemented.");
    }

    loginByOauth(soruce: string, profile: any): Promise<FultonUser> {
        throw new Error("Method not implemented.");
    }

    findByAccessToken(token: string): Promise<FultonUser> {
        throw new Error("Method not implemented.");
    }

    issueAccessToken(user: FultonUser): Promise<AccessToken> {
        throw new Error("Method not implemented.");
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