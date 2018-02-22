import * as lodash from 'lodash';
import { FultonErrorObject, FultonErrorConstraints, FultonErrorDetail, FultonErrorItem } from '../interfaces';

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

        if (this.errors.detail == null) {
            this.errors.detail = {};
        }
    }

    setMessage(msg: string) {
        this.errors.message = msg;
        return this;
    }

    addError(propertyName: string, errorMessage: string, constraints?: FultonErrorConstraints): FultonError {
        let error = this.errors.detail[propertyName] as FultonErrorItem
        if (error && "constraints" in error) {
            Object.assign(error.constraints, constraints);
        } else {
            this.errors.detail[propertyName] = { message: errorMessage, constraints };
        }

        return this;
    }

    addErrors(propertyName: string, constraints?: FultonErrorConstraints): FultonError {
        let error = this.errors.detail[propertyName] as FultonErrorConstraints
        if (error) {
            Object.assign(error, constraints);
        } else {
            this.errors.detail[propertyName] = constraints;
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
        return this.errors.message != null || Object.getOwnPropertyNames(this.errors.detail).length > 0;
    }
}