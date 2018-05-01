import { BaseOptions } from '../../options/options';
import { Env } from '../../helpers';

export class IdentityNotificationOptions extends BaseOptions<IdentityNotificationOptions> {
    /**
     * the options for email notification
     */
    email?: {
        /**
         * the default value is true
         * it can be overridden by process.env["{appName}.options.identity.{type}.email.enabled"]
         */
        enabled?: boolean;
        /**
         * the template for subject, the value can be text or filepath
         * the default value is "Welcome to {appName}"
         */
        subjectTemplate?: string;

        /**
         * the template for body, the value can be text or filepath
         * the default value is "./templates/email-welcome.html"
         */
        bodyTemplate?: string;
    }

    constructor(protected appName?: string, protected appMode?: string, protected type?: string) {
        super(appName, appMode);
    }

    init?(): void {
        if (this.email == null) {
            this.email = {
                enabled: true,
                subjectTemplate: `Welcome to ${this.appName}`,
                bodyTemplate: "./templates/email-welcome.html"
            }
        }

        this.email.enabled = Env.getBoolean(`${this.appName}.options.identity.${this.type}.email.enabled`, this.email.enabled);
    }
}