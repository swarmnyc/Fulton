import { Env } from '../helpers';
import { BaseOptions } from './options';
import { Type, PushNotificationProvider } from '../interfaces';

export class SmsNotificationOptions extends BaseOptions<SmsNotificationOptions>{
    /**
     * if true, app will enable send email notification.
     * the default value is false
     * It can be overridden by env["{appName}.options.notification.sms.enabled"]
     */
    enabled?: boolean = false;

    /**
     * the provider of push notification
     * It can be overridden by env["{appName}.options.notification.sms.provider"]
     */
    provider: PushNotificationProvider = "firebase";

    /**
     * the type of service of notification. 
     * if the provider is other, this value is required,
     * by default, 
     * if the provider is aws, use Fulton Default AwsSmsNotificationService.
     */
    service: Type;

    /**
     * the configs for provider
     * 
     * the value can be overridden by
     * `env["{appName}.options.notification.sms.configs.{name}"]`
     */
    configs?: any = {};

    init?(): void {
        this.enabled = Env.getBoolean(`${this.appName}.options.notification.sms.enabled`, this.enabled);
        this.provider = Env.get(`${this.appName}.options.notification.sms.provider`, this.provider) as any;

        Env.parse(new RegExp(`^${this.appName}\\.options\\.notification\\.sms\\.configs\\.(\\w+?)$`), this.configs);
    }
}