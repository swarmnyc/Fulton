import * as winston from "winston";
import { NPMLoggingLevel } from "winston";
import { addProcessInfo } from './helpers/debug';
import { Dict } from "./types";


/**
 * equals to winston.LoggerInstance
 */
export declare type FultonLogger = winston.LoggerInstance;

/**
 * equals to winston.LoggerOptions
 */
export declare type FultonLoggerOptions = winston.LoggerOptions;

export type FultonLoggerLevel = NPMLoggingLevel;

/**
 * FultonLog is static class that wraps winston, default logger is console,
 * use winston levels as 
 * { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }
 * 
 * more usage you can see winston doc https://www.npmjs.com/package/winston
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
 *     new (winston.transports.File)({ filename: 'some-file.log' })
 *   ]
 * });
 * 
 * @example //add new logger
 * let logger = FultonLog.addLogger("test", {
 *   transports: [
 *     new (winston.transports.File)({ filename: 'some-file.log' })
 *   ]
 * });
 *
 * logger.debug("test")
 */
export let FultonLog = {
    get level(): FultonLoggerLevel {
        return winston.level as FultonLoggerLevel;
    },

    set level(level: FultonLoggerLevel) {
        (winston as Dict).level = level;
    },

    /**
     * change default logger configure
     * @param options 
     */
    configure(options: FultonLoggerOptions): void {
        winston.configure(options);
    },

    log(level: string, msg: string, ...meta: any[]): void {
        winston.log(level, addProcessInfo(msg), ...meta);
    },

    debug(msg: string, ...meta: any[]): void {
        winston.debug(addProcessInfo(msg), ...meta);
    },

    info(msg: string, ...meta: any[]): void {
        winston.info(addProcessInfo(msg), ...meta);
    },

    warn(msg: string, ...meta: any[]): void {
        winston.warn(addProcessInfo(msg), ...meta);
    },

    error(msg: string, ...meta: any[]): void {
        winston.error(addProcessInfo(msg), ...meta);
    },

    /**
     * create a logger, but not add it to the collection
     * @param options the options of the logger
     */
    createLogger(options: FultonLoggerOptions): FultonLogger {
        return new winston.Logger(options);
    },

    /**
     * get an existing logger from the collection
     * @param name the name of the logger
     */
    getLogger(name: string): FultonLogger {
        return winston.loggers.get(name);
    },

    /**
     * create a logger and add it to the collection
     * @param name the name of the logger
     * @param options the options of the logger
     */
    addLogger(name: string, options: FultonLoggerOptions): FultonLogger {
        return winston.loggers.add(name, options);
    }
}