import * as caporal from 'caporal';
import * as path from 'path';
import './caporal';


let debug = path.extname(__filename) == ".ts"

let commands = ["new", "generate"]
let version = require(`${debug ? ".." : "."}/package.json`).version

caporal.version(version);

commands.forEach((command) => {
    require("./commands/" + command)();
})

caporal.parse(process.argv);