import { FultonApp } from '../../src/fulton-app';
import { FultonAppOptions } from '../../src/options/fulton-app-options';
import { FcmPushNotificationService } from '../../src/services/fcm-push-notification-service';
import { DiKeys } from '../../src/keys';


class MyApp extends FultonApp {
    protected onInit(options: FultonAppOptions): void {
        // use aws ses
        options.notification.enabled = true
        options.notification.pushNotification.enabled = true

        options.notification.pushNotification.config = {
            filePath: "./spec/google-firebase.json"
        }
    }
}


xdescribe('Firebase cloud messaging', () => {
    var app = new MyApp()
    var service: FcmPushNotificationService

    beforeAll(async () => {
        await app.init();

        service = app.container.get(DiKeys.PushNotificationService)
    })

    afterAll(() => {
        return app.stop();
    });

    it('should login', async () => {
        var key = await service.getAccessToken()

        expect(key).toBeTruthy();
    });

    it('should send', async () => {
        await app.sendNotifications({
            pushNotification: {
                message: {
                    topic: "game_start",
                    data: {
                        type: "game_start",
                        gameId: "5b3beb5082313e000fc731e4",
                        gameName: "Game 1"
                    }
                }
            }
        })
    });
});