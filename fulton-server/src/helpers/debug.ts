import * as debug from "debug";
import { isArray } from "util";

let g:any = global;

/**
 * shortcut for debug("Fulton")
 */
g.fultonDebug = debug("Fulton");

/**
 * call the func if the debug is enabled, good for heavy output.
 * @param func function that return [msg:string, arg1:any, arg2:any, ....] or return msg:string
 */
g.fultonDebugFunc = async (func: () => any[]) => {
    if (fultonDebug.enabled) {
        let result = await func();

        if (!isArray(result)) {
            result = [result]; // have to be array
        }

        fultonDebug.apply(fultonDebug, result);
    }
};