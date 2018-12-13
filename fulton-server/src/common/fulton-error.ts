import * as lodash from 'lodash';
import { FultonErrorObject, FultonErrorDetail, FultonErrorDetailItem } from '../interfaces';

export enum ErrorCodes {
    Unknown = "unknown_error",
    Invalid = "invalid",
    Existed = "existed",
    NotExisted = "not-existed",
}

/**
 * The error that returns to client
 * 
 * ## example
 * ```
 * throws new FultonError({ "username": ["username is required!"] });
 * ```
 * 
 */
export class FultonError implements Error {
    name: "FultonError"
    error: FultonErrorObject;
    status: number;

    constructor()
    constructor(code: string, message?: string, status?: number)
    constructor(input?: FultonErrorObject, status?: number)
    constructor(...args: any[]) {
        if (args.length == 0) {
            this.error = {};
        } else {
            if (typeof args[0] == "string") {
                this.error = {
                    code: args[0]
                }
            } else {
                this.error = args[0] || {};
            }

            if (args.length > 1) {
                if (typeof args[1] == "string") {
                    this.error.message = args[1]
                } else if (typeof args[1] == "number") {
                    this.status = args[1];
                }

                if (args.length > 2) {
                    this.status = args[2];
                }
            }
        }

        if (this.status == null) {
            this.status = 400
        }
    }

    set(code: string, message?: string) {
        this.error.code = code;
        this.error.message = message;

        return this;
    }

    addDetail(propertyName: string, errorCode: string, errorMessage?: string): FultonError
    addDetail(propertyName: string, constraints: FultonErrorDetailItem): FultonError
    addDetail(propertyName: string, ...args: any[]): FultonError {
        let item: FultonErrorDetailItem;
        if (args.length == 1) {
            if (typeof args[0] == "string") {
                item = {
                    code: args[0]
                }
            } else {
                item = args[0]
            }
        } else if (args.length == 2) {
            item = {
                code: args[0],
                message: args[1]
            }
        } else {
            // not support
            return
        }

        if (this.error.detail == null) {
            this.error.detail = {};
        }

        if (this.error.detail[propertyName] == null) {
            this.error.detail[propertyName] = [item];
        } else {
            this.error.detail[propertyName].push(item)
        }

        return this;
    }

    verifyRequired(target: any, propertyName: string, errorMessage?: string): boolean {
        let value;
        if (typeof target == "object") {
            value = target[propertyName]
        } else {
            value = target
        }

        if (!lodash.some(value)) {
            this.addDetail(propertyName, "required", errorMessage || `${propertyName} is required`);
            return false;
        }

        return true;
    }

    verifyRequiredList(target: any, propertyNames: string[], errorMessages?: string[]): boolean {
        let result: boolean = true;

        propertyNames.forEach((name: string, i: number) => {
            result = this.verifyRequired(target, name, errorMessages ? errorMessages[i] : null) && result
        });

        return result;
    }

    hasError(): boolean {
        return this.error.detail != null;
    }

    get code(): string {
        return this.error.code
    }

    get message(): string {
        return JSON.stringify(this)
    }

    public toJSON() {
        return {
            error: this.error
        };
    }
}

/**
 * Record Error for recursive operation;
 */
export class FultonStackError extends FultonError {
    private properties: string[];

    constructor(code: string) {
        super(code);

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

    add(errorCode: string, errorMessage: string, addNameToMessage?: boolean): FultonStackError {
        if (this.error.detail == null) {
            this.error.detail = {};
        }

        let propertyName = this.properties.join(".");

        if (addNameToMessage && this.properties.length > 0) {
            errorMessage = `${this.properties[this.properties.length - 1]} ${errorMessage}`
        }

        this.addDetail(propertyName, errorCode, errorMessage)

        return this;
    }
}