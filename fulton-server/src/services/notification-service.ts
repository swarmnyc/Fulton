import { FultonApp } from '../fulton-app';
import { IEmailService, INotificationService, IPushNotificationService, NotificationMessage } from '../interfaces';
import { DiKeys } from '../keys';
import { NotificationOptions } from '../options/notification-options';
import { Service } from './service';

export class NotificationService extends Service implements INotificationService {
    emailService: IEmailService
    pushNotificationService: IPushNotificationService

    options: NotificationOptions

    onInit() {
        this.options = this.app.options.notification;

        if (this.options.email.enabled) {
            this.emailService = (<FultonApp>this.app).getProvider(this.options.email.service, DiKeys.EmailService)
        }

        if (this.options.pushNotification.enabled) {
            this.pushNotificationService = (<FultonApp>this.app).getProvider(this.options.pushNotification.service, DiKeys.PushNotificationService)
        }
    }

    send(...messages: NotificationMessage[]): Promise<any> {
        return new Promise((resolve, reject) => {
            var tasks: Promise<any>[] = []
            messages.forEach((msg) => {
                if (this.emailService && msg.email) {
                    // send email
                    if (this.options.extraVariables) {
                        Object.assign(msg.email.variables || {}, this.options.extraVariables)
                    }

                    tasks.push(this.emailService.send(msg.email))
                }

                // if (msg.sms) {
                // }

                if (this.pushNotificationService && msg.pushNotification) {
                    tasks.push(this.pushNotificationService.send(msg.pushNotification))
                }
            });

            return Promise.all(tasks).then(resolve).catch(reject)
        });
    }
}