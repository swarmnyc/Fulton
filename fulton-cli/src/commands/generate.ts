import * as caporal from 'caporal';
import chalk from 'chalk';


const supportSchematics = [
    ["e", "entity", "scaffolding a entity file"],
    ["r", "router", "a"],
    ["s", "service", "c"]
]

function schematicsHelp(command: any) {
    let talble = command["_program"]["_helper"]["_getSimpleTable"]();

    for (const s of supportSchematics) {
        talble.push([`${chalk.cyan(s[0])}, ${chalk.cyan(s[1])}`, s[2]])
    }

    return talble.toString();
}

function verifySchematic(input: string) {
    for (const s of supportSchematics) {
        if (s[0] == input || s[1] == input) return s[1]
    }

    throw new Error(`Unknown schematic "${input}"`)
}

module.exports = function () {
    let command = caporal
        .command("generate", "Generates files based on a schematic.")
        .alias("g");

    command.argument("[schematic]", `The schematic that you want to generate.\nAvailable schematics are\n${schematicsHelp(command)}`, verifySchematic)
        .argument("[name]", "The name of file.");

    command.action(function (args, options, logger) {
        console.log("new command", args, options)
    });
};