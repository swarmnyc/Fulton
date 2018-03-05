import * as debug from "debug"
import * as cluster from 'cluster';
import clack, { Chalk } from "chalk";

import { Env } from './env';
import { IDebugger } from "debug";
import { isArray } from "util";
import { moduleExists } from "./module-helpers";

let loggers = new Map<string, IDebugger>();

function getLogger(tag: string): IDebugger {
    if (!loggers.has(tag)) {
        loggers.set(tag, debug(`fulton:${tag}`))
    }

    return loggers.get(tag);
}

/**
 * Only log if it is master
 */
export function fultonDebugMaster(tag: string, func: (clack: Chalk) => string | any[]): boolean
export function fultonDebugMaster(tag: string, format: string, ...args: any[]): boolean
export function fultonDebugMaster(tag: string, ...args: any[]): boolean {
    if (cluster.isMaster) {
        return fultonDebugCore(tag, ...args);
    }

    return false;
}


/**
 * call the func if the debug is enabled, good for heavy output.
 * @param func function that return [msg:string, arg1:any, arg2:any, ....] or return msg:string
 */
export function fultonDebug(tag: string, func: (clack: Chalk) => string | any[]): boolean
export function fultonDebug(tag: string, format: string, ...args: any[]): boolean
export function fultonDebug(tag: string, ...args: any[]): boolean {
    return fultonDebugCore(tag, ...args);
};

function fultonDebugCore(tag: string, ...args: any[]): boolean {
    if (Env.isProduction) return;

    let logger = getLogger(tag);

    if (logger.enabled && args.length > 0) {
        let arg1 = args[0];
        if (arg1 instanceof Function) {
            let result = arg1(clack);
            if (result == null) {
                return false;
            } else if (isArray(result)) {
                args = result;
            } else {
                args = [result]; // have to be array
            }
        }

        if (cluster.isWorker) {
            // if it is worker, add pid
            if (args.length > 0 && typeof args[0] == "string"){
                args[0] = addProceeInfo(args[0]);
            }
        }

        logger.apply(fultonDebug, args);

        return true;
    }

    return false;
};

/** if it is worker add pid infront of message */
export function addProceeInfo(msg: string): string {
    if (cluster.isWorker) {
        return `[${process.pid}] ` + msg;
    }

    return msg;
}