import { FultonLog } from "../fulton-log";
import { Request, Response, Middleware, NextFunction } from "../interfaces";

import { LoggerOptions } from "winston";
import chalk from "chalk";
import * as lodash from 'lodash';

// inspired from https://github.com/bithavoc/express-winston/blob/master/index.js

export function defaultHttpLoggerHandler(options: LoggerOptions): Middleware {
    let logger = FultonLog.addLogger("httpLogger", options);

    return (req: Request, res: Response, next: NextFunction) => {
        res.locals.__startTime = new Date().getTime();

        res.end = new Proxy(res.end, {
            apply: function (end, thisArg: Response, args: any) {
                let responseTime = (new Date().getTime()) - res.locals.__startTime as number;

                end.apply(thisArg, args);

                var url = req.originalUrl || req.url;

                var msg;
                if (logger.transports.console && (logger.transports.console as any).colorize) {
                    // Palette from https://github.com/expressjs/morgan/blob/master/index.js#L205
                    let chalkStatusColor;
                    if (res.statusCode >= 500) chalkStatusColor = chalk.red;
                    else if (res.statusCode >= 400) chalkStatusColor = chalk.yellow;
                    else if (res.statusCode >= 300) chalkStatusColor = chalk.cyan;
                    else chalkStatusColor = chalk.green

                    msg = chalk.grey(`${req.method} ${url}`) +
                        chalkStatusColor(` ${res.statusCode} `) +
                        chalk.grey(`${responseTime}ms`);
                } else {
                    msg = `${req.method} ${url} ${res.statusCode} ${responseTime}ms`
                }


                logger.info(msg)
            }
        });

        next();
    }

}