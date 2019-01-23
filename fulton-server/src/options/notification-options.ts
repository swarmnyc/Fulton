import { Env } from '../helpers/env';
import { Dict, Type } from '../types';
import { EmailOptions } from './notification-email-options';
import { PushNotificationOptions } from './notification-pn-options';
import { SmsNotificationOptions } from './notification-sms-options';
import { BaseOptions } from './options';

export class NotificationOptions extends BaseOptions<NotificationOptions> {
    /**
     * if true, app will enable send notification.
     * the default value is false
     * It can be overridden by env["{appName}.options.notification.enabled"]
     */
    enabled: boolean = false;

    /**
     * the type of service of notification. 
     * default is use Fulton Default Notification Service
     */
    service: Type;

    /**
     * the type or instance of service of templating. default is use Fulton Default Template Service,
     */
    templateService: Type;

    readonly email = new EmailOptions(this.appName, this.appMode);

    readonly sms = new SmsNotificationOptions(this.appName, this.appMode);

    readonly pushNotification = new PushNotificationOptions(this.appName, this.appMode);

    /**
     * the extra variables pass to template engine
     */
    extraVariables?: Dict

    init?(): void {
        this.email.init();
        this.sms.init();
        this.pushNotification.init();

        this.enabled = Env.getBoolean(`${this.appName}.options.notification.enabled`, this.enabled);

    }
}