var Jasmine = require('jasmine');
var runner = new Jasmine();

runner.loadConfigFile(__dirname + '/support/jasmine.json');
runner.execute();