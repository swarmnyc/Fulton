const booleanReg = /^((true)|(false))$/i;
const trueReg = /^((true)|1)$/i;
const numberReg = /^\d+(?:.\d+)?$/;

export default class Helper {
    static isBooleanString(str: string): boolean {
        return booleanReg.test(str);
    }

    static getBoolean(str: string, defaultValue?: boolean): boolean {
        if (str == null)
            return defaultValue;

        return trueReg.test(str);
    }

    static isNumberString(str: string): boolean {
        return numberReg.test(str);
    }

    static getInt(str: string, defaultValue?: number): number {
        if (str == null)
            return defaultValue;

        return parseInt(str) || defaultValue;
    }

    static getFloat(str: string, defaultValue?: number): number {
        if (str == null)
            return defaultValue;

        return parseFloat(str) || defaultValue;
    }

    /**
     * if object or value is null skip,
     * if object[name] is null then set value and return new value, 
     * otherwise skip set value and return old value
     * @param object 
     * @param name 
     * @param value 
     */
    static default<T>(object: T, name: keyof T, value: any): any {
        if (object == null || value == null)
            return;

        if (object[name] == null) {
            object[name] = value;
            return value;
        } else {
            return object[name];
        }
    }
}




