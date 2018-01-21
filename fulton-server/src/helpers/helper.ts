const booleanReg = /^((true)|(false))$/i;
const trueReg = /^((true)|1)$/i;

export default class Helper {
    static isBoolean(str: string): boolean {
        return booleanReg.test(str);
    }

    static getBoolean(str: string, defaultValue: boolean = false): boolean {
        if (str == null)
            return defaultValue;

        return trueReg.test(str);
    }

    static isNumber(str: string): boolean {
        return !isNaN(parseFloat(str));
    }

    static getInt(str: string, defaultValue: number = 0): number {
        if (str == null)
            return defaultValue;

        return parseInt(str) || defaultValue;
    }

    static getFloat(str: string, defaultValue: number = 0): number {
        if (str == null)
            return defaultValue;

        return parseFloat(str) || defaultValue;
    }
}




