import { Middleware } from "../../alias";
import { Env } from '../../helpers';
import { PathIdentifier } from '../../interfaces';
import { BaseOptions } from '../../options/options';
import { AuthenticateOptions } from '../interfaces';

/**
 * the setting for logout to revoke access token
 */
export class LogoutOptions extends BaseOptions<LogoutOptions> {
    /**
     * the default value is true
     * it can be overridden by process.env["{appName}.options.identity.logout.enabled"]
     */
    enabled?: boolean = true;

    /**
     * the default value is /auth/login
     */
    path?: PathIdentifier = "/auth/logout";

    /**
     * the handler for register
     * the default value is FultonIdentityImpl.logoutHandler
     */
    handler?: Middleware;

    /**
     * the options for response
     */
    responseOptions?: AuthenticateOptions;

    init?(): void {
        this.enabled = Env.getBoolean(`${this.appName}.options.identity.register.enabled`, this.enabled);

        if (this.appMode == "web-view" && this.responseOptions == null) {
            this.responseOptions = {
                failureRedirect: "/auth/logout",
                successRedirect: "/"
            };
        }
    }
}