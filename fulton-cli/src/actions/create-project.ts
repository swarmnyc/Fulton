import * as fs from 'fs';
import * as lodash from 'lodash';
import * as path from 'path';
import chalk from 'chalk';

import { AppRoot } from '../constants';
import { classify } from '../utils/stings';
import { CreateProjectOptions, AppOptions } from '../interfaces';
import { exec } from 'child_process';
import { setTimeout } from 'timers';
import { Spinner } from 'cli-spinner';

const TemplateRoot = path.join(AppRoot, "templates");

export function createProject(options: CreateProjectOptions, logger: Logger): Promise<void> {
    return new Executor(options, logger).start()
}

class Executor {
    root: string;
    appOptions: AppOptions;
    spinner: Spinner;
    srcPath: string;
    entityPath: string;
    routerPath: string;
    servicePath: string;
    constructor(private createOptions: CreateProjectOptions, private logger: Logger) {
        this.root = path.join(".", createOptions.name);
        this.srcPath = path.join(this.root, "src");
        this.entityPath = path.join(this.srcPath, "entities");
        this.routerPath = path.join(this.srcPath, "routers");
        this.servicePath = path.join(this.srcPath, "services");
        this.appOptions = this.convertOptions();
    }

    async start(): Promise<void> {
        if (this.createOptions.test) console.log("Options", JSON.stringify(this.appOptions, null, 2))

        this.spinner = new Spinner("Creating Project %s");
        this.spinner.start();

        this.createSubFolders();
        this.copyFiles();

        this.spinner.stop(true);
        this.logger.info("Creating Project " + chalk.green("DONE"))
        this.spinner.start();

        this.spinner.setSpinnerTitle("Installing packages %s")

        if (!this.createOptions.test) {
            // skip install package if in test mode
            await this.installPackages();
        }

        this.spinner.stop(true);

        this.logger.info("Installing packages " + chalk.green("DONE"))
        this.logger.info(chalk.greenBright("The project is created successfully."));
    }

    convertOptions(): AppOptions {
        let appName = classify(this.createOptions.name);
        if (!appName.endsWith("App")) {
            appName += "App"
        }

        let opts: AppOptions = {
            projectName: this.createOptions.name,
            appName: appName,
            isDatabaseEnabled: this.createOptions.databases.length > 0,
            isMongoDbEnabled: lodash.includes(this.createOptions.databases, "mongodb"),
            isCompressionEnabled: lodash.includes(this.createOptions.features, "compression"),
            isCorsEnabled: lodash.includes(this.createOptions.features, "cors"),
            isJsonApiEnabled: lodash.includes(this.createOptions.features, "json-api"),
            isIdentityEnabled: lodash.includes(this.createOptions.features, "identity"),
            isGoogleAuthEnabled: lodash.includes(this.createOptions.features, "oauth-google"),
            isFacebookAuthEnabled: lodash.includes(this.createOptions.features, "oauth-facebook"),
            isGitHubAuthEnabled: lodash.includes(this.createOptions.features, "oauth-github"),
            isApiDocsEnabled: lodash.includes(this.createOptions.features, "api-docs"),
            isEmailNotificationEnabled: lodash.includes(this.createOptions.features, "email"),
            databaseSettings: []
        }

        // to make .env.tl file easier, pre defined string here.
        this.createOptions.databases.forEach((database, index) => {
            let name = index == 0 ? "default" : `conn${index + 1}`;
            let prefix = `${appName}.options.databases.${name}`
            switch (database) {
                case 'mongodb':
                    opts.databaseSettings.push(
                        `${prefix}.type=${database}\n` +
                        `${prefix}.url=mongodb://localhost:27017/${this.createOptions.name}`);
                    break
                case 'mysql':
                    opts.databaseSettings.push(
                        `${prefix}.type=${database}\n` +
                        `${prefix}.host=localhost\n` +
                        `${prefix}.port=3306\n` +
                        `${prefix}.username=username\n` +
                        `${prefix}.password=password\n` +
                        `${prefix}.database=database`);
                    break
                case 'mssql':
                    opts.databaseSettings.push(
                        `${prefix}.type=${database}\n` +
                        `${prefix}.url=Server=localhost;Database=database;User Id=username;Password=password;`);
                    break
            }
        });

        return opts
    }

    createSubFolders() {
        if (fs.existsSync(this.root)) {
            throw new Error(`The sub-folder '${this.root}' is exsited in the current folder.`);
        }

        fs.mkdirSync(this.root);
        fs.mkdirSync(this.srcPath);
        fs.mkdirSync(this.routerPath);

        if (this.appOptions.isDatabaseEnabled) {
            fs.mkdirSync(this.entityPath);
            fs.mkdirSync(this.servicePath);
        }
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
            { source: "package.json.tl", to: "package.json" },
            { source: "tsconfig.json", to: "tsconfig.json" },
            { source: ".env.tl", to: ".env" },
            { source: "src/main.ts.tl", to: "src/main.ts" },
            { source: "src/app.ts.tl", to: "src/app.ts" },
            { source: "src/routers/sample-router.ts", to: "src/routers/sample-router.ts" },
            { source: "src/services/sample-service.ts", to: "src/services/sample-service.ts" }
        ]

        if (this.appOptions.isDatabaseEnabled) {
            let database = this.createOptions.databases[0];
            if (database == "mongodb") {
                fileToCopys.push({ source: "src/entities/mongodb/article-entity.ts", to: "src/entities/article-entity.ts" })
                fileToCopys.push({ source: "src/entities/mongodb/author-entity.ts", to: "src/entities/author-entity.ts" })
            } else {
                fileToCopys.push({ source: "src/entities/sql/article-entity.ts", to: "src/entities/article-entity.ts" })
                fileToCopys.push({ source: "src/entities/sql/author-entity.ts", to: "src/entities/author-entity.ts" })
            }

            fileToCopys.push({ source: "src/routers/article-router.ts", to: "src/routers/article-router.ts" })
            fileToCopys.push({ source: "src/routers/author-router.ts", to: "src/routers/author-router.ts" })
        }

        fileToCopys.forEach((item) => {

            if (item.source.endsWith(".tl")) {
                // templating the file
                let content = fs.readFileSync(path.join(TemplateRoot, item.source)).toString()
                let template = lodash.template(content)
                let result = template(this.appOptions);

                fs.writeFileSync(path.join(this.root, item.to), result)
            } else {
                // copy the file
                fs.copyFileSync(path.join(TemplateRoot, item.source), path.join(this.root, item.to))
            }
        })
    }
}


