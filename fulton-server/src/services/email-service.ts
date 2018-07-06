import * as mailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { Options as MailOptions } from 'nodemailer/lib/mailer';
import { FultonApp } from '../fulton-app';
import { FultonLog } from '../fulton-log';
import { EmailMessage, IEmailService, ITemplateService } from '../interfaces';
import { DiKeys } from '../keys';
import { Service } from './service';

export class EmailService extends Service implements IEmailService {
    private templateService: ITemplateService;
    private transporter: Transporter;

    onInit() {
        this.templateService = (<FultonApp>this.app).getProvider(this.app.options.notification.templateService, DiKeys.TemplateService)

        if (this.app.options.notification.email.otherOptions) {
            this.transporter = mailer.createTransport(this.app.options.notification.email.otherOptions);
        } else {
            var smtp = this.app.options.notification.email.smtp;
            this.transporter = mailer.createTransport({
                host: smtp.host,
                port: smtp.port,
                secure: smtp.secure,
                auth: {
                    user: smtp.auth.username,
                    pass: smtp.auth.password
                }
            });
        }
    }

    send(message: EmailMessage): Promise<void> {
        return new Promise((resolve, reject) => {
            if (message.subjectTemplate) {
                message.subject = this.templateService.generate(message.subjectTemplate, message.variables)
            }

            if (message.bodyTemplate) {
                message.body = this.templateService.generate(message.bodyTemplate, message.variables)
            }

            var defaults = this.app.options.notification.email;

            var options: MailOptions = {
                from: message.from || defaults.sender,
                to: message.to,
                cc: message.cc || defaults.cc,
                bcc: message.cc || defaults.bcc,
                subject: message.subject,
                html: message.body,
                attachments: message.attachments
            }

            this.transporter.sendMail(options, (error) => {
                if (error) {
                    FultonLog.error("Sending Email failed by", error)
                    reject(error)
                } else {
                    FultonLog.debug("Email sent", options)
                    resolve()
                }
            })
        });
    }
}