import { Repository } from "typeorm";
import { Inject, Injectable } from "../../interfaces";
import { IUserService } from "../interfaces";
import { FultonUserRepository } from "../index";
import { FultonUser } from "./fulton-user";
import { AccessToken } from "../../index";

import * as passwordHash from 'password-hash';

@Injectable()
export class FultonUserService implements IUserService<FultonUser> {
    constructor(private userRepository: FultonUserRepository) {
    }

    register(user: FultonUser): Promise<FultonUser> {
        throw new Error("Method not implemented.");
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

    checkRoles(user: FultonUser, ...roles:string[]): boolean{
        return false;
    }

    resetPassword(email: string) {

    }
}