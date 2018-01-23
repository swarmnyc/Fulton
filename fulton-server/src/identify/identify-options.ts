import { PathIdentifier } from "../interfaces";
import { LocalStrategyAuthenticate, IUserService } from "./interfaces";
import { Strategy } from "passport";
import { Middleware, FultonUserService, Type } from "../index";
import Env from "../helpers/env";
import { AuthorizeOptions } from "./authorizes";

export class IdentifyOptions {
    /**
     * the default value is false
     */
    enabled: boolean;

    /**
     * the default value is FultonUserService
     */
    userService: Type<IUserService>;

    /**
     * For api mode
     * the default value is { failureStatusCode: true }
     * 
     * For web mode
     * the default value is { failureRedirect: '/auth/login' }
     */
    defaultAuthorizeOptions: AuthorizeOptions

    local: {
        enabled?: boolean;
        path?: PathIdentifier;
        redirectPath: string;
        authenticate?: LocalStrategyAuthenticate;
        
        /**
         * For api mode
         * the default value is issureAccessTokenMiddleware
         * 
         * For web mode
         * the default value is redirectMiddleware
         */
        response?: Middleware;
    }

    bearer: {
        enabled?: boolean;
        authenticate: LocalStrategyAuthenticate;
    }

    google: {
        enabled: boolean;
        path: PathIdentifier;
        callbackPath: PathIdentifier;
    }

    /** other passport stratogies */
    strategies: Strategy[];

    constructor(private appName: string) {
        this.enabled = false;
    }

    /**
     * load options from environment to override the current options 
     */
    loadEnvOptions() {
        let prefix = `${this.appName}.options.identify`;

        this.enabled = Env.getBoolean(`${prefix}.enabled`, this.enabled);

        this.userService = FultonUserService;
    }
}