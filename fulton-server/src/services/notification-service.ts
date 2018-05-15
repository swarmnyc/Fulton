import { DiKeys } from '../keys';
import { EmailMessage, IEmailService, ITemplateService, INotificationService, inject, NotificationMessage } from '../interfaces';
import { FultonLog } from '../fulton-log';
import { Service } from './service';
import { EmailService } from './email-service';
import { NotificationOptions } from '../options/notification-options';

export class NotificationService extends Service implements INotificationService {
    emailService: IEmailService
    options: NotificationOptions

    onInit() {
        this.options = this.app.options.notification;

        if (this.options.email.enabled) {
            this.emailService = this.app.container.get(DiKeys.EmailService)
        }
    }

    send(...messages: NotificationMessage[]): Promise<any> {
        return new Promise((resolve, reject) => {
            var tasks: Promise<any>[] = []
            messages.forEach((msg) => {
                if (this.emailService) {
                    if (msg.email) {
                        // send email

                        if (this.options.extraVariables) {
                            Object.assign(msg.email.variables || {}, this.options.extraVariables)
                        }

                        tasks.push(this.emailService.send(msg.email))
                    }

                    // if (msg.sms) {
                    // }

                    // if (msg.pushNotification) {
                    // }
                }
            });

            return Promise.all(tasks).then(resolve).catch(reject)
        });
    }
}