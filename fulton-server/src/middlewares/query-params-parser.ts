import { Request, Response, NextFunction, QueryParams } from "../interfaces";
import Helper from "../helpers/helper";

interface Sort {
    [key: string]: boolean;
}

let sortReg = /^([+-]?)(.+?)([+-]?)$/;
function parseSortString(arrStr: string): Sort {
    let sort: Sort;

    let arr = arrStr.split(",");
    if (arr.length > 0) {
        sort = {};
        for (let str of arr) {
            str = str.trim();
            if (!str) continue;

            let match = sortReg.exec(str);
            if (match == null) continue;

            let name = match[2];
            let way = (match[1] == "-" || match[3] == "-") ? false : true;
            sort[name] = way;
        }
    }

    return sort;
}

function parseSortObject(input: any): Sort {
    let sort: Sort = {};
    for (const name of Object.getOwnPropertyNames(input)) {
        let value = input[name];

        if (typeof value == "string") {
            sort[name] = Helper.getBoolean(value, false);
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
                        params.sort = parseSortString(value);
                    } else if (typeof value == "object") {
                        params.sort = parseSortObject(value);
                    }
                    continue;
                case "projection":
                    if (typeof value == "string") {
                        params.projection = parseString(value);
                    } else if (value instanceof Array) {
                        params.projection = parseArray(value);
                    }
                    continue;
                case "includes":
                    if (typeof value == "string") {
                        params.includes = parseString(value);
                    } else if (value instanceof Array) {
                        params.includes = parseArray(value);
                    }
                    continue;
                case "pagination":
                    if (typeof value == "object" && value.index) {
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
            projection: req.body.query.projection,
            pagination: req.body.query.pagination
        }
    }

    req.queryParams = params;

    next();
}