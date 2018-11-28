import { Env, Helper } from '../helpers';
import { Middleware, Type, ICacheProvideService } from '../interfaces';
import { BaseOptions } from './options';


export interface RedisConnectionOptions {
    host?: string
    port?: number
    path?: string
    url?: string
    password?: string
    db?: string
    connect_timeout?: string
}

export class CacheOptions extends BaseOptions<CacheOptions> {
    /**
     * if true, the app will enable cache.
     * the default value is false
     * It can be overridden by env["{appName}.options.cache.enabled"]
     */
    enabled?: boolean = false;

    /**
     * the default value is memory. However, if the service field is not null, the value will become "other"
     */
    type: "memory" | "redis" | "other" = "memory"

    /**
     * if the value is null, the app will look at type. If type is memory, use MemoryCacheProvider. If type is redis, use RedisCacheProvider
     */
    providerService?: Type<ICacheProvideService>

    /**
     * the default is 10 minutes
     */
    defaultMaxAge: number = 600_000;

    /**
     * if true, the app will register a path to handle reset request
     * the default value is false
     */
    resetHandlerEnabled: boolean = false;

    /**
     * the path to handle reset request
     */
    resetPath: string = "/resetCaches"

    /**
     * custom middlewares for reset caches
     */
    middlewares?: Middleware[] = []

    /**
     * connection options for redis or other
     */
    connectionOptions: RedisConnectionOptions | any = {};

    init?(): void {
        this.enabled = Env.getBoolean(`${this.appName}.options.cache.enabled`, this.enabled);
        this.resetHandlerEnabled = Env.getBoolean(`${this.appName}.options.cache.resetHandlerEnabled`, this.resetHandlerEnabled);
        
        this.type = Env.get(`${this.appName}.options.cache.type`, this.type) as any;

        Env.parse(new RegExp(`^${this.appName}\\.options\\.cache\\.connectionOptions\\.(\\w+?)$`, "i"), this.connectionOptions)
    }
}