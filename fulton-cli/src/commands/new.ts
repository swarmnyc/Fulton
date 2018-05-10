import * as caporal from 'caporal';

// let command: CommandModule = {
//     aliases: "n",
//     command: "new <name>",
//     builder: (args: Argv) => {
//         args.positional("name", {
//             describe: "the name of directory and app",
//             type: "string"
//         })

//         args.option("type", {
//             desc: "the type of app",
//             default: "server",
//             choices: ["server", "angular"]
//         })

//         return args;
//     },
//     describe: "Creates a new directory and a new Fulton app.",
//     handler: (args) => {
//         console.log(args)
//     }
// }

module.exports = function () {
    caporal
        .command("new", "Creates a new directory and a new Fulton app.")
        .alias("n")
        .argument("<name>", "The name of directory and app.")
        .option("-t, --type <type>", "The type of the new app.", ["server", "angular"], "server", true)
        .action(function (args, options, logger) {
            // args and options are objects
            // args = {"app": "myapp", "env": "production"}
            // options = {"tail" : 100}
            console.log("new command", args, options)
        });
};