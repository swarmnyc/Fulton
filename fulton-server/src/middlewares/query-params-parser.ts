import { Request, Response, NextFunction, QueryParams, QueryColumnOptions } from "../interfaces";
import { Helper } from "../helpers/helper";

let optReg = /^([+-]?)(.+?)([+-]?)$/;
function parseOptionsString(arrStr: string): QueryColumnOptions {
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
            let way = (match[1] == "-" || match[3] == "-") ? -1 : 1;
            options[name] = way;
        }
    }

    return options;
}

function parseOptionsObject(input: any): QueryColumnOptions {
    let sort: QueryColumnOptions = {};
    for (const name of Object.getOwnPropertyNames(input)) {
        let value = input[name];

        if (typeof value == "string") {
            let direction = Helper.getInt(value);
            if (direction != null) {
                sort[name] = direction;
            }

        }
    }

    return sort;
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
        params = {};
        for (const name of Object.getOwnPropertyNames(req.query)) {
            let value = req.query[name];

            switch (name) {
                case "filter":
                    // express use https://www.npmjs.com/package/qs, which supports filter[a][b]=c
                    if (typeof value == "object") {
                        params.filter = params.filter ? Object.assign(params.filter, value) : value;
                    }
                    continue;
                case "sort":
                    if (typeof value == "string") {
                        params.sort = parseOptionsString(value);
                    } else if (typeof value == "object") {
                        params.sort = parseOptionsObject(value);
                    }
                    continue;
                case "projection":
                    if (typeof value == "string") {
                        params.projection = parseOptionsString(value);
                    } else if (typeof value == "object") {
                        params.projection = parseOptionsObject(value);
                    }
                    continue;
                case "select":
                    if (typeof value == "string") {
                        params.select = parseString(value);
                    } else if (value instanceof Array) {
                        params.select = parseArray(value);
                    }
                    continue;
                case "include":
                case "includes":
                    if (typeof value == "string") {
                        params.includes = parseString(value);
                    } else if (value instanceof Array) {
                        params.includes = parseArray(value);
                    }
                    continue;
                case "pagination":
                    if (typeof value == "object") {
                        params.pagination = {
                            index: Helper.getInt(value.index, 0),
                            size: Helper.getInt(value.size)
                        }
                    }
                    continue;
            }

            // others into filter, like ?a=123,b=123
            if (params.filter == null) params.filter = {};
            params.filter[name] = value;
        }
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