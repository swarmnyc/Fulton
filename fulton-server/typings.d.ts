import { IDebugger } from 'debug';
import { IUserManager } from './src/index';

// custom helpers

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

declare global {
    namespace Express {
        interface Request {
            user?: any;
            userManager?: IUserManager
        }
    }
}