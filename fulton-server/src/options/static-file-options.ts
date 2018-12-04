import { ServeStaticOptions } from 'serve-static';
import { Middleware } from "../alias";
import { Env } from '../helpers';
import { PathIdentifier } from '../interfaces';
import { BaseOptions } from './options';

export class StaticFilesOptions extends BaseOptions<StaticFilesOptions> {
    /**
     * if true, app will serve static files.
     * the default value is false
     * It can be overridden by env["{appName}.options.staticFile.enabled]
     */
    enabled?: boolean = false;

    /**
     * the folders and options of static files.
     * the default value is [], this value will be ignored if middlewares is not empty.
     * 
     * ## equivalent
     * ```
     * // if path is null
     * app.use(express.static(folder, options))
     * 
     * // if path is not null
     * app.use(path, express.static(folder, options))
     * ```
     */
    folders?: {
        path?: PathIdentifier;
        folder: string;
        options?: ServeStaticOptions;
    }[] = []


    /**
     * custom middlewares for serving static files
     * default is []
     * ## equivalent
     * ```
     * // if path is null
     * app.use(middleware)
     * 
     * // if path is not null
     * app.use(path, middleware)
     * ```
     */
    middlewares?: {
        path?: PathIdentifier;
        middleware: Middleware;
    }[] = []

    init?(): void {
        this.enabled = Env.getBoolean(`${this.appName}.options.staticFile.enabled`, this.enabled);
    }
}