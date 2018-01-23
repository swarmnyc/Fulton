import { PathIdentifier } from "../interfaces";
import { LocalStrategyAuthenticate, IUserManager } from "./interfaces";
import { Strategy } from "passport";

export class IdentifyOptions {
    /**
     * the default value is false
     */
    enabled?: boolean;

    userManager?: IUserManager;

    routerAuthorizes: any[];

    local: {
        enabled?: boolean;
        path?: PathIdentifier;
        authenticate: LocalStrategyAuthenticate;
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

    }

    /**
     * load options from environment to override the current options 
     */
    loadEnvOptions() {
        let prefix = `${this.appName}.options`;
        // this.cors.enabled = Env.getBoolean(`${prefix}.cors.enabled`, this.cors.enabled)
    }
}