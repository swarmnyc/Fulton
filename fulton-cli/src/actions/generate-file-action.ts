import * as fs from 'fs';
import * as lodash from 'lodash';
import * as path from 'path';
import * as pluralize from 'pluralize';

import { CWD, FultonConfig } from '../constants';
import { GenerateFileOptions, SchematicOptions } from '../interfaces';
import { classify, normalizeFilename, pathToArray } from '../utils/strings';

import chalk from 'chalk';
import { templateFile } from '../utils/template';
import { exec } from 'child_process';
import { ensureDirSync } from '../utils/fs';
import { BaseAction } from './base-action';

const schematics: ({ [key: string]: SchematicOptions }) = {
    entity: {
        folder: "src/entities",
        property: "entities",
        suffix: "",
        action: (opts: GenerateFileOptions) => {
            if (!opts.dbConn) {
                opts.dbConn = "default"
            }

            if (!opts.dbEngine) {
                opts.dbEngine = FultonConfig.databases[opts.dbConn] || "mongodb"
            }

            if (opts.dbEngine == "mongodb") {
                opts.templatePath = `src/entities/mongodb/template.ts.tl`
            } else {
                opts.templatePath = `src/entities/sql/template.ts.tl`
            }

            opts.dbTableName = pluralize(opts.fileName)
        }
    },
    "entity-router": {
        folder: "src/routers",
        property: "routers",
        suffix: "-router",
        templatePath: "src/routers/entity-router.ts.tl",
        action: (opts: GenerateFileOptions) => {
            opts.entityName = opts.className.replace("Router", "");
            opts.entityFileName = opts.fileName.replace("-router", "");

            opts.routerPath = pluralize(opts.entityFileName)
        }
    },
    router: {
        folder: "src/routers",
        suffix: "-router",
        property: "routers",
        templatePath: "src/routers/template.ts.tl",
        action: (opts: GenerateFileOptions) => {
            opts.routerPath = opts.fileName.replace("-router", "");
        }
    },
    service: {
        folder: "src/services",
        suffix: "-service",
        property: "services",
        templatePath: "src/services/template.ts.tl",
        action: (opts: GenerateFileOptions) => { }
    }
}

export class GenerateFileAction extends BaseAction {
    schematic: SchematicOptions
    constructor(private options: GenerateFileOptions) {
        super()
        this.schematic = schematics[this.options.schematic];
        this.checkOptions();
    }

    async start(): Promise<void> {
        this.checkFile();

        templateFile(this.options.templatePath, this.options.filePath, this.options)

        this.logger.info(chalk.greenBright(`The file is generated successfully on ${this.options.filePath}`));

        if (!this.options.notImport) {
            require('../utils/insertReference')(this.options.className, this.options.fileName, this.options.filePath, this.schematic.property)
        }

        if (!this.options.notOpen) {
            exec(`start "" "${this.options.filePath}"`)
        }
    }

    checkOptions() {
        let arr = pathToArray(this.options.name);
        this.options.fileName = lodash.kebabCase(lodash.last(arr));

        if (!this.options.fileName.endsWith(this.schematic.suffix)) {
            this.options.fileName += this.schematic.suffix
        }

        arr[arr.length - 1] = this.options.fileName        

        this.options.className = classify(this.options.fileName);
        this.options.filePath = path.posix.join(CWD, this.schematic.folder, arr.join("/") + ".ts");
        this.options.templatePath = this.schematic.templatePath;

        this.schematic.action(this.options);

        this.logger.debug("Options:\n" + JSON.stringify(this.options, null, 2))
    }

    checkFile() {
        if (fs.existsSync(this.options.filePath)) {
            if (!this.options.force) {
                throw new Error(`The folder '${this.options.filePath}' is existed. If you want to override it, execute the command with "--force".`);
            }
        } else {
            ensureDirSync(path.dirname(this.options.filePath))
        }
    }
}


