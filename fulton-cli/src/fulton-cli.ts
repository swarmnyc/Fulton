#!/usr/bin/env node

import * as caporal from 'caporal';
import { AppVersion } from './constants';
import './caporal';

let commands = ["new", "generate"]

caporal.name("fulton");
caporal.bin("fulton");
caporal.version(AppVersion);

if (process.env["NODE_ENV"] == "DEV") {
    process.argv.push("--verbose");
}

commands.forEach((command) => {
    require("./commands/" + command)();
})

caporal.parse(process.argv);