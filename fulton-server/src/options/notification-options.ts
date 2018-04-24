import { BaseOptions } from './options';
import { CorsOptions as CorsOpts } from 'cors';
import { Env } from '../helpers';
import { Middleware } from '../interfaces';

export class NotificationOptions extends BaseOptions<NotificationOptions> {
    email?: {
        templatingFn?: ((template: string, variables: any) => void),
        sendFn?: (() => void),
        smtp?: {
            host?: string,
            port?: string,
            secure?: string,
            auth?: {
                username?: string,
                password?: string,
            },
            sender?: {
                email?: string,
                name?: string,
            }
        }
    }

    sms?: {
        //TODO: sms notification
    }

    init?(appName: string): void {
        //this.enabled = Env.getBoolean(`${appName}.options.cors.enabled`, this.enabled);
    }
}