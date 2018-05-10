import * as compression from 'compression';
import { FultonApp } from '../fulton-app';
import { EventKeys } from '../keys';
import * as lodash from 'lodash';

module.exports = function (app: FultonApp) {
    if (lodash.some(app.options.compression.middlewares)) {
        app.express.use(...app.options.compression.middlewares);
    } else {
        app.express.use(compression(app.options.compression.options));
    }

    app.events.emit(EventKeys.AppDidInitCompression, this);
}