import { Env } from '../helpers/env';
import { Dict, Type } from '../interfaces';
import { EmailOptions } from './notification-email-options';
import { PushNotificationOptions } from './notification-pn-options';
import { BaseOptions } from './options';

export class NotificationOptions extends BaseOptions<NotificationOptions> {
    /**
     * if true, app will enable send notification.
     * the default value is false
     * It can be overridden by env["{appName}.options.notification.enabled"]
     */
    enabled?: boolean = false;

    /**
     * the type or instance of service of notification. default is use Fulton Default Notification Service
     */
    service?: Type;

    /**
     * the type or instance of service of templating. default is use Fulton Default Template Service,
     */
    templateService?: Type;

    readonly email = new EmailOptions(this.appName, this.appMode);

    //TODO: sms notification
    readonly sms?: any

    // TODO: pushNotification
    readonly pushNotification = new PushNotificationOptions(this.appName, this.appMode);

    /**
     * the extra variables pass to template engine
     */
    extraVariables?: Dict

    init?(): void {
        this.email.init();
        this.pushNotification.init();

        this.enabled = Env.getBoolean(`${this.appName}.options.notification.enabled`, this.enabled);

    }
}