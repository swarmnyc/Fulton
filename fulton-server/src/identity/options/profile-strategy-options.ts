import { AuthenticateOptions, LocalStrategyVerifier } from '../interfaces';
import { BaseOptions } from '../../options/options';
import { Env } from '../../helpers';
import { HttpMethod, Middleware, PathIdentifier } from '../../interfaces';
import { StrategyOptions } from './strategy-options';
import * as lodash from 'lodash';

/**
 * the setting for profile
 */
export class ProfileOptions extends BaseOptions<ProfileOptions> {
    /**
     * if true, the server supports return current user's profile and update it. 
     * The default value is true
     * it can be overridden by process.env["{appName}.options.identity.profile.enabled"]
     */
    enabled?: boolean = true;

    /**
     * the path of profile, the default value is "/auth/profile"
     */
    path?: string;

    /**
     * the fields of output, the default value is ["id", "username", "email"]
     */
    readFields?: string[];

    /**
     * the fields of output, the default value is ["id", "username", "email", "password"]
     */
    writeFields?: string[]

    constructor(protected appName?: string, protected appMode?: string, protected type?: string) {
        super(appName, appMode);

        this.enabled = true;
        this.path = "/auth/profile";
    }

    init?(): void {
        this.enabled = Env.getBoolean(`${this.appName}.options.identity.login.enabled`, this.enabled)
    }
}