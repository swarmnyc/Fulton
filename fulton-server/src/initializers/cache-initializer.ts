import * as lodash from 'lodash';
import { FultonApp } from '../fulton-app';
import { ICacheServiceFactory } from '../interfaces';
import { DiKeys } from '../keys';

module.exports = function (app: FultonApp) {
    if (app.options.cache.resetHandlerEnabled) {
        if (lodash.some(app.options.cache.middlewares)) {
            app.express.get(app.options.cache.resetPath, ...app.options.cache.middlewares);
        } else {
            app.express.get(app.options.cache.resetPath, (_, res) => {
                app.getInstance<ICacheServiceFactory>(DiKeys.CacheServiceFactory).resetAll()
                res.send("ok")
            });
        }
    }
}