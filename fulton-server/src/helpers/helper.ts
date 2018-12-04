import * as crypto from 'crypto';
import * as escapeStringRegexp from 'escape-string-regexp';
import * as http from 'http';
import * as tls from 'tls';
import { Request } from '../alias';

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
        if (!protocol) {
            protocol = (req.connection instanceof tls.TLSSocket) ? "https" : "http"
        }

        return `${protocol}://${req.headers["host"]}`;
    },

    urlResolve(req: Request, ...paths: string[]) {
        let baseUrl = req.fultonApp.baseUrl;

        if (paths == null || paths.length == 0) {
            return baseUrl;
        } else {
            return urlJoin(baseUrl, ...paths)
        }
    },

    hash(data: string | Buffer): Buffer {
        let stream = crypto.createHash("sha256");
        stream.write(data);
        stream.end();

        return stream.read() as Buffer;
    },

    hmac(data: string | Buffer, salt: string | Buffer): Buffer {
        let stream = crypto.createHmac("sha256", salt);
        stream.write(data);
        stream.end();

        return stream.read() as Buffer;
    },

    toBase64(data: string | Buffer) {
        if (data instanceof Buffer) {
            return data.toString("base64")
        }

        return Buffer.from(data).toString("base64");
    },

    urlJoin: urlJoin
}


