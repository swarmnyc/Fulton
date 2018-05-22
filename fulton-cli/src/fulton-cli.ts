#!/usr/bin/env node

import * as caporal from 'caporal';
import { AppVersion, InDevMode } from './constants';
import './caporal';
import { BaseCommand } from './commands/base-command';

let commands = ["new", "generate"]

caporal.name("fulton");
caporal.bin("fulton");
caporal.version(AppVersion);

if (InDevMode) {
    process.argv.push("--verbose");
}

commands.forEach((command) => {
    (new (require("./commands/" + command)) as BaseCommand).init();
});

caporal.parse(process.argv);