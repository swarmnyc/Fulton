import { BaseOptions } from '../../options/options';
import { Env } from '../../helpers';
import { IdentityNotificationOptions } from './notification-options';
import { Middleware } from '../../alias';

/**
 * options for forgot password
 * there are three methods
 * 1.
 * POST /auth/forgot-password, for send reset code notification
 * BODY { username?, email? }
 * 
 * 2.  
 * POST /auth/verify-reset-password
 * BODY { token, code}
 * 
 * 3.  
 * POST /auth/reset-password
 * BODY { token, code, password}
 */
export class ForgotPasswordOptions extends BaseOptions<ForgotPasswordOptions> {
    /**
     * the default value is true
     * it can be overridden by process.env["{appName}.options.identity.forgot-password.enabled"]
     */
    enabled?: boolean = true;

    /**
     * the path for require password
     * the default value is /auth/forgot-password
     */
    requirePath?: string = "/auth/forgot-password";

    /**
     * the path for require password
     * the default value is /auth/verify-reset-password-code
     */
    verifyPath?: string = "/auth/verify-reset-password";

    /**
     * the path for require password
     * the default value is /auth/verify-reset-password-code
     */
    resetPath?: string = "/auth/reset-password";

    /**
     * the duration of reset password token in milliseconds
     * 
     * default is 30 minutes = 1,800,000
     */
    duration?: number = 1_800_000;

    /**
     * the handler for revoke forgot password
     * the default value is FultonIdentityImpl.forgotPasswordHandler
     */
    handler?: Middleware;

    /**
     * the try limits for failure,
     * the default value is 3
     */
    tryLimit?: number = 3;

    /**
     * fails if the user require forgot password more this limit,
     * the default value is 10
     */
    requireLimit?: number = 10;

    /**
     * if users require over the requireLimit, than lock for the given time in milliseconds.
     * the default value is 30 mins, not long because it only punishes bots. 
     */
    requireLockTime?: number = 1_800_000

    /**
     * the options for notification
     * the default value for email.subjectTemplate is `{appName} Forgot Password`
     * the default value for email.bodyTemplate is `./templates/email-forgot-password.html`
     */
    readonly notification?= new IdentityNotificationOptions(this.appName, this.appMode, "forgot-password");

    init?(): void {
        this.enabled = Env.getBoolean(`${this.appName}.options.identity.forgot-password.enabled`, this.enabled);

        this.notification.init()

        if (this.notification.email.subjectTemplate == null) {
            this.notification.email.subjectTemplate = `${this.appName} Forgot Password`
        }

        if (this.notification.email.bodyTemplate == null) {
            this.notification.email.bodyTemplate = "./templates/email-forgot-password.html"
        }
    }
}