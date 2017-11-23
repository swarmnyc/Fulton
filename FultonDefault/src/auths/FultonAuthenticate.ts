import { User } from "./User";
import { FultonContext } from "../FultonContext";
import { IFultonAuthenticate } from "Fulton";

export class FultonAuthenticate implements IFultonAuthenticate{
    authenticate(context: FultonContext): User {
        throw new Error("Method not implemented.");
    }
    
}