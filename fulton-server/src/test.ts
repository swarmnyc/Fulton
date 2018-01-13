var Jasmine = require('jasmine');
var runner = new Jasmine();

runner.loadConfigFile('jasmine.json');
runner.execute();