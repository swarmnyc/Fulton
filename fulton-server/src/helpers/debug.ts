import { isArray } from "util";
import { moduleExists } from "./module-helpers";
import { IDebugger } from "debug";

//it is loaded in ./src/index.ts
export let fultonDebug: IDebugger;
export let fultonDebugFunc: (func: () => string | any[]) => void;

if (moduleExists("debug")) {
    /**
     * shortcut for debug("Fulton")
     */
    fultonDebug = require("debug")("Fulton");
} else {
    // fake debug
    fultonDebug = function (formatter: any, ...args: any[]): void {
    } as any;

    fultonDebug.enabled = false;
}

/**
 * call the func if the debug is enabled, good for heavy output.
 * @param func function that return [msg:string, arg1:any, arg2:any, ....] or return msg:string
 */
fultonDebugFunc = (func: () => string | any[]): void => {
    if (fultonDebug.enabled) {
        let result = func();

        if (!isArray(result)) {
            result = [result]; // have to be array
        }

        fultonDebug.apply(fultonDebug, result);
    }
};
