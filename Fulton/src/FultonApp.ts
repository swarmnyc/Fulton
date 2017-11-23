import { IFultonRouter, AuthFultonRouter } from "./routers/FultonRouter";
import { Type } from "./cores/Type";
import { IFultonAuthenticate } from "./auths/IFultonAuthenticate";
import { IUser } from "./auths/IUser";
import { IUserManager } from "./auths/IUserManager";

export interface FultonAppOptions {
    oauthServerSupport: boolean;    
}

export abstract class FultonApp {
    oauthServerSupport: boolean;        

    // return a user manager for create user and 
    abstract userManager(): IUserManager<IUser>

    // default take token or cookie to User, router can overwrite
    abstract defaultAuthenticates() : IFultonAuthenticate[]

    // check permission
    abstract defaultAuthorizes() : IFultonRouter[]

    // auth rotuers like google, facebook, password
    abstract authRouters() : AuthFultonRouter[]

    // regular routers
    abstract routers() : IFultonRouter[]

    //Dependency Injections
    abstract privoiders() : Array<Type<any>>
}
