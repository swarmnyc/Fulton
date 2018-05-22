import * as caporal from 'caporal';
import * as inquirer from 'inquirer';
import * as lodash from 'lodash';

import { FultonConfig } from '../constants';
import chalk from 'chalk';

const BaseError = require('caporal/lib/error/base-error');

export abstract class BaseCommand {

    abstract questionDefs: inquirer.Question[];

    abstract createCommand(caporal: Caporal): Command;

    abstract action: ((opts: any, logger: Logger) => Promise<any>);

    command: Command;

    needToBeFultonProject: boolean = false;

    init() {
        this.command = this.createCommand(caporal)

        this.command.action((args, options, logger) => {
            if (this.needToBeFultonProject) {
                if (FultonConfig == null) {
                    console.log(chalk.red("This folder doesn't contain a Fulton project."))
                    process.exit(1)
                }
            }

            try {
                this.beforeGenerateQuestion(args, options)

                let questions = this.generateQuestions(this.questionDefs, options, logger);

                this.beforePrompt(questions, options)

                inquirer.prompt(questions).then((answers) => {
                    Object.assign(options, answers)

                    this.action(options, logger).catch((e) => {
                        logger.error(chalk.red("\nError: " + (e.message || e)));
                        process.exit(1);
                    });
                })
            } catch (e) {
                logger.error(e.message);
                process.exit(1);
            }
        })
    }

    beforeGenerateQuestion(args: any, options: any) {}

    beforePrompt(questionDefs: inquirer.Question[], options: any) {}

    private generateQuestions(questionDefs: inquirer.Question[], options: any, logger: Logger): inquirer.Question[] {
        let questions: inquirer.Question[] = []

        questionDefs.forEach((question) => {
            let value = options[question.name];
            if (options[question.name] == null) {
                questions.push(question)
            } else if (question.validate) {
                if (!question.validate(value)) {
                    throw new BaseError(chalk.redBright(`Invalid value ${chalk.yellowBright(value)} for option ${chalk.yellowBright(question.name)}`), {}, caporal)
                }
            } else if (question.choices) {
                if (value instanceof Array) {
                    let sources = (question.choices as ReadonlyArray<inquirer.objects.ChoiceOption>).map((c) => c.value);
                    let errorValues = lodash.difference(value, sources);
                    if (errorValues.length > 0) {
                        throw new BaseError(chalk.redBright(`Invalid value ${chalk.yellowBright(errorValues.join())} for option ${chalk.yellowBright(question.name)}`), {}, caporal)
                    }
                } else {
                    throw new BaseError(chalk.redBright(`Invalid value ${chalk.yellowBright(value)} for option ${chalk.yellowBright(question.name)}`), {}, caporal)
                }
            }
        })

        return questions;
    }
}