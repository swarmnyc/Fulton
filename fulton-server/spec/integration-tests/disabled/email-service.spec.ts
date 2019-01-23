import { DiKeys } from '../../../src/keys';
import { FultonApp } from '../../../src/fulton-app';
import { FultonAppOptions } from '../../../src/options/fulton-app-options';
import { IEmailService } from '../../../src/types';

class MyApp extends FultonApp {
    protected onInit(options: FultonAppOptions): void {
        // use aws ses
        options.notification.enabled = true
        options.notification.email.enabled = true
        options.identity.enabled = true

        options.databases.set("default", {
            type: "mongodb",
            url: "mongodb://localhost:27017/fulton-test"
        });

        options.notification.extraVariables = {
            extra1: "EXTRA1"
        }

        options.identity.register.notification.extraVariables = {
            extra2: "EXTRA2"
        }

        options.identity.register.notification.email.set({
            subjectTemplate: "Welcome to Fulton",
            bodyTemplate: "./spec/templates/welcome-template.html"
        })
    }
}

xdescribe('Email Service', () => {
    var app = new MyApp()

    beforeAll(async () => {
        await app.init();

        app.dbConnections[0].dropDatabase()
    })

    afterAll(() => {
        return app.stop();
    });

    it('should send email', async () => {
        var service: IEmailService = app.container.get(DiKeys.EmailService)

        await service.send({
            to: process.env["tester_email"],
            subjectTemplate: "Hello ${displayName}, this is testing email",
            bodyTemplate: "<h1>Hello ${displayName}</h1><p>${message}</p>",
            variables: {
                displayName: "Tester",
                message: "Email Testing"
            }
        });
    });

    it('should send email welcome email', (done) => {
        app.identityService.register({
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