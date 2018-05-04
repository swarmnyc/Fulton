import { BaseOptions } from '../../options/options';
import { Env } from '../../helpers';
import { Dict } from '../../interfaces';

export class IdentityEmailNotificationOptions extends BaseOptions<IdentityEmailNotificationOptions> {
    /**
     * the default value is true
     * it can be overridden by process.env["{appName}.options.identity.{type}.email.enabled"]
     */
    enabled?: boolean = true;
    /**
     * the template for subject, the value can be text or filepath
     */
    subjectTemplate?: string;

    /**
     * the template for body, the value can be text or filepath
     */
    bodyTemplate?: string;
}

export class IdentityNotificationOptions extends BaseOptions<IdentityNotificationOptions> {
    /**
     * the options for email notification
     */
    readonly email = new IdentityEmailNotificationOptions(this.appName, this.appMode);

    /**
     * the extra variables pass to template engine
     */
    extraVariables?: Dict

    constructor(protected appName?: string, protected appMode?: string, protected type?: string) {
        super(appName, appMode);
    }

    init?(): void {
        this.email.enabled = Env.getBoolean(`${this.appName}.options.identity.${this.type}.email.enabled`, this.email.enabled);
    }
}