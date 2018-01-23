import { Repository } from "typeorm";
import { Inject, Injectable } from "../../interfaces";
import { IUserService } from "../interfaces";
import { FultonUserRepository } from "../index";
import { FultonUser } from "./fulton-user";


@Injectable()
export class FultonUserService implements IUserService {
    constructor(private userRepository: FultonUserRepository) {

    }

    find(username: string, password: string): FultonUser {
        throw new Error("Method not implemented.");
    }

    findByOauth(soruce: string, profile: any): FultonUser {
        throw new Error("Method not implemented.");
    }

    findByToken(token: string): FultonUser {
        throw new Error("Method not implemented.");
    }

    register(user: FultonUser): Promise<FultonUser> {
        throw new Error("Method not implemented.");
    }

    issueToken(user: FultonUser, save: boolean = true) {

    }

    resetPassword(email: string) {

    }
}