import * as passwordHash from 'password-hash';

import { Inject, Injectable } from "../../interfaces";

import { AccessToken } from "../../index";
import { FultonApp } from "../../fulton-app";
import { FultonUser } from "./fulton-user";
import { IUserService } from "../interfaces";
import { Repository } from "typeorm";

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

    checkRoles(user: FultonUser, ...roles: string[]): boolean {
        return false;
    }

    resetPassword(email: string) {

    }

    refreshAccessToken(token: string): Promise<AccessToken> {
        throw new Error("Method not implemented.");
    }
}