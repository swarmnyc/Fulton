import * as escapeStringRegexp from "escape-string-regexp";
import { Request } from '../interfaces';


let urlJoin:((...args:string[])=>string) = require('url-join');

const booleanReg = /^((true)|(false))$/i;
const trueReg = /^((true)|1)$/i;
const numberReg = /^\d+(?:.\d+)?$/;

export let Helper = {
    isBooleanString(str: string): boolean {
        return booleanReg.test(str);
    },

    getBoolean(str: string, defaultValue?: boolean): boolean {
        if (str == null)
            return defaultValue;

        return trueReg.test(str);
    },

    isNumberString(str: string): boolean {
        return numberReg.test(str);
    },

    getInt(str: string, defaultValue?: number): number {
        if (str == null)
            return defaultValue;

        let value = parseInt(str)
        return isNaN(value) ? defaultValue : value;
    },

    getFloat(str: string, defaultValue?: number): number {
        if (str == null)
            return defaultValue;

        let value = parseFloat(str)
        return isNaN(value) ? defaultValue : value;
    },

    /**
     * if object or value is null skip,
     * if object[name] is null then set value and return new value, 
     * otherwise skip set value and return old value
     * @param object 
     * @param name 
     * @param value 
     */
    default<T>(object: T, name: keyof T, value: any): any {
        if (object == null || value == null)
            return;

        if (object[name] == null) {
            object[name] = value;
            return value;
        } else {
            return object[name];
        }
    },

    escapedRegexp(input: string, flags?: string): RegExp {
        return new RegExp(escapeStringRegexp(input), flags);
    },

    urlResolve(req: Request, ...pathes: string[]) {
        // x-forwarded-proto is from proxy like AWS load balancer
        let protocol = req.header("x-forwarded-proto") || req.protocol;
        let domain = `${protocol}://${req.get("host")}`;

        if (pathes == null || pathes.length == 0){
            return domain;
        }else{
            return urlJoin(domain, ...pathes)
        }
    },

    urlJoin: urlJoin
}


