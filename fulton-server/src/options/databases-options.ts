import { ConnectionOptions, Repository } from 'typeorm';
import { Helper } from '../helpers/helper';
import { Options } from './options';

export class DatabaseOptions implements Options {    
    map: Map<string, ConnectionOptions> = new Map();

    constructor(protected appName: string, protected appMode: string) {}

    get size(): number {
        return this.map.size;
    }

    set(key: string, options: ConnectionOptions): DatabaseOptions {
        this.map.set(key, options);
        return this;
    }

    get(key: string): ConnectionOptions {
        return this.map.get(key);
    }

    delete(key: string): DatabaseOptions {
        this.map.delete(key);
        return this;
    }

    forEach(func: (key: string, options: ConnectionOptions) => void): DatabaseOptions {
        this.map.forEach((options, key) => {
            func(key, options);
        });

        return this;
    }

    init?(): void {
        let defaultReg = new RegExp(`^${this.appName}\\.options\\.database\\.(\\w+?)$`, "i");
        let namedReg = new RegExp(`^${this.appName}\\.options\\.databases\\.(\\w+?)\\.(\\w+?)$`, "i");

        for (const key in process.env) {
            let connName, propName, value;
            let match = defaultReg.exec(key)
            if (match) {
                connName = "default";
                propName = match[1];
                value = process.env[key];
            } else if ((match = namedReg.exec(key))) {
                connName = match[1];
                propName = match[2];
                value = process.env[key];
            } else {
                continue;
            }

            let options: any;
            if (this.map.has(connName)) {
                options = this.map.get(connName);
            } else {
                options = {};
                this.map.set(connName, options as ConnectionOptions);
            }

            if (Helper.isBooleanString(value)) {
                options[propName] = Helper.getBoolean(value);
            } else if (Helper.isNumberString(value)) {
                options[propName] = Helper.getFloat(value);
            } else {
                options[propName] = value;
            }
        }
    }
}