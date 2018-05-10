import * as caporal from 'caporal';

const serverSchematics = ["router", "entity", "service"]
const supportSchematics = serverSchematics
module.exports = function () {
    caporal
        .command("generate", "Generates files based on a schematic.")
        .alias("g")
        .argument("<schematic>", "The schematic that you want to generate", supportSchematics)
        .argument("<name>", "The name of file.", (name) => {
            if (name != "a") {
                throw new Error(`The "fulton new" command requires a name argument to be specified`)
            }

            return name;
        })
        .help(`Available schematics are ${supportSchematics.join()}`)
        .action(function (args, options, logger) {
            // args and options are objects
            // args = {"app": "myapp", "env": "production"}
            // options = {"tail" : 100}
            console.log("new command", args, options)
        });
};