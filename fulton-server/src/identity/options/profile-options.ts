import { Env } from '../../helpers';
import { BaseOptions } from '../../options/options';

/**
 * the setting for profile
 */
export class ProfileOptions extends BaseOptions<ProfileOptions> {
    /**
     * if true, the server supports return current user's profile
     * The default value is true
     * it can be overridden by process.env["{appName}.options.identity.profile.enabled"]
     */
    enabled?: boolean = true;

    /**
     * if true, the server supports update user's profile. 
     * The default value is true
     * it can be overridden by process.env["{appName}.options.identity.profile.updateEnabled"]
     */
    updateEnabled?: boolean = true;

    /**
     * if true, the server supports update user's local identity (username, email, password). 
     * The default value is true
     * it can be overridden by process.env["{appName}.options.identity.profile.updateLocalIdentityEnabled"]
     */
    updateLocalIdentityEnabled?: boolean = true;

    /**
     * the path of profile, the default value is "/auth/profile"
     */
    path?: string = "/auth/profile";

    /**
     * the path of updating user local identity, the default value is "/auth/profile/local"
     */
    updateLocalIdentityPath?: string = "/auth/profile/local"

    /**
     * the fields that can be read, the default value is ["id", "displayName", "email"]
     */
    readableFields?: string[] = ["id", "displayName", "email", "portraitUrl"];

    /**
     * the fields that can be update, the default value is ["displayName", "email", "password", "portraitUrl"]
     */
    updatableFields?: string[] = ["displayName", "email", "password", "portraitUrl"];

    constructor(protected appName?: string, protected appMode?: string, protected type?: string) {
        super(appName, appMode);
    }

    init?(): void {
        this.enabled = Env.getBoolean(`${this.appName}.options.identity.profile.enabled`, this.enabled);
        this.updateEnabled = Env.getBoolean(`${this.appName}.options.identity.profile.updateEnabled`, this.updateEnabled)
        this.updateLocalIdentityEnabled = Env.getBoolean(`${this.appName}.options.identity.profile.updateLocalIdentityEnabled`, this.updateLocalIdentityEnabled)
    }
}