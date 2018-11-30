import { FultonApp } from '../../../src/fulton-app';
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

    it('should send', async () => {
        await app.sendNotifications({
            sms: {
                message: "TEST",
                phoneNumber: process.env["tester_phone"]
            }
        })
    });
});