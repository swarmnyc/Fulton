var Jasmine = require('jasmine');
var runner = new Jasmine();

var configFile;

if (process.argv[process.argv.length - 1] == "--it") {
    configFile = "/support/jasmine.it.json" // integration-test
}else{
    configFile = "/support/jasmine.json"
}

// Add TeamCity reporter if running on a TeamCity Agent.
if (process.env["TEAMCITY_VERSION"] != null) {
    var reporters = require('jasmine-reporters');
    var teamcityReporter = new reporters.TeamCityReporter();
    runner.addReporter(teamcityReporter);
}

runner.loadConfigFile(__dirname + configFile);
runner.execute();
