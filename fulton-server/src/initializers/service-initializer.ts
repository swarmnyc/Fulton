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
        if (app.options.security.service == null) {
            providers.push({
                provide: DiKeys.SecurityService,
                useClass: require("../services/security-service").SecurityService
            })
        } else {
            providers.push({
                provide: DiKeys.SecurityService,
                useClass: app.options.security.service
            })
        }
    }

    // add cache service
    if (app.options.cache.enabled) {
        if (app.options.cache.serviceFactory) {
            app.options.cache.provider = "other"
        }

        let target;
        switch (app.options.cache.provider) {
            case "memory":
                target = require("../services/cache/memory-cache-service").default
                break;
            case "redis":
                target = require("../services/cache/redis-cache-service").default
                break;
            case "other":
                target = app.options.cache.serviceFactory
                break;
            default:
                throw new Error("Unknown cache provider " + app.options.cache.provider)
        }

        providers.push({
            provide: DiKeys.CacheServiceFactory,
            useClass: target
        })
    }

    // add these services if notification are enabled
    if (app.options.notification.enabled) {
        // add template service
        if (app.options.notification.templateService == null) {
            providers.push({
                provide: DiKeys.TemplateService,
                useClass: require("../services/template-service").default
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
                // default email service
                providers.push({
                    provide: DiKeys.EmailService,
                    useClass: require("../services/notification/email-service").default
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
            let target;
            switch (app.options.notification.pushNotification.provider) {
                case "firebase":
                    target = require("../services/notification/fcm-push-notification-service").default
                    break;
                default:
                    throw new Error("Unknown push notification provider " + app.options.notification.pushNotification.provider)
            }

            providers.push({
                provide: DiKeys.PushNotificationService,
                useClass: target
            })
        }

        // add sms notification service
        if (app.options.notification.sms.enabled) {
            let target;
            switch (app.options.notification.sms.provider) {
                case "aws":
                    target = require("../services/notification/aws-sms-notification-service").default
                    break;
                default:
                    throw new Error("Unknown sms notification provider " + app.options.notification.sms.provider)
            }

            providers.push({
                provide: DiKeys.SmsNotificationService,
                useClass: target
            })
        }

        // add notification service
        if (app.options.notification.service == null) {
            providers.push({
                provide: DiKeys.NotificationService,
                useClass: require("../services/notification/notification-service").default
            })
        } else {
            providers.push({
                provide: DiKeys.NotificationService,
                useClass: app.options.notification.service
            })
        }
    }
}