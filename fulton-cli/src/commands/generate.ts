import * as caporal from 'caporal';

const serverSchematics = ["router", "entity", "service"]
const supportSchematics = serverSchematics
module.exports = function () {
    let command = caporal
        .command("generate", "Generates files based on a schematic.")
        .alias("g")
        .argument("<schematic>", "The schematic that you want to generate", supportSchematics)
        .argument("<name>", "The name of file.", (name) => {
            if (name != "a") {
                throw new Error(`The "fulton new" command requires a name argument to be specified`)
            }

            return name;
        })
        .help(`Available schematics are ${supportSchematics.join()}`);

    command.action(function (args, options, logger) {
        console.log("new command", args, options)
    });
};