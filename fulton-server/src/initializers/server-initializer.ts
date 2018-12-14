import { IFultonApp } from "../fulton-app";
import * as express from 'express';
import { EventKeys } from "../keys";

module.exports = function (app: IFultonApp) {
    app.express = express();
    app.express.request.constructor.prototype.fultonApp = app;

    // a short cut for res.send
    app.express.response.constructor.prototype.sendData = function (data: any, status: number = 200) {
        this.status(status).send({ data: data })
    };

    // a short cut for res.send
    app.express.response.constructor.prototype.sendError = function (error: any, status: number = 400) {
        if (error && error.error) {
            this.status(status).send(error)
        } else {
            this.status(status).send({ error: error })
        }
    };

    app.express.disable('x-powered-by');

    app.events.emit(EventKeys.AppDidInitServer, this);
}