import { DiKeys } from '../../src/keys';
import { FultonApp } from '../../src/fulton-app';
import { FultonAppOptions } from '../../src/options/fulton-app-options';
import { IEmailService } from '../../src/interfaces';

class MyApp extends FultonApp {
    protected onInit(options: FultonAppOptions): void {
        // use aws ses
        options.notification.email.enabled = true
        options.identity.enabled = true

        options.databases.set("default", {
            type: "mongodb",
            url: "mongodb://localhost:27017/fulton-test"
        });

        options.notification.email.sender = process.env["stmp_sender"]

        options.notification.email.smtp.set({
            host: "email-smtp.us-east-1.amazonaws.com",
            secure: true,
            auth: {
                username: process.env["stmp_username"],
                password: process.env["stmp_password"]
            }
        });

        options.identity.register.notiication.email.set({
            subjectTemplate: "Welcome to Fulton",
            bodyTemplate: "<h1>Hello {{username}}</h1><p> Thanks for your registration.</p>"
        })
    }
}

describe('Email Service', () => {
    var app = new MyApp()

    beforeAll(async () => {
        await app.init();

        app.connections[0].dropDatabase()
    })

    afterAll(() => {
        return app.stop();
    });

    it('should send email', async () => {
        var service: IEmailService = app.container.get(DiKeys.EmailService)

        await service.send({
            to: process.env["tester_email"],
            subjectTemplate: "Hello {{username}}, this is testing email",
            bodyTemplate: "<h1>Hello {{username}}</h1><p>{{message}}</p>",
            variables: {
                username: "Tester",
                message: "Email Testing"
            }
        });
    });

    it('should send email welcome email', (done) => {
        app.userService.register({
            username: "Tester",
            email: process.env["tester_email"],
            password: "abcd1234"
        }).then(() => {
            setTimeout(function () {
                done()
            }, 1000)
        }).catch((err) => {
            fail(err)
        })
    });
});