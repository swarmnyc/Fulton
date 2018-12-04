import { Env } from '../helpers';
import { BaseOptions } from './options';

export class MiscellaneousOptions extends BaseOptions<MiscellaneousOptions> {
    /**
     * use zone.js for context management.
     * the default value is true
     * It can be overridden by env["{appName}.options.miscellaneous.zoneEnabled]
     */
    zoneEnabled?: boolean = true;

    /**
     * the size of a page for pagination.
     * the default value is 20
     * It can be overridden by env["{appName}.options.miscellaneous.paginationSize]
     */
    paginationSize?: number = 20;

    init?(): void {
        this.zoneEnabled = Env.getBoolean(`${this.appName}.options.miscellaneous.enabled`, this.zoneEnabled);
        this.paginationSize = Env.getInt(`${this.appName}.options.miscellaneous.paginationSize`, this.paginationSize);
    }
}