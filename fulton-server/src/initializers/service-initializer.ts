import * as path from 'path';
import { EventKeys, DiKeys } from '../keys';
import { FultonApp } from '../fulton-app';
import { Provider } from '../helpers';
import { EmailService } from '../services/email-service';

module.exports = async function (app: FultonApp) {
    let providers = app.options.services || [];
    if (app.options.loader.serviceLoaderEnabled) {
        let dirs = app.options.loader.serviceDirs.map((dir) => path.join(app.options.loader.appDir, dir));
        let loadedProviders = await app.options.loader.serviceLoader(dirs, true) as Provider[];
        providers = loadedProviders.concat(providers);
    }

    app["registerTypes"](providers);

    // add these services if one of notifications are enabled
    if (app.options.notification.email.enabled) {
        // add the default TemplateService if there is no TemplateService registered    
        if (!app.container.isBound(DiKeys.TemplateService)) {
            app.container
                .bind(DiKeys.TemplateService)
                .to(require("../services/template-service").TemplateService)
                .inSingletonScope()
        }

        // add the default EMailService if there is no EMailService registered
        if (!app.container.isBound(DiKeys.EmailService)) {
            app.container
                .bind(DiKeys.EmailService)
                .to(require("../services/email-service").EmailService)
                .inSingletonScope()
        }

        // add the default NotificationService if there is no NotificationService registered
        if (!app.container.isBound(DiKeys.NotificationService)) {
            app.container
                .bind(DiKeys.NotificationService)
                .to(require("../services/notification-service").NotificationService)
                .inSingletonScope()
        }
    }

    app.events.emit(EventKeys.AppDidInitServices, this);
}