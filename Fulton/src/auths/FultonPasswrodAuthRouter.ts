import { FultonAuthRouter } from "./FultonAuthRouter";
import { Post, IFultonContext } from "../index";

export class FultonPasswordAuthRouter extends FultonAuthRouter {
    @Post("/password")
    auth(context: IFultonContext): void {

    }
}