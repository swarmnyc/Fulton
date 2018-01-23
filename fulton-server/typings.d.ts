import { IDebugger } from 'debug';
import {Request, FultonUser, FuttonUserService } from './src/index';

// custom types for helping development;

declare global {
    var fultonDebug: IDebugger;
    var fultonDebugFunc: (func: () => string | any[]) => void;

    namespace NodeJS {
        interface Global {
            fultonDebug: IDebugger;
            fultonDebugFunc: (func: () => string | any[]) => void;
        }
    }
}