import { FeatureList, FultonConfig, InDevMode } from '../constants';

import { BaseCommand } from './base-command';
import { UpdateFeatureAction } from '../actions/update-feature-action';

module.exports = class PackageCommand extends BaseCommand {
    Action = UpdateFeatureAction;
    
    needToBeFultonProject = true;

    get questionDefs() {
        FeatureList.forEach((f) => {
            f.checked = FultonConfig.features.some((s) => s == f.value);
        });

        return [
            {
                name: "features",
                type: "checkbox",
                message: "What are the features you want to add or remove?",
                choices: FeatureList
            }
        ];
    }

    createCommand(caporal: Caporal) {
        let command = caporal
            .command("feature", "add or remove features")
            .alias("f");

        if (InDevMode) {
            command.option("--dry", "don't run npm install", caporal.BOOLEAN, true);
        }

        return command;
    }
}