import * as cors from 'cors';
import { FultonApp } from '../fulton-app';
import { EventKeys } from '../keys';
import * as lodash from 'lodash';
import { SecurityService } from '../services/security-service';
import { FultonError } from '../common';

module.exports = function (app: FultonApp) {
    if (lodash.some(app.options.security.middlewares)) {
        app.express.use(...app.options.security.middlewares);
    } else {
        var service = app.getProvider(SecurityService) as SecurityService

        app.express.use(async (req, res, next) => {
            let valid = await service.verify(req)

            if (valid) {
                next()
            } else {
                next(new FultonError("bad-client-key", "Bed Client Key", 400))
            }
        });
    }

    app.events.emit(EventKeys.AppDidInitSecurity, this);
}