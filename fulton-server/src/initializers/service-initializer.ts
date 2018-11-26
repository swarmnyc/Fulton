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

    initModuleServices(app, providers);

    var ids = app["registerTypes"](providers, true);

    // init services
    ids.forEach((id) => {
        var service = app.container.get<Service>(id);
        if (service.onInit) {
            service.onInit();
        }
    });

    app.events.emit(EventKeys.AppDidInitServices, this);
}

function initModuleServices(app: FultonApp, providers: Provider[]) {
    // add security service if security are enabled
    if (app.options.security.enabled) {
        app.options.entities.push(require("../entities/entity-service").SecurityService)
        providers.push(require("../services/security-service").SecurityService)
    }

    // add these services if notification are enabled
    if (app.options.notification.enabled) {
        // add template service
        if (app.options.notification.templateService == null) {
            providers.push({
                provide: DiKeys.TemplateService,
                useClass: require("../services/template-service").TemplateService
            })
        } else {
            providers.push({
                provide: DiKeys.TemplateService,
                useClass: app.options.notification.templateService
            })
        }

        // add email service
        if (app.options.notification.email.enabled) {
            if (app.options.notification.email.service == null) {
                providers.push({
                    provide: DiKeys.EmailService,
                    useClass: require("../services/email-service").EmailService
                })
            } else {
                providers.push({
                    provide: DiKeys.EmailService,
                    useClass: app.options.notification.email.service
                })
            }
        }

        // add push notification service
        if (app.options.notification.pushNotification.enabled) {
            if (app.options.notification.pushNotification.service == null) {
                providers.push({
                    provide: DiKeys.PushNotificationService,
                    useClass: require("../services/fcm-push-notification-service").FcmPushNotificationService
                })
            } else {
                providers.push({
                    provide: DiKeys.PushNotificationService,
                    useClass: app.options.notification.pushNotification.service
                })
            }
        }

        // add notification service
        if (app.options.notification.service == null) {
            providers.push({
                provide: DiKeys.NotificationService,
                useClass: require("../services/notification-service").NotificationService
            })
        } else {
            providers.push({
                provide: DiKeys.NotificationService,
                useClass: app.options.notification.service
            })
        }
    }
}