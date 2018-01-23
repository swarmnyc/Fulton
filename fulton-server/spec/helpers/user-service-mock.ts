import { FultonUser, IUserService } from "../../src/index";

export class UserServiceMock implements IUserService {
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
    issueAccessToken(user: FultonUser): void {
        throw new Error("Method not implemented.");
    }
    checkRoles(user: FultonUser, ...roles: string[]): boolean {
        throw new Error("Method not implemented.");
    }
    resetPassword(email: string): void {
        throw new Error("Method not implemented.");
    }
}