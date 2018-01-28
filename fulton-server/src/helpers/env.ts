import Helper from "./helper";

/**
 * A helper to get process.env value
 */
export default class Env {
    static get(name: string, defaultValue?: string): string {
        return process.env[name] || defaultValue;
    }

    /**
     * get value and parse to boolean the condition is /(true)|1/i;
     * @param name 
     * @param defaultValue is null
     * @param caseless 
     */
    static getBoolean(name: string, defaultValue?: boolean): boolean {
        return Helper.getBoolean(Env.get(name, null), defaultValue);
    }

    /**
     * get value and parse to int; 
     * @param name 
     * @param defaultValue is null
     * @param caseless 
     */
    static getInt(name: string, defaultValue?: number): number {
        return Helper.getInt(Env.get(name, null), defaultValue);
    }

    /**
     * get value and parse to float; 
     * @param name 
     * @param defaultValue is null
     * @param caseless 
     */
    static getFloat(name: string, defaultValue?: number): number {
        let value = Env.get(name, null);
        if (value == null)
            return defaultValue;

        return Helper.getFloat(Env.get(name, null), defaultValue);
    }

    static stage: string = process.env["NODE_ENV"] || "dev";
    static isProduction: boolean = /(prod)|(production)/i.test(process.env["NODE_ENV"])
}