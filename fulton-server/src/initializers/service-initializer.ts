import * as path from 'path';
import { EventKeys, DiKeys } from '../interfaces';
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

    // add the default TemplateService if there is no TemplateService registered
    if (!app.container.isBound(DiKeys.TemplateService)) {
        var templateService = require("../services/template-service").TemplateService
        app.container
            .bind(DiKeys.TemplateService)
            .to(templateService)
            .inSingletonScope()
    }

    // add the default EMailService if there is no EMailService registered
    if (!app.container.isBound(DiKeys.EmailService)) {
        var emailService = require("../services/email-service").EmailService
        app.container
            .bind(DiKeys.EmailService)
            .to(emailService)
            .inSingletonScope()
    }

    app.events.emit(EventKeys.AppDidInitServices, this);
}