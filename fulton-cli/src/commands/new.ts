import * as caporal from 'caporal';
import * as inquirer from 'inquirer';
import * as lodash from 'lodash';

import { DatabaseList, FeatureList } from '../constants';

import { CreateProjectOptions } from '../interfaces';
import { Spinner } from 'cli-spinner';
import chalk from 'chalk';
import { createProject } from '../actions/create-project';
import { generateQuestions } from '../utils/questions';

const BaseError = require('caporal/lib/error/base-error');

let questionDefs = [
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

module.exports = function () {
    let command = caporal
        .command("new", "Creates a new directory and a new Fulton app.")
        .alias("n")
        .argument("[name]", "the name of the app")
        .option("-d, --databases [databases]", "the database engines the app uses", caporal.LIST)
        .option("-f, --features [features]", "enabled the features of the app", caporal.LIST);

    if (process.env["NODE_ENV"] == "DEV") {
        command.option("-t, --test", "open test mode", caporal.BOOLEAN, true);
    }

    command.action(function (args, options, logger) {
        try {
            options.name = args.name;

            let questions = generateQuestions(questionDefs, options, logger);

            inquirer.prompt(questions).then((answers) => {
                logger.info("The project is been creating. It takes a while.");

                let opts = Object.assign(options, answers) as CreateProjectOptions

                createProject(opts, logger).catch((e) => {
                    logger.error(chalk.red("\nError: " + (e.message || e)));
                    process.exit(1);
                });
            })
        } catch (e) {
            logger.error(e.message);
            process.exit(1);
        }
    });
};

