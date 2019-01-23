import { ICacheServiceFactory, ICacheService } from "../../types";
import { Service } from "../service";
import * as Cache from "lru-cache"

export default class MemoryCacheServiceFactory extends Service implements ICacheServiceFactory {
    map = new Map<string, ICacheService>()
    getCacheService(namespace: string): ICacheService {
        if (this.map.has(namespace)) return this.map.get(namespace)

        let service = new MemoryCacheService(namespace, this.app.options.cache.defaultMaxAge)
        this.map.set(namespace, service)

        return service
    }

    resetAll(): void {
        this.map.forEach((value) => {
            value.reset()
        })
    }
}

export class MemoryCacheService implements ICacheService {
    isTypeLost = false
    cache = new Cache()

    constructor(public namespace: string, private defaultMaxArg: number) { }

    get(key: string, defaultValue?: any): Promise<any> {
        return Promise.resolve(this.cache.get(key) || defaultValue)
    }

    set(key: string, value: any, maxArg: number): Promise<void> {
        this.cache.set(key, value, maxArg || this.defaultMaxArg)
        return Promise.resolve()
    }

    delete(key: string): Promise<void> {
        this.cache.del(key)
        return Promise.resolve()
    }

    reset(): Promise<void> {
        this.cache.reset()
        return Promise.resolve()
    }
}