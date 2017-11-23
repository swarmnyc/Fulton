import { User } from "./auths/User";
import { IFultonContext, ILogger} from "fulton";

export class FultonContext implements IFultonContext<User>{
    user: User;
    logger: ILogger;
}