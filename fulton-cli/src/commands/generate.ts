import { BaseCommand } from './base-command';
import { GenerateFileAction } from '../actions/generate-file-action';
import { GenerateFileOptions } from '../interfaces';
import chalk from 'chalk';

const supportSchematics = [
    ["e", "entity", "a entity of Database ORM file", "Entity"],
    ["r", "router", "a router file", "Router"],
    ["n", "entity-router", "a entity router file", "EntityRouter"],
    ["s", "service", "a service file", "Service"]
]

function schematicsHelp(command: any) {
    let table = command["_program"]["_helper"]["_getSimpleTable"]();

    table.options.style["padding-left"] = 2

    for (const s of supportSchematics) {
        table.push([`${chalk.cyan(s[0])}, ${chalk.cyan(s[1])}`, s[2]])
    }

    return table.toString();
}

function verifySchematic(input: string) {
    for (const s of supportSchematics) {
        if (s[0] == input || s[1] == input) return s[1]
    }

    throw new Error(`Unknown schematic "${input}"`)
}

module.exports = class GenerateCommand extends BaseCommand {
    Action = GenerateFileAction;

    needToBeFultonProject = true;

    questionDefs = [
        {
            name: "schematic",
            type: "list",
            message: "What is the schematic that you want to generate?",
            choices: supportSchematics.map((s) => {
                return {
                    name: `${s[3]} - ${s[2]}`,
                    short: s[3],
                    value: s[1]

                };
            }),
            validate: (value: any) => {
                if (value) {
                    return true
                } else {
                    return "Please enter the name";
                }
            }
        },
        {
            name: "name",
            type: "input",
            message: "What is the name of the file?",
            validate: (value: any) => {
                if (value) {
                    return true
                } else {
                    return "Please enter the name";
                }
            }
        },
    ];

    createCommand(caporal: Caporal) {
        let command = caporal
            .command("generate", "Generates files based on a schematic.")
            .alias("g");

        //TODO: add more options
        command.argument("[schematic]", `The schematic that you want to generate.\nAvailable schematics are\n${schematicsHelp(command)}`, verifySchematic)
            .argument("[name]", "The name of the file.")
            .option("-f, --force", "override the file if it exists")
            .option("--not-open", "not open the file after it is generated")
            .option("--not-import", "not import the reference into app.ts after it is generated")
            .option("--db-conn <name>", "the database connection name", caporal.STRING)
            .option("--db-engine <type>", "the engine database", caporal.STRING);

        return command;
    }

    beforeGenerateQuestion(args: any, options: GenerateFileOptions) {
        options.schematic = args.schematic;
        options.name = args.name;
        
    }
}