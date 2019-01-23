import * as redis from "redis";
import { FultonLog } from "../../fulton-log";
import { ICacheService, ICacheServiceFactory } from "../../types";
import { Service } from "../service";

export default class RedisCacheServiceFactory extends Service implements ICacheServiceFactory {
    client: redis.RedisClient
    onInit() {
        this.client = redis.createClient(this.app.options.cache.configs)
    }

    getCacheService(namespace: string): ICacheService {
        return new RedisCacheService(namespace, this.app.options.cache.defaultMaxAge, this.client)
    }

    resetAll(): void {
        this.client.flushall()
    }
}

export class RedisCacheService implements ICacheService {
    isTypeLost = true
    constructor(public namespace: string, private defaultMaxArg: number, private client: redis.RedisClient) { }

    get(key: string): Promise<any> {
        return new Promise((resolve) => {
            this.client.get(`${this.namespace}::${key}`, (error, result) => {
                if (error) {
                    FultonLog.error("RedisCacheService get failed by", error)
                    resolve(null)
                } else if (result) {
                    resolve(JSON.parse(result))
                } else {
                    resolve()
                }
            })
        })
    }

    set(key: string, value: any, maxArg: number): Promise<void> {
        return new Promise((resolve) => {
            this.client.psetex(`${this.namespace}::${key}`, maxArg || this.defaultMaxArg, JSON.stringify(value), (error) => {
                if (error) {
                    FultonLog.error("RedisCacheService set failed by", error)
                }

                resolve()
            })
        })
    }

    delete(key: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.client.del(`${this.namespace}::${key}`, (error) => {
                if (error) {
                    FultonLog.error("RedisCacheService del failed by", error)
                }

                resolve()
            })
        })
    }

    reset(): Promise<void> {
        return new Promise((resolve) => {
            this.client.keys(`${this.namespace}::*`, (error, keys) => {
                if (error) {
                    FultonLog.error("RedisCacheService get keys failed by", error)
                }

                this.client.del(...keys, () => {
                    if (error) {
                        FultonLog.error("RedisCacheService del keys failed by", error)
                    }

                    resolve()
                })
            })
        })
    }
}