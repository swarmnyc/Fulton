import { BaseOptions } from './options';
import { CorsOptions as CorsOpts } from 'cors';
import { Env } from '../helpers';
import { Middleware } from '../interfaces';

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

    init?(appName: string): void {
        this.zoneEnabled = Env.getBoolean(`${appName}.options.miscellaneous.enabled`, this.zoneEnabled);
        this.paginationSize = Env.getInt(`${appName}.options.miscellaneous.paginationSize`, this.paginationSize);
    }
}