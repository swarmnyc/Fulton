import { FultonApp } from "./fulton-app";
import { IUserService, IUser } from "./identity";
import { DiContainer, QueryParams } from "./interfaces";

// custom types for helping development;
declare global {
    namespace Express {
        interface Request {
            fultonApp?: FultonApp;
            userService?: IUserService<IUser>;
            container?: DiContainer;
            queryParams?: QueryParams;
        }

        interface Response {
        }
    }

}