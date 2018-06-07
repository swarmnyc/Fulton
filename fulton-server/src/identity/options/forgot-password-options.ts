import { BaseOptions } from '../../options/options';
import { Env } from '../../helpers';
import { IdentityNotificationOptions } from './notification-options';
import { Middleware } from '../../interfaces';

/**
 * options for forgot password
 * there are three methods
 * 1.
 * ALL /auth/forgot-password?username=username, for send reset code notification
 * ALL /auth/forgot-password?email=email, for send reset code notification
 * 
 * 2.  
 * ALL /auth/forgot-password?token=token&code=code, for just verify the token is valid or not
 * 
 * 3.  
 * All /auth/forgot-password?token=token&code=code&password=new-password, for reset password
 */
export class ForgotPasswordOptions extends BaseOptions<ForgotPasswordOptions> {
    /**
     * the default value is true
     * it can be overridden by process.env["{appName}.options.identity.forgot-password.enabled"]
     */
    enabled?: boolean = true;

    /**
     * the default value is /auth/forgot-password
     */
    path?: string = "/auth/forgot-password";

    /**
     * the duration of reset password token in seconds
     * 
     * default is 30 minutes = 1800
     */
    duration?: number = 1800;

    /**
     * the handler for revoke forgot password
     * the default value is FultonIdentityImpl.forgotPasswordHandler
     */
    handler?: Middleware;

    /**
     * the try limits for failure,
     * the default value is 3
     */
    tryLimits?: number = 3;

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