import { DatabaseList, FeatureList, InDevMode } from '../constants';

import { BaseCommand } from './base-command';
import { CreateProjectOptions } from '../interfaces';
import { NewProjectAction } from '../actions/new-project-action';

module.exports = class NewCommand extends BaseCommand {
    Action = NewProjectAction;
    questionDefs = [
        {
            name: "name",
            type: "input",
            message: "What is the name of the app?",
            validate: (value: any) => {
                if (value) {
                    return true
                } else {
                    return "Please enter the name";
                }
            }
        },
        {
            name: "databases",
            type: "checkbox",
            message: "What kinds of databases does the app use?",
            choices: DatabaseList
        },
        {
            name: "features",
            type: "checkbox",
            message: "What kinds of features does the app support?",
            choices: FeatureList
        }
    ];

    createCommand(caporal: Caporal) {
        let command = caporal
            .command("new", "Creates a new directory and a new Fulton app.")
            .alias("n")
            .argument("[name]", "the name of the app")
            .option("-d, --databases [databases]", "the database engines the app uses", caporal.LIST)
            .option("-f, --features [features]", "enabled the features of the app", caporal.LIST);

        if (InDevMode) {
            command.option("--dry", "don't run npm install", caporal.BOOLEAN, true);
        }

        return command
    }

    beforeGenerateQuestion(args: any, options: CreateProjectOptions) {
        options.name = args.name;
    }
}
