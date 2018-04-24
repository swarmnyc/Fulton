import { BaseOptions } from './options';
import { Env } from '../helpers';
import { EmailMessage } from '../interfaces';

export class EmailOptions extends BaseOptions<EmailOptions>{
    /**
     * if true, app will enable send email notification.
     * the default value is true
     * It can be overridden by env["{appName}.options.notification.email.enabled"]
     */
    enabled?: boolean = true;

    /**
     * the default sender. use nodemailer format, like
     * "sender@server.com" or '"Sender Name" sender@server.com'
     * It can be overridden by process.env["{appName}.options.notification.email.sender"]
     */
    sender?: string;

    /**
     * the default cc. use nodemailer format, like
     * "cc@server.com" or '"Name" cc@server.com' or '"Name" cc@server.com, cc@server.com' 
     * It can be overridden by process.env["{appName}.options.notification.email.cc"]
     */
    cc?: string;

    /**
     * the default bcc. use nodemailer format, like
     * "bcc@server.com" or '"Name" bcc@server.com' or '"Name" bcc@server.com, bcc@server.com' 
     * It can be overridden by process.env["{appName}.options.notification.email.cc"]
     */
    bcc?: string;

    /**
     * the options of SMTP
     */
    readonly smtp?= new EmailSmtpOptions();

    init?(appName: string): void {
        this.enabled = Env.getBoolean(`${appName}.options.notification.email.enabled`, this.enabled);

        this.sender = Env.get(`${appName}.options.notification.email.sender`, this.sender);
        this.cc = Env.get(`${appName}.options.notification.email.cc`, this.cc);
        this.bcc = Env.get(`${appName}.options.notification.email.bcc`, this.bcc);

        this.smtp.init(appName);
    }
}

export class EmailSmtpOptions extends BaseOptions<EmailSmtpOptions>{
    /**
     * the host of smtp
     * It can be overridden by env["{appName}.options.notification.email.smtp.host"]
     */
    host?: string;

    /**
     * the port of stmp
     * the default value is 587 if secure is false, otherwise it is 465
     * It can be overridden by env["{appName}.options.notification.email.smtp.port"]
     */
    port?: number;

    /**
     * if true the connection will use TLS when connecting to server.
     * the default value is false.
     * It can be overridden by env["{appName}.options.notification.email.smtp.secure"]
     */
    secure?: boolean = false;

    /**
     * authentication data.
     */
    auth?: {
        /**
         * the user name.
         * It can be overridden by env["{appName}.options.notification.email.smtp.auth.username"]
         */
        username?: string;

        /**
         * the password.
         * It can be overridden by env["{appName}.options.notification.email.smtp.auth.password"]
         */
        password?: string;
    };

    init?(appName: string): void {
        this.host = Env.get(`${appName}.options.notification.email.smtp.host`, this.host);
        this.port = Env.getInt(`${appName}.options.notification.email.smtp.port`, this.port);
        this.secure = Env.getBoolean(`${appName}.options.notification.email.smtp.secure`, this.secure);

        var username = Env.get(`${appName}.options.notification.email.smtp.auth.username`);
        var password = Env.get(`${appName}.options.notification.email.smtp.auth.password`);

        if (username || password) {
            if (this.auth == null) this.auth = {}

            if (username) this.auth.username = username
            if (password) this.auth.password = password
        }
    }
}

export class NotificationOptions extends BaseOptions<NotificationOptions> {
    readonly email = new EmailOptions();

    //TODO: sms notification
    readonly sms?: {}

    init?(appName: string): void {
        this.email.init(appName);
    }
}