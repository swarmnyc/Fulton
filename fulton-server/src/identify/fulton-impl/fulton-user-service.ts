import { Repository } from "typeorm";
import { Inject, Injectable } from "../../interfaces";
import { IUserService } from "../interfaces";
import { FultonUserRepository } from "../index";
import { FultonUser } from "./fulton-user";


@Injectable()
export class FultonUserService implements IUserService {
    constructor(private userRepository: FultonUserRepository) {

    }

    register(user: FultonUser): Promise<FultonUser> {
        throw new Error("Method not implemented.");
    }

    login(username: string, password: string): FultonUser {
        throw new Error("Method not implemented.");
    }

    loginByOauth(soruce: string, profile: any): FultonUser {
        throw new Error("Method not implemented.");
    }

    findByAccessToken(token: string): FultonUser {
        throw new Error("Method not implemented.");
    }

    issueAccessToken(user: FultonUser) {
    }

    checkRoles(user: FultonUser, ...roles:string[]): boolean{
        return false;
    }

    resetPassword(email: string) {

    }
}