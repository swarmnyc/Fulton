import { Middleware } from "../alias";
import { BaseOptions } from './options';
import { Env } from "../helpers";

export class IndexOptions extends BaseOptions<IndexOptions> {
    /**
     * If true, log every http request.
     * The default is true.
     * It can be overridden by env["{appName}.options.index.enabled"]
     */
    enabled?: boolean = true;

    /**
      * custom response middleware function
      */
    handler?: Middleware;

    /**
     * response the index file, like index.html
     */
    filepath?: string;

    /**
     * response the static message
     */
    message?: string;

    init?(): void {
        this.enabled = Env.getBoolean(`${this.appName}.options.index.enabled`, this.enabled)

        if (this.message == null && this.handler == null && this.filepath == null) {
            this.message = `${this.appName} works.`
        }
    }
}