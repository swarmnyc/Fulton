import * as lodash from 'lodash';
import { FultonError } from '../common';
import { FultonApp } from '../fulton-app';
import { EventKeys, DiKeys } from '../keys';
import { ISecurityService } from '../interfaces';

module.exports = function (app: FultonApp) {
    if (lodash.some(app.options.security.middlewares)) {
        app.express.use(...app.options.security.middlewares);
    } else {
        var service = app.getInstance<ISecurityService>(DiKeys.SecurityService) 

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