import { BaseOptions } from './options';
import { CorsOptions as CorsOpts } from 'cors';
import { Env } from '../helpers';
import { Middleware } from '../interfaces';

export class CorsOptions extends BaseOptions<CorsOptions> {
    /**
     * if true, app will enable cors.
     * the default value is false
     * It can be overridden by process.env["{appName}.options.cors.enabled]
     */
    enabled: boolean = false;

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

    init?(appName: string): void {
        this.enabled = Env.getBoolean(`${appName}.options.cors.enabled`, this.enabled);
    }
}