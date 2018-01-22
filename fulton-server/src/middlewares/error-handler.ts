import FultonLog from "../fulton-log";
import { Request, Response, Middleware } from "../interfaces";

export function defaultErrorHandler(err: any, req: Request, res: Response, next: Middleware) {
    FultonLog.error(`${req.method} ${req.url}\nrequest: %O\nerror: %s`, { httpHeaders: req.headers, httpBody: req.body }, err.stack);
    res.sendStatus(500);
}