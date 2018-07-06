import { Env } from '../helpers';
import { BaseOptions } from './options';
import { Type } from '../interfaces';

export class PushNotificationOptions extends BaseOptions<PushNotificationOptions>{
    /**
     * if true, app will enable send email notification.
     * the default value is false
     * It can be overridden by env["{appName}.options.notification.push_notification.enabled"]
     */
    enabled?: boolean = false;

    /**
     * the type or instance of service of push notification. 
     * default is use Fulton Default push Notification Service which is use Firebase Cloud messaging,
     * if the value is a Type, the type has to be registered in app.options.providers
     */
    service?: Type;

    /**
     * the config
     * 
     * the value can be overridden by
     * `env["{appName}.options.notification.push_notification.config.{name}"]`
     */
    config?: any;

    init?(): void {
        this.enabled = Env.getBoolean(`${this.appName}.options.notification.push_notification.enabled`, this.enabled);

        let namedReg = new RegExp(`^${this.appName}\\.options\\.notification\\.push_notification\\.config\\.(\\w+?)$`);

        for (const key in process.env) {
            let match = namedReg.exec(key)
            if (match) {
                this.config[match[1]] = process.env[key]
            } 
        }
    }
}