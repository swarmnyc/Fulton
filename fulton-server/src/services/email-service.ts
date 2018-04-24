import * as mailer from 'nodemailer';
import { DiKeys } from '../keys';
import { EmailMessage, IEmailService, ITemplateService } from '../interfaces';
import { FultonLog } from '../fulton-log';
import { Options as SmtpOptions } from 'nodemailer/lib/smtp-transport';
import { Options as MailOptions } from 'nodemailer/lib/mailer';
import { Service } from './service';
import { Transporter } from 'nodemailer';

export class EmailService extends Service implements IEmailService {
    private inited: boolean = false;
    private templateService: ITemplateService;
    private transporter: Transporter;

    init() {
        this.inited = true;
        this.templateService = this.app.container.get(DiKeys.TemplateService);

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
        if (!this.inited) this.init()

        return new Promise((resolve, reject) => {
            if (message.subjectTemplate) {
                message.subject = this.templateService.geneate(message.subjectTemplate, message.variables)
            }

            if (message.bodyTemplate) {
                message.body = this.templateService.geneate(message.bodyTemplate, message.variables)
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
                    FultonLog.error("Send Email failed by", error)
                    reject(error)
                } else {
                    FultonLog.debug("Email sended", options)
                    resolve()
                }
            })
        });
    }
}