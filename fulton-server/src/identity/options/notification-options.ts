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
         */
        subjectTemplate?: string;

        /**
         * the template for body, the value can be text or filepath
         */
        bodyTemplate?: string;
    }

    constructor(protected appName?: string, protected appMode?: string, protected type?: string) {
        super(appName, appMode);
    }

    init?(): void {
        if (this.email == null) {
            this.email = {
                enabled: true
            }
        }

        this.email.enabled = Env.getBoolean(`${this.appName}.options.identity.${this.type}.email.enabled`, this.email.enabled);
    }
}