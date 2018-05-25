import { Spinner } from 'cli-spinner';
import { IFultonConfig } from '../interfaces';
import { AppVersion, CWD, Logger } from '../constants';
import * as fs from 'fs';
import * as path from 'path';
import { LoggerInstance } from 'winston';

export abstract class BaseAction {
    protected logger: LoggerInstance;
    protected spinner = new Spinner();

    constructor() {
        this.logger = Logger
    }

    async abstract start(): Promise<void>;

    updateFultonConfig(config: IFultonConfig, root: string = CWD) {
        config.version = AppVersion

        fs.writeFileSync(path.join(root, ".fulton"), JSON.stringify(config, null, 2));
    }
}