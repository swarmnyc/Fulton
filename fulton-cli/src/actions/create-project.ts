import * as fs from 'fs';
import * as lodash from 'lodash';
import * as path from 'path';
import chalk from 'chalk';

import { AppRoot } from '../constants';
import { classify } from '../utils/stings';
import { CreateProjectOptions, PackageOptions } from '../interfaces';
import { exec } from 'child_process';
import { setTimeout } from 'timers';
import { Spinner } from 'cli-spinner';

const TemplateRoot = path.join(AppRoot, "templates");

export function createProject(options: CreateProjectOptions, logger: Logger): Promise<void> {
    return new Executor(options, logger).start()
}

class Executor {
    root: string;
    packageOptions: PackageOptions;
    spinner: Spinner;
    srcPath: string;
    constructor(private options: CreateProjectOptions, private logger: Logger) {
        this.root = path.join(".", options.name);
        this.srcPath = path.join(this.root, "src");
        this.packageOptions = this.convertOptions();
    }

    async start(): Promise<void> {
        this.spinner = new Spinner("Creating Project %s");
        this.spinner.start();

        this.createSubFolders();
        this.copyFiles();

        this.spinner.stop(true);
        this.logger.info("Creating Project " + chalk.green("DONE"))
        this.spinner.start();

        this.spinner.setSpinnerTitle("Installing packages %s")

        if (!this.options.test) {
            // skip install package if in test mode
            await this.installPackages();
        }

        this.spinner.stop(true);

        this.logger.info("Installing packages " + chalk.green("DONE"))
        this.logger.info(chalk.greenBright("The project is created successfully."));
    }

    convertOptions(): PackageOptions {
        return {
            projectName: this.options.name,
            appName: classify(this.options.name),
            isDatabaseEnabled: this.options.databases.length > 0,
            isMongoDbEnabled: lodash.includes(this.options.databases, "identity"),
            isCompressionEnabled: lodash.includes(this.options.features, "compression"),
            isCorsEnabled: lodash.includes(this.options.features, "cors"),
            isIdentityEnabled: lodash.includes(this.options.features, "mongodb"),
            isGoogleAuthEnabled: lodash.includes(this.options.features, "oauth-google"),
            isFacebookAuthEnabled: lodash.includes(this.options.features, "oauth-facebook"),
            isGitHubAuthEnabled: lodash.includes(this.options.features, "oauth-github"),
            isApiDocsEnabled: lodash.includes(this.options.features, "api-docs"),
            isEmailNotificationEnabled: lodash.includes(this.options.features, "email")
        }
    }

    createSubFolders() {
        if (fs.existsSync(this.root)) {
            throw new Error(`The sub-folder '${this.root}' is exsited in the current folder.`);
        }

        fs.mkdirSync(this.root);
        fs.mkdirSync(this.srcPath);
    }

    installPackages() {
        return new Promise((resolve, reject) => {
            exec(`cd ${this.root} && npm install fulton-server@latest`, (err, stdout, stderr) => {
                err ? reject(err) : resolve()
            })
        })
    }

    /**
     * copy files to the destination folders, if the extension of the file is tl, do templating
     */
    copyFiles() {
        // files to copy
        let fileToCopys = [
            "package.json.tl",
            "tsconfig.json",
            "src/main.ts.tl",
            "src/app.ts.tl"
        ]

        fileToCopys.forEach((filename) => {

            if (filename.endsWith(".tl")) {
                // templating the file
                let content = fs.readFileSync(path.join(TemplateRoot, filename)).toString()
                let template = lodash.template(content)
                let result = template(this.packageOptions);
                let actulFileName = filename.substr(0, filename.length - 3)

                fs.writeFileSync(path.join(this.root, actulFileName), result)
            } else {
                // copy the file
                fs.copyFileSync(path.join(TemplateRoot, filename), path.join(this.root, filename))
            }
        })
    }
}


