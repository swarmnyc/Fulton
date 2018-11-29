import { Env, Helper } from '../helpers';
import { Middleware, Type, ICacheServiceFactory, CacheProvider } from '../interfaces';
import { BaseOptions } from './options';


export interface CacheProviderConfigs {
    host?: string
    port?: number
    path?: string
    url?: string
    password?: string
    db?: string
    connect_timeout?: number
    [key: string]: any
}

export class CacheOptions extends BaseOptions<CacheOptions> {
    /**
     * if true, the app will enable cache.
     * the default value is false
     * It can be overridden by env["{appName}.options.cache.enabled"]
     */
    enabled?: boolean = false;

    /**
     * the provider of cache.
     * the default value is memory. However, if the service field is not null, the value will become "other"
     */
    provider: CacheProvider = "memory"

    /**
     * the type of service factory of notification. 
     * if the provider is other, this value is required,
     * by default, 
     * if the provider is memory, use Fulton Default MemoryCacheProvider.
     * if the provider is redis, use Fulton Default RedisCacheProvider.
     */
    serviceFactory?: Type<ICacheServiceFactory>

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
     * the configs to provider
     * 
     * the value can be overridden by
     * `env["{appName}.options.cache.configs.{name}"]`
     */
    configs: CacheProviderConfigs = {};

    init?(): void {
        this.enabled = Env.getBoolean(`${this.appName}.options.cache.enabled`, this.enabled);
        this.resetHandlerEnabled = Env.getBoolean(`${this.appName}.options.cache.resetHandlerEnabled`, this.resetHandlerEnabled);

        this.provider = Env.get(`${this.appName}.options.cache.provider`, this.provider) as any;

        Env.parse(new RegExp(`^${this.appName}\\.options\\.cache\\.configs\\.(\\w+?)$`, "i"), this.configs)
    }
}