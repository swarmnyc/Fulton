import { FultonLog } from "../fulton-log";
import { Request, Response, Middleware, NextFunction } from "../interfaces";
import { FultonError } from '../common/fulton-error';

export function defaultErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    err = getBaseError(err)
    if (err instanceof FultonError) {
        res.status(err.status).send(err);
    } else {
        FultonLog.error(`${req.method} ${req.url}\nrequest: %O\nerror: %s`,
            { httpHeaders: req.headers, httpBody: req.body },
            err.stack || err);

        res.sendStatus(500).end();
    }
}

export function default404ErrorHandler(req: Request, res: Response, next: NextFunction) {
    if (!req.fultonApp.options.logging.httpLoggerEnabled) {
        FultonLog.warn(`${req.method} ${req.url} 404`);
    }

    res.sendStatus(404);
}

function getBaseError(err: any) {
    // for Promise uncaught Error
    while (err.rejection) {
        err = err.rejection;
    }

    return err;
}