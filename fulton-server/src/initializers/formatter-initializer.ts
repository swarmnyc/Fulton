import * as express from 'express';
import * as lodash from 'lodash';
import { EventKeys } from '../keys';
import { IFultonApp } from '../fulton-app';
import { MimeTypes } from '../constants';
import { queryParamsParser } from '../middlewares/query-params-parser';
import { Type } from '../types';

module.exports = function (app: IFultonApp) {
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

    app.events.emit(EventKeys.AppDidInitFormatter, app);
}