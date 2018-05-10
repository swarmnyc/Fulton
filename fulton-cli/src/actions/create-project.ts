import * as fs from 'fs';
import * as path from 'path';
import { CreateProjectOptions, PackageOptions } from '../interfaces';
import { setTimeout } from 'timers';
import * as lodash from 'lodash';
import { AppRoot } from '../constants';
import { exec } from 'child_process'
import { Spinner } from 'cli-spinner';

const TemplateRoot = path.join(AppRoot, "templates");

export function createProject(options: CreateProjectOptions): Promise<void> {
    return new Executor(options).start()
}

class Executor {
    root: string;
    packageOptions: PackageOptions;
    spinner: Spinner;
    constructor(private options: CreateProjectOptions) {
        this.root = path.join(".", options.name)
        this.packageOptions = this.convertOptions();


    }

    async start(): Promise<void> {
        this.spinner = new Spinner("Creating %s");
        this.spinner.start()

        this.createSubFolder();
        this.createPackageJson();

        this.spinner.setSpinnerTitle("Installing packages %s")
        await this.installPackages();

        this.spinner.stop();
    }

    convertOptions(): PackageOptions {
        return {
            name: this.options.name,
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

    createSubFolder() {
        if (fs.existsSync(this.root)) {
            throw new Error(`The sub-folder '${this.root}' is exsited in the current folder.`)
        }

        fs.mkdirSync(this.root)
    }

    createPackageJson() {
        let content = fs.readFileSync(path.join(TemplateRoot, "package.json.tl")).toString()
        let template = lodash.template(content)
        let result = template(this.packageOptions);

        fs.writeFileSync(path.join(this.root, "package.json"), result)
    }

    installPackages() {
        return new Promise((resolve, reject) => {
            exec(`cd ${this.root} && npm install fulton-server@latest`, (err, stdout, stderr) => {
                err ? reject(err) : resolve()
            })
        })
    }
}


