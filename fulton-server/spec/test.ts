import * as dotenv from 'dotenv';
import "../src/load-modules";

dotenv.config({ path: "./spec/secret.env" })

var Jasmine = require('jasmine');
var runner = new Jasmine();

var configFile;

if (process.argv[process.argv.length - 1] == "--it") {
    configFile = "/support/jasmine.it.json" // integration-test
} else {
    configFile = "/support/jasmine.json"
}

runner.loadConfigFile(__dirname + configFile);
runner.execute();