import { Helper } from "./helper";

/**
 * A helper to get process.env value
 */
export let Env = {
    get(name: string, defaultValue?: string): string {
        return process.env[name] || defaultValue;
    },

    /**
     * get value and parse to boolean the condition is /(true)|1/i;
     * @param name 
     * @param defaultValue is null
     * @param caseless 
     */
    getBoolean(name: string, defaultValue?: boolean): boolean {
        return Helper.getBoolean(Env.get(name, null), defaultValue);
    },

    /**
     * get value and parse to int; 
     * @param name 
     * @param defaultValue is null
     * @param caseless 
     */
    getInt(name: string, defaultValue?: number): number {
        return Helper.getInt(Env.get(name, null), defaultValue);
    },

    /**
     * get value and parse to float; 
     * @param name 
     * @param defaultValue is null
     * @param caseless 
     */
    getFloat(name: string, defaultValue?: number): number {
        let value = Env.get(name, null);
        if (value == null)
            return defaultValue;

        return Helper.getFloat(Env.get(name, null), defaultValue);
    },
    /**
     * parse all env, if it matches the pattern, put the value into options
     */
    parse(pattern: RegExp, options: any): void {
         
        for (const key in process.env) {
            let propName, value;
            let match = pattern.exec(key)
            if (match) {
                propName = match[1];
                value = process.env[key];
            } else {
                continue;
            }

            if (Helper.isBooleanString(value)) {
                options[propName] = Helper.getBoolean(value);
            } else if (Helper.isNumberString(value)) {
                options[propName] = Helper.getFloat(value);
            } else {
                options[propName] = value;
            }
        }
    },
    stage: process.env["NODE_ENV"] || "dev",
    isProduction: /(prod)|(production)/i.test(process.env["NODE_ENV"])
}