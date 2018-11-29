import { FultonApp } from '../../../src/fulton-app';
import { AwsClient } from '../../../src/helpers/aws-client';
import { FultonAppOptions } from '../../../src/options/fulton-app-options';

class MyApp extends FultonApp {
    protected onInit(options: FultonAppOptions): void {
        options.notification.enabled = true
        options.notification.sms.enabled = true
        options.notification.sms.provider = "aws"
    }
}

xdescribe('AWS SmsPushNotification', () => {
    var app = new MyApp()

    beforeAll(async () => {
        await app.init();
    })

    afterAll(() => {
        return app.stop();
    });

    xit('should send via AwsClient', async () => {
        let client = new AwsClient()
        let res = await client.request({
            service: "sns",
            region: "us-east-1",
            method: "GET",
            host: "sns.us-east-1.amazonaws.com",
            query: {
                Action: "Publish",
                Message: "Hello",
                PhoneNumber: process.env["tester_phone"]
            }
        })

        expect(res.statusCode).toEqual(200)
    });

    it('should send', async () => {
        await app.sendNotifications({
            sms: {
                message: "TEST",
                phoneNumber: process.env["tester_phone"]
            }
        })
    });
});