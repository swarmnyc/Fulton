import { QueryParams, QueryColumnOptions } from "../interfaces";
import { Request, Response, NextFunction } from "../alias";
import { Helper } from "../helpers/helper";

let optReg = /^([+-]?)(.+?)([+-]?)$/;
function parseOptionsString(arrStr: string, positive: number, negative: number): QueryColumnOptions {
    let options: QueryColumnOptions;

    let arr = arrStr.split(",");
    if (arr.length > 0) {
        options = {};
        for (let str of arr) {
            str = str.trim();
            if (!str) continue;

            let match = optReg.exec(str);
            if (match == null) continue;

            let name = match[2];
            let way = (match[1] == "-" || match[3] == "-") ? negative : positive;
            options[name] = way;
        }
    }

    return options;
}

function parseOptionsObject(input: any): QueryColumnOptions {
    let options: QueryColumnOptions = {};
    Object.getOwnPropertyNames(input).forEach((name) => {
        let value = input[name];

        if (typeof value == "string") {
            let direction = Helper.getInt(value);
            if (direction != null) {
                options[name] = direction;
            }

        }
    })

    return options;
}

function parseString(arrStr: string): string[] {
    let result: string[] = [];

    let arr = arrStr.split(",");
    if (arr.length > 0) {
        for (let str of arr) {
            str = str.trim();
            result.push(str);
        }
    }

    return result;
}

function parseArray(arr: string[]): string[] {
    let result: string[] = [];
    for (let value of arr) {
        if (typeof value == "string") {
            value = value.trim();
            result.push(value);
        }
    }

    return result;
}

/**
 * @deprecated
 * put id into QueryParams
 * @param name router params like /users/:userId, the value should be userId
 */
export function queryById(name: string = "id") {
    return (req: Request, res: Response, next: NextFunction) => {
        if (req.params[name]) {
            if (req.queryParams.filter == null) {
                req.queryParams.filter = {
                    id: req.params[name]
                }
            } else {
                req.queryParams.filter[name] = req.params[name];
            }
        }

        next();
    }
}

export function queryParamsParser(req: Request, res: Response, next: NextFunction) {
    let params: QueryParams;
    if (req.query) {
        params = {
            needAdjust: true
        };

        Object.getOwnPropertyNames(req.query).forEach((name) => {
            let value = req.query[name];

            // query params does not parae other values
            switch (name) {
                case "filter":
                    // express use https://www.npmjs.com/package/qs, which supports filter[a][b]=c
                    if (typeof value == "object") {
                        params.filter = params.filter ? Object.assign(params.filter, value) : value;
                    }
                    break;
                case "sort":
                    if (typeof value == "string") {
                        params.sort = parseOptionsString(value, 1, -1);
                    } else if (typeof value == "object") {
                        params.sort = parseOptionsObject(value);
                    }
                    break;
                case "projection":
                    if (typeof value == "string") {
                        params.projection = parseOptionsString(value, 1, 0);
                    } else if (typeof value == "object") {
                        params.projection = parseOptionsObject(value);
                    }
                    break;
                case "select":
                    if (typeof value == "string") {
                        params.select = parseString(value);
                    } else if (value instanceof Array) {
                        params.select = parseArray(value);
                    }
                    break;
                case "include":
                case "includes":
                    if (typeof value == "string") {
                        params.includes = parseString(value);
                    } else if (value instanceof Array) {
                        params.includes = parseArray(value);
                    }
                    break;
                case "pagination":
                    if (typeof value == "object") {
                        params.pagination = {
                            index: Helper.getInt(value.index, 0),
                            size: Helper.getInt(value.size)
                        }
                    }
                    break;
            }
        })
    } else if (req.body && typeof req.body.query == "object") {
        params = {
            filter: req.body.query.filter,
            sort: req.body.query.sort,
            select: req.body.query.select,
            pagination: req.body.query.pagination
        }
    }

    req.queryParams = params;

    next();
}