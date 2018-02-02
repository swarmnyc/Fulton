import * as lodash from 'lodash';
import { FultonErrorObject } from '../interfaces';

/**
 * The error that returns to client
 * 
 * ## example
 * ```
 * throws new FultonError({ "username": ["username is required!"] });
 * ```
 * 
 */
export class FultonError {
    errors: FultonErrorObject;

    constructor(errors?: FultonErrorObject) {
        this.errors = errors || {};
    }


    addError(errorMessage: string): FultonError;
    addError(propertyName: string, errorMessage: string): FultonError;
    addError(...args: string[]): FultonError {
        let propertyName: string;
        let errorMessage: string;
        if (args.length == 2) {
            propertyName = args[0];
            errorMessage = args[1];
        } else {
            propertyName = "message";
            errorMessage = args[0];            
        }

        if (this.errors[propertyName]) {
            this.errors[propertyName].push(errorMessage);
        } else {
            this.errors[propertyName] = [errorMessage];
        }
        
        return this;
    }

    verifyRequireds(target: any, propertyNames: string[], errorMessages?: string[]): boolean {
        let result: boolean = true;
        propertyNames.forEach((name: string, i: number) => {
            result = this.verifyRequired(target, name, errorMessages ? errorMessages[i] : null) && result
        });

        return result;
    }

    verifyRequired(target: any, propertyName: string, errorMessage?: string): boolean {
        if (!lodash.some(target[propertyName])) {
            this.addError(propertyName, errorMessage || `${propertyName} is required`);
            return false;
        }

        return true;
    }

    hasErrors(): boolean {
        return Object.getOwnPropertyNames(this.errors).length > 0;
    }
}