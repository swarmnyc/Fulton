import { NextFunction, Request, Response, Type } from '../interfaces';

export interface OutputCacheOptions {

}

// TODO: move to interfaces
export interface OutputCacheService {
    get(): string
    set(key: string, value: string): string
    remove(key: string): string
    clean(): void
}

// TODO: move to service
export class MemoryOutputCacheService implements OutputCacheService {
    get(): string {
        throw new Error("Method not implemented.");
    }
    set(key: string, value: string): string {
        throw new Error("Method not implemented.");
    }
    remove(key: string): string {
        throw new Error("Method not implemented.");
    }
    clean(): void {
        throw new Error("Method not implemented.");
    }
}

var testCache = new Map<string, string>()

/**
 * custom authenticate for router action
 * # Example 1
 * ```
 * @router("/news", News)
 * export class NewsRouter extends EntityRouter {
 *     @httpGet("", outputCache())
 *     list(req: Request, res: Response) {
 *         super.update(req, res);
 *     }
 * }
 * ```
 * # Example 2
 * ```
 * @router("/news", News)
 * export class NewsRouter extends EntityRouter {
 *     onInit() {
 *         this.metadata.actions.get("list").middlewares.push(outputCache());
 *     }
 * }
 * ```
 */
export function outputCache(options?: OutputCacheOptions) {
    return function (req: Request, res: Response, next: NextFunction) {
        var key = `${req.originalUrl}|${req.get("content-type")}`
        if (testCache.has(key)) {
            console.log("hit cache", key) // TODO: remove
            // return cache
            res.set("content-type", req.get("accept") || req.get("content-type"))
            res.send(testCache.get(key))
            return
        }

        // if response type is json-api, it overides json-api's send proxy, otherwise it overide origin res.send
        res.send = new Proxy(res.send, {
            apply: (send: Function, thisArg: Response, args: any[]) => {
                if (typeof args[0] == "string") {
                    console.log("set cache", key) // TODO: remove
                    // set cache
                    testCache.set(key, args[0])
                }

                send.apply(thisArg, args);
            },
        });

        next();
    }
}