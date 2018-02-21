import { IFultonApp } from "./fulton-app";
import { IUserService, IUser } from "./identity";
import { DiContainer, QueryParams } from "./interfaces";
import { RelatedToMetadata } from './entities/related-decorators-helpers';

// custom types for helping development;
declare global {
    namespace Express {
        interface Request {
            fultonApp?: IFultonApp;
            userService?: IUserService<IUser>;
            container?: DiContainer;
            queryParams?: QueryParams;
        }

        interface Response {
        }
    }
}

declare module "typeorm/metadata/EntityMetadata" {
    interface EntityMetadata {
        relatedToMetadata: RelatedToMetadata
    }
}