import { IFultonApp } from "./fulton-app";
import { IUserService, IUser } from "./identity";
import { DiContainer, QueryParams } from "./interfaces";
import { RelatedToMetadata } from './entities/entity-decorators-helpers';

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

    interface String {
        /**
         * compare two strings are the same or not with case insesitive 
         */
        same(str: any): boolean
    }
}

declare module "typeorm/metadata/EntityMetadata" {
    interface EntityMetadata {
        relatedToMetadata: RelatedToMetadata
    }
}


/**
 * compare two strings are the same or not with case insesitive 
 */
String.prototype.same = function (str: any) {
    if (str == null) return false;
    if (typeof str != "string") return false;

    return this.toLowerCase() == str.toLowerCase();
}