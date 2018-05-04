import { BaseOptions } from './options';
import { Env } from '../helpers';
import { EmailMessage, Dict } from '../interfaces';

export class EmailOptions extends BaseOptions<EmailOptions>{
    /**
     * if true, app will enable send email notification.
     * the default value is false
     * It can be overridden by env["{appName}.options.notification.email.enabled"]
     */
    enabled?: boolean = false;

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
    readonly smtp?= new EmailSmtpOptions(this.appName, this.appMode);

    /**
     * if the value is defiened, will use this value to create a transporter of nodemailer.
     */
    otherOptions?: any;

    init?(): void {
        this.enabled = Env.getBoolean(`${this.appName}.options.notification.email.enabled`, this.enabled);

        this.sender = Env.get(`${this.appName}.options.notification.email.sender`, this.sender);
        this.cc = Env.get(`${this.appName}.options.notification.email.cc`, this.cc);
        this.bcc = Env.get(`${this.appName}.options.notification.email.bcc`, this.bcc);

        this.smtp.init();
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

    init?(): void {
        this.host = Env.get(`${this.appName}.options.notification.email.smtp.host`, this.host);
        this.port = Env.getInt(`${this.appName}.options.notification.email.smtp.port`, this.port);
        this.secure = Env.getBoolean(`${this.appName}.options.notification.email.smtp.secure`, this.secure);

        var username = Env.get(`${this.appName}.options.notification.email.smtp.auth.username`);
        var password = Env.get(`${this.appName}.options.notification.email.smtp.auth.password`);

        if (this.auth == null) this.auth = {}

        if (username || password) {
            if (username) this.auth.username = username
            if (password) this.auth.password = password
        }
    }
}

export class NotificationOptions extends BaseOptions<NotificationOptions> {
    readonly email = new EmailOptions(this.appName, this.appMode);

    //TODO: sms notification
    readonly sms?: any

    // TODO: pushNotification
    readonly pushNotification?: any;

    /**
     * the extra variables pass to template engine
     */
    extraVariables?: Dict

    init?(): void {
        this.email.init();
    }
}