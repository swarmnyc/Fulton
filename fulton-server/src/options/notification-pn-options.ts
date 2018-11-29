import { Env } from '../helpers';
import { BaseOptions } from './options';
import { Type, PushNotificationProvider } from '../interfaces';

export interface FcmPushNotificationConfig {
    type?: string
    project_id?: string
    private_key_id?: string
    private_key?: string
    client_email?: string
    client_id?: string
    auth_uri?: string
    token_uri?: string
    auth_provider_x509_cert_url?: string
    client_x509_cert_url?: string
}

export interface PushNotificationProviderConfigs extends FcmPushNotificationConfig {
    /** the file path of the configs for firebase*/
    filePath?: string;
    
    [key: string]: any;
}

export class PushNotificationOptions extends BaseOptions<PushNotificationOptions>{
    /**
     * if true, app will enable send email notification.
     * the default value is false
     * It can be overridden by env["{appName}.options.notification.push_notification.enabled"]
     */
    enabled?: boolean = false;

    /**
     * the provider of push notification
     * the default value is null. However, if the service field is not null, the value will become "other"
     * It can be overridden by env["{appName}.options.notification.push_notification.provider"]
     */
    provider: PushNotificationProvider;

    /**
     * the type of service of notification. 
     * if the provider is other, this value is required,
     * by default, 
     * if the provider is firebase, use Fulton Default FcmPushNotificationService.
     */
    service: Type;

    /**
     * the configs for provider
     * 
     * the value can be overridden by
     * `env["{appName}.options.notification.push_notification.configs.{name}"]`
     */
    configs?: PushNotificationProviderConfigs = {};

    init?(): void {
        this.enabled = Env.getBoolean(`${this.appName}.options.notification.push_notification.enabled`, this.enabled);
        this.provider = Env.get(`${this.appName}.options.notification.push_notification.provider`, this.provider) as any;

        Env.parse(new RegExp(`^${this.appName}\\.options\\.notification\\.push_notification\\.configs\\.(\\w+?)$`), this.configs);
    }
}