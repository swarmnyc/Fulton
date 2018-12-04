import { CorsOptions as CorsOpts } from 'cors';
import { Middleware } from '../alias';
import { Env } from '../helpers';
import { BaseOptions } from './options';

export class CorsOptions extends BaseOptions<CorsOptions> {
    /**
     * if true, app will enable cors.
     * the default value is false
     * It can be overridden by env["{appName}.options.cors.enabled"]
     */
    enabled?: boolean = false;

    /**
     * the options for cors.
     * the default value is null, 
     * this value will be ignored if middlewares is not empty.
     * 
     * ## equivalent
     * ```
     * app.use(cors.static(options))
     * ```
     */
    options?: CorsOpts;

    /**
     * custom middlewares for cors
     */
    middlewares?: Middleware[] = []

    init?(): void {
        this.enabled = Env.getBoolean(`${this.appName}.options.cors.enabled`, this.enabled);
    }
}