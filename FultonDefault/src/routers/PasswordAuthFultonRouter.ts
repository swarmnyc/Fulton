import { IFultonRouter, Post } from "Fulton";
import { FultonContext } from "../FultonContext";

export class PasswordAuthFultonRouter implements IFultonRouter {
    @Post("")
    auth(context: FultonContext): void {

    }
}