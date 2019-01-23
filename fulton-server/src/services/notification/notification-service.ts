import { IEmailService, INotificationService, IPushNotificationService, ISmsNotificationService, NotificationMessage } from '../../types';
import { DiKeys } from '../../keys';
import { NotificationOptions } from '../../options/notification-options';
import { Service } from '../service';

export default class NotificationService extends Service implements INotificationService {
    emailService: IEmailService
    smsService: ISmsNotificationService
    pushNotificationService: IPushNotificationService

    options: NotificationOptions

    onInit() {
        this.options = this.app.options.notification;

        if (this.options.email.enabled) {
            this.emailService = this.app.getInstance(DiKeys.EmailService)
        }

        if (this.options.sms.enabled) {
            this.smsService = this.app.getInstance(DiKeys.SmsNotificationService)
        }

        if (this.options.pushNotification.enabled) {
            this.pushNotificationService = this.app.getInstance(DiKeys.PushNotificationService)
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

                if (this.smsService && msg.sms) {
                    // send sms
                    tasks.push(this.smsService.send(msg.sms))
                }

                if (this.pushNotificationService && msg.pushNotification) {
                    // send pn
                    tasks.push(this.pushNotificationService.send(msg.pushNotification))
                }
            });

            return Promise.all(tasks).then(resolve).catch(reject)
        });
    }
}