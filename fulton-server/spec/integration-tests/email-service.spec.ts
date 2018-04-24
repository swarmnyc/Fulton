import { FultonApp } from '../../src/fulton-app';
import { FultonAppOptions } from '../../src/options/fulton-app-options';
import { DiKeys, IEmailService } from '../../src/interfaces';

class MyApp extends FultonApp {
    protected onInit(options: FultonAppOptions): void {
        // use aws ses
        options.notification.email.sender = process.env["stmp_sender"]

        options.notification.email.smtp.set({
            host: "email-smtp.us-east-1.amazonaws.com",
            secure: true,
            auth: {
                username: process.env["stmp_username"],
                password: process.env["stmp_password"]
            }
        })
        options.docs.enabled = true;
    }
}

xdescribe('Email Service', () => {
    var app = new MyApp()

    beforeAll(() => {
        return app.init()
    })

    it('should send email', async () => {
        var service: IEmailService = app.container.get(DiKeys.EmailService)

        await service.send({
            to: '"Wade" wade@swarmnyc.com',
            subjectTemplate: "Hello {{username}}, this is testing email",
            bodyTemplate: "<h1>Hello {{username}}</h1><p>{{message}}</p>",
            variables: {
                username: "Wade",
                message: "Email Testing"
            }
        });
    });
});