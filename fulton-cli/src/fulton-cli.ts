#!/usr/bin/env node

import * as caporal from 'caporal';
import { AppVersion } from './constants';
import './caporal';

let commands = ["new", "generate"]


caporal.name("fulton")
caporal.bin("fulton")
caporal.version(AppVersion);

commands.forEach((command) => {
    require("./commands/" + command)();
})

caporal.parse(process.argv);