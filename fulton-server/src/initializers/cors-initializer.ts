import * as cors from 'cors';
import { FultonApp } from '../fulton-app';
import { EventKeys } from '../keys';
import * as lodash from 'lodash';

module.exports = function (app: FultonApp) {
    if (lodash.some(app.options.cors.middlewares)) {
        app.express.use(...app.options.cors.middlewares);
    } else {
        app.express.use(cors(app.options.cors.options));
    }

    app.events.emit(EventKeys.AppDidInitCors, this);
}