import { CompressionOptions as CompressionOpts } from 'compression';
import { Middleware } from '../alias';
import { Env } from '../helpers';
import { BaseOptions } from './options';

export class CompressionOptions extends BaseOptions<CompressionOptions> {
    /**
     * if true, app will enable compression.
     * the default value is false
     * It can be overridden by env["{appName}.options.compression.enabled"]
     */
    enabled?: boolean = false;

    /**
     * the options for compression.
     * the default value is null, 
     * this value will be ignored if middlewares is not empty.
     * 
     * ## equivalent
     * ```
     * app.use(compression(options))
     * ```
     */
    options?: CompressionOpts;

    /**
     * custom middlewares for compression
     */
    middlewares?: Middleware[] = []

    init?(): void {
        this.enabled = Env.getBoolean(`${this.appName}.options.compression.enabled`, this.enabled);
    }
}