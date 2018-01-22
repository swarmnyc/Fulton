import { IDebugger, IFormatters } from 'debug';

// custom helpers

declare global {
    /**
     * shortcut for debug("Fulton")
     */
    var fultonDebug: IDebugger; // loaded in ./src/index.ts

    /**
     * call the func if the debug is enabled, good for heavy output.
     * @param func function that return [msg:string, arg1:any, arg2:any, ....] or return msg:string
     */
    var fultonDebugFunc: (func: () => string | any[]) => void; // loaded in ./src/index.ts
}