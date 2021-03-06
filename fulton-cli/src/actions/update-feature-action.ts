import { CWD, FeatureList, FultonConfig } from '../constants';

import { BaseAction } from './base-action';
import { UpdateFeatureOptions } from '../interfaces';
import chalk from 'chalk';
import { exec } from 'child_process';

export class UpdateFeatureAction extends BaseAction {
    constructor(private options: UpdateFeatureOptions) {
        super()
        this.updateOptions();
    }


    updateOptions() {
        // for add
        this.options.addPackages = new Set()
        this.options.addDevPackages = new Set()
        this.options.removePackages = new Set()

        this.options.features.forEach((n) => {
            if (FultonConfig.features.some((o) => n == o)) return;

            let item = FeatureList.find(f => f.value == n);
            if (item.packages) {
                item.packages.forEach(p => this.options.addPackages.add(p))
            }

            if (item.devPackages) {
                item.devPackages.forEach(p => this.options.addDevPackages.add(p))
            }
        })

        FultonConfig.features.forEach((r) => {
            if (this.options.features.some((o) => r == o)) return;

            let item = FeatureList.find(f => f.value == r);
            if (item.packages) {
                item.packages.forEach(p => this.options.removePackages.add(p))
            }
        })

    }

    async start(): Promise<void> {
        this.spinner.setSpinnerTitle("Update packages %s")
        this.spinner.start();

        await this.updatePackages();

        this.spinner.stop(true);

        this.logger.info("Update packages " + chalk.green("DONE"))

        // update .fulton
        FultonConfig.features = this.options.features
        this.updateFultonConfig(FultonConfig);

        this.logger.info(chalk.greenBright("The features of the project is updated successfully."));
    }

    updatePackages() {
        return new Promise((resolve, reject) => {
            let commandArr = [];

            if (CWD != ".") {
                commandArr.push(`cd ${CWD}`)
            }

            if (this.options.addPackages.size > 0) {
                commandArr.push(`npm i ${Array.from(this.options.addPackages).join(" ")}`)
            }

            if (this.options.addDevPackages.size > 0) {
                commandArr.push(`npm i -D ${Array.from(this.options.addDevPackages).join(" ")}`)
            }

            if (this.options.removePackages.size > 0) {
                commandArr.push(`npm uni ${Array.from(this.options.removePackages).join(" ")}`)
            }

            let commandStr = commandArr.join(" && ")
            this.logger.debug(`\nexec ${commandStr}`);

            if (this.options.dry) {
                // skip install package if in dry mode
                resolve()
            } else {

                exec(commandStr, (err, stdout, stderr) => {
                    err ? reject(err) : resolve()
                });
            }

        })
    }
}


