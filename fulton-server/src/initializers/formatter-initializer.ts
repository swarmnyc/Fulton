import * as express from 'express';
import * as lodash from 'lodash';

import { EntityService } from '../entities';
import { FultonApp } from "../fulton-app";
import { MimeTypes } from '../constants';
import { Type, EventKeys } from '../interfaces';
import { queryParamsParser } from '../middlewares/query-params-parser';

module.exports = function (app: FultonApp) {
    if (app.options.formatter.json) {
        let types = [MimeTypes.json]

        if (app.options.formatter.jsonApi) {
            types.push(MimeTypes.jsonApi)
        }

        app.express.use(express.json({ type: types }));
    }

    if (app.options.formatter.form) {
        app.express.use(express.urlencoded({ extended: true }));
    }

    if (app.options.formatter.jsonApi) {
        app.express.use(require("../middlewares/jsonapi")(app));
    }

    if (app.options.formatter.queryParams) {
        app.express.use(queryParamsParser);
    }

    if (lodash.some(app.options.formatter.customs)) {
        app.express.use(...app.options.formatter.customs);
    }

    app.events.emit(EventKeys.didInitFormatter, app);
}