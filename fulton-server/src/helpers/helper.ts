import * as escapeStringRegexp from 'escape-string-regexp';
import * as http from 'http';
import * as tls from 'tls';
import { Request } from '../interfaces';


let urlJoin: ((...args: string[]) => string) = require('url-join');

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

    baseUrl(req: Request) {
        // x-forwarded-proto is from proxy like AWS load balancer
        let protocol = req.header("x-forwarded-proto") || req.protocol;
        return `${protocol}://${req.get("host")}`;
    },

    baseUrlRaw(req: http.IncomingMessage) {
        // x-forwarded-proto is from proxy like AWS load balancer
        let protocol = req.headers["x-forwarded-proto"];
        if (!protocol){
            protocol = (req.connection instanceof tls.TLSSocket) ? "https" : "http"
        }

        return `${protocol}://${req.headers["host"]}`;
    },

    urlResolve(req: Request, ...pathes: string[]) {
        let baseUrl = req.fultonApp.baseUrl;

        if (pathes == null || pathes.length == 0) {
            return baseUrl;
        } else {
            return urlJoin(baseUrl, ...pathes)
        }
    },

    urlJoin: urlJoin
}


