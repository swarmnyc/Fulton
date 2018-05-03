import { BaseOptions } from '../../options/options';
import { Env } from '../../helpers';
import { FultonIdentityImpl } from '../fulton-impl/fulton-impl';
import { IdentityNotificationOptions } from './notification-Options';
import { Middleware } from '../../interfaces';

/**
 * options for forgot password
 * there are three methods
 * 1.
 * ALL /auth/forgot-password?username=username, for send reset code notification
 * ALL /auth/forgot-password?email=email, for send reset code notification
 * 
 * 2.  
 * ALL /auth/forgot-password?token=token&code=code, for just verfiy the token is valid or not
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
     * the default value is /auth/login
     */
    path?: string = "/auth/forgot-password";

    /**
     * the duration of reset password token in seconds
     * 
     * default is 30 minutes = 1800
     */
    duration?: number = 1800;

    /**
     * the handler for register
     * the default value is FultonIdentityImpl.forgotPasswordHandler
     */
    handler?: Middleware = FultonIdentityImpl.forgotPasswordHandler;

    /**
     * the options for notification
     * the default value for email.subjectTemplate is `{appName} Forgot Password`
     * the default value for email.bodyTemplate is `./templates/email-forgot-password.html`
     */
    readonly notiication? = new IdentityNotificationOptions(this.appName, this.appMode, "forgot-password");

    init?(): void {
        this.enabled = Env.getBoolean(`${this.appName}.options.identity.forgot-password.enabled`, this.enabled);

        this.notiication.init()

        if (this.notiication.email.subjectTemplate == null) {
            this.notiication.email.subjectTemplate = `${this.appName} Forgot Password`
        }

        if (this.notiication.email.bodyTemplate == null) {
            this.notiication.email.bodyTemplate = "./templates/email-forgot-password.html"
        }
    }
}