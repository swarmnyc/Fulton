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

    constructor(input?: FultonErrorObject | string) {
        if (typeof input == "string") {
            this.errors = {
                message: input
            }
        } else {
            this.errors = input || {};
        }
    }

    setMessage(msg: string) {
        this.errors.message = msg;
        return this;
    }

    addError(propertyName: string, errorMessage: string, constraints?: FultonErrorConstraints): FultonError {
        if (this.errors.detail == null) {
            this.errors.detail = {};
        }

        let error = this.errors.detail[propertyName] as FultonErrorItem
        if (error && "constraints" in error) {
            Object.assign(error.constraints, constraints);
        } else {
            this.errors.detail[propertyName] = { message: errorMessage, constraints };
        }

        return this;
    }

    addErrors(propertyName: string, constraints?: FultonErrorConstraints): FultonError {
        if (this.errors.detail == null) {
            this.errors.detail = {};
        }

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
        return this.errors.message != null || this.errors.detail != null;
    }

    public toJSON() {
        return {
            errors: this.errors
        };
    }
}

/**
 * Record Error for recursive operation;
 */
export class FultonStackError extends FultonError {
    private properties: string[];

    constructor(message: string) {
        super(message);

        this.properties = [];
    }

    push(propertyName: string): FultonStackError {
        this.properties.push(propertyName);
        return this;
    }

    pop(): FultonStackError {
        this.properties.pop();
        return this;
    }

    /** the wrapper for forEach in order to add i into stack */
    forEach<T>(value: Array<T>, func: (value: T, index: number) => void): void {
        value.forEach((item: any, i: number) => {
            this.push(i.toString())
            func(item, i);
            this.pop();
        })
    }

    /** the wrapper for map in order to add i into stack */
    map<T>(value: Array<T>, func: (value: T, index: number) => T): T[] {
        return value.map((item: any, i: number) => {
            this.push(i.toString())
            let result = func(item, i);
            this.pop();

            return result;
        });
    }

    add(errorMessage: string, addNameToMessage?: boolean): FultonStackError {
        if (this.errors.detail == null) {
            this.errors.detail = {};
        }

        let propertyName = this.properties.join(".");

        if (addNameToMessage && this.properties.length > 0) {
            errorMessage = `${this.properties[this.properties.length - 1]} ${errorMessage}`
        }

        this.errors.detail[propertyName] = errorMessage;

        return this;
    }

    hasErrors(): boolean {
        return this.errors.detail != null;
    }
}