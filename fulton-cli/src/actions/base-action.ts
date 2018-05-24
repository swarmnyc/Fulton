import { Spinner } from 'cli-spinner';
import { IFultonConfig } from '../interfaces';
import { AppVersion, CWD } from '../constants';
import * as fs from 'fs';
import * as path from 'path';

export abstract class BaseAction {
    protected spinner = new Spinner();

    constructor(protected logger: Logger) { }

    async abstract start(): Promise<void>;

    updateFultonConfig(config: IFultonConfig, root: string = CWD) {
        config.version = AppVersion

        fs.writeFileSync(path.join(root, ".fulton"), JSON.stringify(config, null, 2));
    }
}