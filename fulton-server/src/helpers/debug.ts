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

export function fultonDebugMaster(tag: string, func: (clack: Chalk) => string | any[]): boolean
export function fultonDebugMaster(tag: string, format: string, ...args: any[]): boolean
export function fultonDebugMaster(tag: string, ...args: any[]): boolean {
    if (cluster.isWorker) {
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

            if (!isArray(result)) {
                result = [result]; // have to be array
            }

            logger.apply(fultonDebug, result);
        } else {
            logger.apply(fultonDebug, args);
        }

        return true;
    }

    return false;
};