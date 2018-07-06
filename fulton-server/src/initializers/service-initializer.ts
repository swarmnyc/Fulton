import * as path from 'path';
import { FultonApp } from '../fulton-app';
import { Provider } from '../helpers';
import { DiKeys, EventKeys } from '../keys';
import { Service } from '../services/service';

module.exports = async function (app: FultonApp) {
    let providers = app.options.services || [];
    if (app.options.loader.serviceLoaderEnabled) {
        let dirs = app.options.loader.serviceDirs.map((dir) => path.join(app.options.loader.appDir, dir));
        let loadedProviders = await app.options.loader.serviceLoader(dirs, true) as Provider[];
        providers = loadedProviders.concat(providers);
    }

    var ids = app["registerTypes"](providers, true);

    initNotificationServices(app, ids);

    // init services
    ids.forEach((id) => {
        var service = app.container.get<Service>(id);
        if (service.onInit) {
            service.onInit();
        }
    });

    app.events.emit(EventKeys.AppDidInitServices, this);
}

function initNotificationServices(app: FultonApp, ids: any[]) {
    // add these services if notification are enabled
    if (app.options.notification.enabled) {
        // add the default TemplateService
        if (app.options.notification.templateService == null) {
            app.container
                .bind(DiKeys.TemplateService)
                .to(require("../services/template-service").TemplateService)
                .inSingletonScope();

            ids.push(DiKeys.TemplateService)
        }

        // add the default EMailService
        if (app.options.notification.email.enabled && app.options.notification.email.service == null) {
            app.container
                .bind(DiKeys.EmailService)
                .to(require("../services/email-service").EmailService)
                .inSingletonScope();

            ids.push(DiKeys.EmailService)
        }

        // add the default EMailService
        if (app.options.notification.pushNotification.enabled && app.options.notification.pushNotification.service == null) {
            app.container
                .bind(DiKeys.PushNotificationService)
                .to(require("../services/fcm-push-notification-service").FcmPushNotificationService)
                .inSingletonScope();

            ids.push(DiKeys.PushNotificationService)
        }

        // add the default NotificationService if there is no NotificationService registered
        if (app.options.notification.service == null) {
            app.container
                .bind(DiKeys.NotificationService)
                .to(require("../services/notification-service").NotificationService)
                .inSingletonScope();

            ids.push(DiKeys.NotificationService)
        }
    }
}