import { Middleware } from "../alias";
import { FultonLoggerLevel, FultonLoggerOptions } from '../fulton-log';
import { Env } from "../helpers";
import { BaseOptions } from './options';

export class LoggingOptions extends BaseOptions<LoggingOptions> {
    /**
     * the default logger logging level
     * default is "info"
     * It can be overridden by env["{appName}.options.logging.defaultLoggerLevel"]
     */
    defaultLoggerLevel?: FultonLoggerLevel;

    /**
     * if not null, reset winston default logger with this value, the default value is null
     * 
     * ## example
     * ```
     * option.defaultLoggerOptions = {
     *      level: "debug",
     *      transports: [new winston.transports.Console()]
     * }
     * ```
     */
    defaultLoggerOptions?: FultonLoggerOptions;

    /**
     * enable default logger console transport colorized
     * the default value is true
     * It can be overridden by env["{appName}.options.logging.defaultLoggerColorized"]
     */
    defaultLoggerColorized?: boolean = true;

    /**
     * if true, app will logs every http requests.
     * the default value is true
     * It can be overridden by env["${appName}.options.logging.httpLoggerEnabled"]
     */
    httpLoggerEnabled?: boolean = true;

    /**
     * the options for http logger, it is winston options 
     * this value will be ignored, if httpLogMiddlewares is not empty
     * 
     * ### default value
     * ```
     * option.httpLogOptions =  {
     *      console: {
     *          colorize: true,
     *          level: "info",
     *          showLevel: false,
     *          label: "Http"
     *      }
     * }
     * ```
     */
    httpLoggerOptions?: FultonLoggerOptions;

    /**
     * custom middlewares for http logging, like morgan or others
     * default is []
     */
    httpLoggerMiddlewares?: Middleware[] = [];

    init?(): void {
        this.defaultLoggerLevel = Env.get(`${this.appName}.options.logging.defaultLoggerLevel`, this.defaultLoggerLevel) as FultonLoggerLevel;
        this.defaultLoggerColorized = Env.getBoolean(`${this.appName}.options.logging.defaultLoggerColorized`, this.defaultLoggerColorized);

        this.httpLoggerEnabled = Env.getBoolean(`${this.appName}.options.logging.httpLoggerEnabled`, this.httpLoggerEnabled);

        if (this.httpLoggerOptions == null) {
            this.httpLoggerOptions = {
                console: {
                    colorize: true,
                    level: "info",
                    showLevel: false,
                    label: "Http"
                }
            }
        }
    }
}