import * as fs from 'fs';
import * as lodash from 'lodash';
import * as path from 'path';

import { AppOptions, CreateProjectOptions, IFultonConfig } from '../interfaces';
import { CWD, DatabaseList, DatabasePackages, DevPackages, FeatureList, Packages, TemplateRoot, AppVersion } from '../constants';

import chalk from 'chalk';
import { classify } from '../utils/stings';
import { exec } from 'child_process';
import { templateFile } from '../utils/template';
import { BaseAction } from './base-action';

export class NewProjectAction extends BaseAction {
    root: string;
    appOptions: AppOptions;
    srcPath: string;
    entityPath: string;
    routerPath: string;
    servicePath: string;
    constructor(private createOptions: CreateProjectOptions, logger: Logger) {
        super(logger)
        this.root = path.join(CWD, createOptions.name);
        this.srcPath = path.join(this.root, "src");
        this.entityPath = path.join(this.srcPath, "entities");
        this.routerPath = path.join(this.srcPath, "routers");
        this.servicePath = path.join(this.srcPath, "services");
        this.appOptions = this.convertOptions();
    }

    async start(): Promise<void> {
        this.spinner.setSpinnerTitle("Creating Project %s");
        this.spinner.start();

        this.createSubFolders();
        this.generateFultonConfigFile();
        this.copyFiles();

        this.spinner.stop(true);
        this.logger.info("Creating Project " + chalk.green("DONE"))
        this.spinner.start();

        this.spinner.setSpinnerTitle("Installing packages %s")

        await this.installPackages();

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
            projectNameSafe: lodash.snakeCase(this.createOptions.name),
            appName: appName,
            appNameSafe: lodash.snakeCase(appName),
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
            isDockerEnabled: lodash.includes(this.createOptions.features, "docker")
        }

        this.logger.debug("Options:\n" + JSON.stringify(opts, null, 2))

        opts.databases = []

        // to make .env.tl file easier, pre defined string here.
        this.createOptions.databases.forEach((database, index) => {
            let name = index == 0 ? "default" : `conn${index + 1}`;
            let prefix = `${appName}.options.databases.${name}`
            let options;
            switch (database) {
                case 'mongodb':
                    options =
                        `${prefix}.type=${database}\n` +
                        `${prefix}.url=mongodb://localhost:27017/${this.createOptions.name}`;
                    break
                case 'mysql':
                    options =
                        `${prefix}.type=${database}\n` +
                        `${prefix}.host=localhost\n` +
                        `${prefix}.port=3306\n` +
                        `${prefix}.username=username\n` +
                        `${prefix}.password=password\n` +
                        `${prefix}.database=database`;
                    break
                case 'mssql':
                    options =
                        `${prefix}.type=${database}\n` +
                        `${prefix}.url=Server=localhost;Database=database;User Id=username;Password=password;`;
                    break
            }

            opts.databases.push({
                name: name,
                type: database,
                options: options
            });
        });

        return opts
    }

    createSubFolders() {
        if (fs.existsSync(this.root)) {
            throw new Error(`The sub-folder '${this.root}' is existed in the current folder.`);
        }

        fs.mkdirSync(this.root);
        fs.mkdirSync(this.srcPath);
        fs.mkdirSync(this.routerPath);
        fs.mkdirSync(this.servicePath);

        if (this.appOptions.isDatabaseEnabled) {
            fs.mkdirSync(this.entityPath);
        }
    }

    installPackages() {
        return new Promise((resolve, reject) => {
            var packages = new Set(Packages)
            var devPackages = new Set(DevPackages)

            if (this.appOptions.isDatabaseEnabled) {
                DatabasePackages.forEach(p => packages.add(p))
            }

            this.createOptions.databases.forEach((selected) => {
                var item = DatabaseList.find(d => d.value == selected);
                if (item.packages) {
                    item.packages.forEach(p => packages.add(p))
                }

                if (item.devPackages) {
                    item.devPackages.forEach(p => devPackages.add(p))
                }
            });

            this.createOptions.features.forEach((selected) => {
                var item = FeatureList.find(f => f.value == selected);
                if (item.packages) {
                    item.packages.forEach(p => packages.add(p))
                }

                if (item.devPackages) {
                    item.devPackages.forEach(p => devPackages.add(p))
                }
            })

            var packageString = Array.from(packages).join(" ")
            var devPackageString = Array.from(devPackages).join(" ")
            var commandStr = `cd ${this.root} && npm install -D ${devPackageString} && npm install ${packageString}`

            if (this.createOptions.dry) {
                // skip install package if in dry mode
                console.log(`\nexec ${commandStr}`);
                resolve()
            } else {
                exec(commandStr, (err, stdout, stderr) => {
                    err ? reject(err) : resolve()
                });
            }
        })
    }

    /**
     * copy files to the destination folders, if the extension of the file is tl, do templating
     */
    copyFiles() {
        // files to copy
        let filesToCopy = [
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
                filesToCopy.push({ source: "src/entities/mongodb/article.ts", to: "src/entities/article.ts" })
                filesToCopy.push({ source: "src/entities/mongodb/author.ts", to: "src/entities/author.ts" })
            } else {
                filesToCopy.push({ source: "src/entities/sql/article.ts", to: "src/entities/article.ts" })
                filesToCopy.push({ source: "src/entities/sql/author.ts", to: "src/entities/author.ts" })
            }

            filesToCopy.push({ source: "src/routers/article-router.ts", to: "src/routers/article-router.ts" })
            filesToCopy.push({ source: "src/routers/author-router.ts", to: "src/routers/author-router.ts" })
        }

        if (this.appOptions.isDockerEnabled) {
            filesToCopy.push({ source: "Dockerfile.tl", to: "Dockerfile" })
            filesToCopy.push({ source: ".dockerignore", to: ".dockerignore" })
            filesToCopy.push({ source: "docker-compose.yml.tl", to: "docker-compose.yml" })
        }

        filesToCopy.forEach((item) => {
            templateFile(item.source, path.join(this.root, item.to), this.appOptions);
        })
    }

    generateFultonConfigFile() {
        let config: IFultonConfig = {
            databases: {},
            features: this.createOptions.features
        }

        this.appOptions.databases.forEach((database) => {
            config.databases[database.name] = database.type
        })

        this.updateFultonConfig(config, this.root);
    }
}


