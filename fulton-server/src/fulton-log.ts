import * as winston from "winston"

import { FultonApp } from "./index";
import { NPMLoggingLevel } from "winston";

/**
 * equels to winston.LoggerInstance
 */
export declare type FultonLogger = winston.LoggerInstance;

/**
 * equels to winston.LoggerOptions
 */
export declare type FultonLoggerOptions = winston.LoggerOptions;

export type FultonLoggerLevel = NPMLoggingLevel;

/**
 * FultonLog is static class that wraps winston, default logger is console,
 * use winstion levels as 
 * { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }
 * 
 * more usage you can see wiston doc https://www.npmjs.com/package/winston
 * 
 * @example //use default logger
 * FultonLog.info("message")
 * 
 * @example //change level
 * FultonLog.level = "debug"
 * 
 * @example //change configure
 * FultonLog.configure({
 *   transports: [
 *     new (winston.transports.File)({ filename: 'somefile.log' })
 *   ]
 * });
 * 
 * @example //add new logger
 * let logger = FultonLog.addLogger("test", {
 *   transports: [
 *     new (winston.transports.File)({ filename: 'somefile.log' })
 *   ]
 * });
 *
 * logger.debug("test")
 */
export default class FultonLog {
    static get level(): FultonLoggerLevel {
        return winston.level as FultonLoggerLevel;
    }

    static set level(level: FultonLoggerLevel) {
        (winston as any).level = level;
    }

    /**
     * change default logger configure
     * @param options 
     */
    static configure(options: FultonLoggerOptions): void {
        winston.configure(options);
    }

    static log(level: string, msg: string, ...meta: any[]): void {
        winston.log(level, msg, ...meta);
    }

    static debug(msg: string, ...meta: any[]): void {
        winston.debug(msg, ...meta);
    }

    static info(msg: string, ...meta: any[]): void {
        winston.info(msg, ...meta);
    }

    static warn(msg: string, ...meta: any[]): void {
        winston.warn(msg, ...meta);
    }

    static error(msg: string, ...meta: any[]): void {
        winston.error(msg, ...meta);
    }

    /**
     * create a logger, but not add it to the collection
     * @param options the options of the logger
     */
    static createLogger(options: FultonLoggerOptions): FultonLogger {
        return new winston.Logger(options);
    }

    /**
     * get an existing logger from the collection
     * @param name the name of the loggger
     */
    static getLogger(name: string): FultonLogger {
        return winston.loggers.get(name);
    }

    /**
     * create a logger and add it to the collection
     * @param name the name of the loggger
     * @param options the options of the logger
     */
    static addLogger(name: string, options: FultonLoggerOptions): FultonLogger {
        return winston.loggers.add(name, options);
    }
}

(winston.default.transports.console as any).colorize = true;