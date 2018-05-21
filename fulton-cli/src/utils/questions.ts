import * as caporal from 'caporal';
import * as inquirer from 'inquirer';
import * as lodash from 'lodash';

import chalk from 'chalk';

const BaseError = require('caporal/lib/error/base-error');

export function generateQuestions(questionDefs: inquirer.Question[], options: any, logger: Logger): inquirer.Question[] {
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
