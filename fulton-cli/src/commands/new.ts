import * as caporal from 'caporal';
import * as inquirer from 'inquirer';
import * as lodash from 'lodash';
import chalk from 'chalk';
import { createProject } from '../actions/create-project';
import { CreateProjectOptions } from '../interfaces';
import { Spinner } from 'cli-spinner';
import { DatabaseChoices, FeaturesChoices } from '../constants';

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
        choices: DatabaseChoices
    },
    {
        name: "features",
        type: "checkbox",
        message: "What kinds of features does the app support?",
        choices: FeaturesChoices
    }
];

module.exports = function () {
    caporal
        .command("new", "Creates a new directory and a new Fulton app.")
        .alias("n")
        .option("-n, --name [name]", "the name of the app", (value: any) => {
            // this code try to fix caporal bug for error message
            if (value == true) throw ""
            return value
        })
        .option("-d, --databases [databases]", "the database engine", caporal.LIST)
        .option("-f, --features [features]", "enabled the features the app", caporal.LIST)
        .action(function (args, options, logger) {
            try {
                let questions = generateQuestions(options, logger);

                inquirer.prompt(questions).then((answers) => {
                    logger.info("The project is been creating. It takes a while.");

                    let opts = Object.assign(options, answers) as CreateProjectOptions
                    // console.log(JSON.stringify(opts))
                    
                    createProject(opts).then(() => {
                        logger.info(chalk.greenBright("\nThe project is created successfully."));
                    }).catch((e) => {
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

function generateQuestions(options: any, logger: Logger): inquirer.Question[] {
    let questions: inquirer.Question[] = []

    questionDefs.forEach((question) => {
        let value = options[question.name];
        if (options[question.name] == null) {
            questions.push(question)
        } else if (question.validate) {
            if (!question.validate(value)) {
                throw new BaseError(chalk.redBright(`Invaild value ${chalk.yellowBright(value)} for option ${chalk.yellowBright(question.name)}`), {}, caporal)
            }
        } else if (question.choices) {
            if (value instanceof Array) {
                let sources = question.choices.map((c) => c.value);
                let errorValues = lodash.difference(value, sources);
                if (errorValues.length > 0) {
                    throw new BaseError(chalk.redBright(`Invaild value ${chalk.yellowBright(errorValues.join())} for option ${chalk.yellowBright(question.name)}`), {}, caporal)
                }
            } else {
                throw new BaseError(chalk.redBright(`Invaild value ${chalk.yellowBright(value)} for option ${chalk.yellowBright(question.name)}`), {}, caporal)
            }
        }
    })

    return questions;
}
