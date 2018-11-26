import { Env } from '../helpers';
import { Middleware } from '../interfaces';
import { BaseOptions } from './options';

export class SecurityOptions extends BaseOptions<SecurityOptions> {
    /**
     * if true, the app will require client key for request.
     * the default value is false
     * It can be overridden by env["{appName}.options.security.enabled"]
     */
    enabled?: boolean = false;

    /**
     * the name for checking. for example, http://domain.com?{{field-name}}=key on the url,  x-{{field-name}}=key on the header.
     * the default value is "client-key"
     */
    fieldName?: string = "client-key"

    /**
     * custom middlewares for security
     */
    middlewares?: Middleware[] = []

    init?(): void {
        this.enabled = Env.getBoolean(`${this.appName}.options.security.enabled`, this.enabled);
    }
}