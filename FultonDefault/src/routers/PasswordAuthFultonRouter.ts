import { IFultonRouter, Post, IFultonContext } from "Fulton";

export class PasswordAuthFultonRouter implements IFultonRouter {
    @Post("")
    auth(context: IFultonContext): void {

    }
}