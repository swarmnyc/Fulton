import { DiKeys } from '../keys';
import { EmailMessage, IEmailService, ITemplateService, INotificationService, inject, NotificationMessage } from '../interfaces';
import { FultonLog } from '../fulton-log';
import { Service } from './service';
import { EmailService } from './email-service';

export class NotificationService extends Service implements INotificationService {
    @inject(DiKeys.EmailService)
    emailService: IEmailService

    send(...messages: NotificationMessage[]): Promise<any> {
        return new Promise((resolve, reject) => {
            var tasks: Promise<any>[] = []
            messages.forEach((msg) => {
                if (this.app.options.notification.email.enabled && msg.email) {
                    tasks.push(this.emailService.send(msg.email))
                }
            });

            return Promise.all(tasks).then(resolve).catch(reject)
        });
    }
}