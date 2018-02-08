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

    verifyRequired(target: any, propertyName: string, errorMessages?: string): boolean
    verifyRequired(target: any, propertyNames: string[], errorMessages?: string[]): boolean
    verifyRequired(target: any, arg1: any, arg2: any): boolean {
        let result: boolean = true;
        if (arg1 instanceof Array) {
            let propertyNames: string[] = arg1;
            let errorMessages: string[] = arg2;

            propertyNames.forEach((name: string, i: number) => {
                result = this.verifyRequired(target, name, errorMessages ? errorMessages[i] : null) && result
            });
        } else {
            let propertyName: string = arg1;
            let errorMessage: string = arg2;

            if (!lodash.some(target[propertyName])) {
                this.addError(propertyName, errorMessage || `${propertyName} is required`);
                return false;
            }
        }

        return result;
    }

    hasErrors(): boolean {
        return Object.getOwnPropertyNames(this.errors).length > 0;
    }
}