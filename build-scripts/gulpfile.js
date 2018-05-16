let projects = [{
    name: "cli",
    extraFolders: ["templates"]
},
{
    name: "server",
    extraFolders: ["assets"]
}]

// options
const args = require("yargs")
    .option('silent', {
        alias: 's',
        default: false
    })
    .option('version-type', {
        alias: 'v',
        choices: ['prerelease', 'patch', 'minor', 'major']
    })
    .option('projects', {
        alias: 'p',
        array: true,
        choices: projects.map((p) => p.name)
    }).argv

// filter out projects
if (args.projects) {
    projects = projects.filter((project) => {
        return args.projects.indexOf(project.name) > -1
    });
}

const path = require('path');
const exec = require('child_process').exec;

const gulp = require('gulp');
const gutil = require('gulp-util');
const rimraf = require('rimraf');
const sequence = require('gulp-sequence');
const replace = require('gulp-replace');
const inquirer = require('inquirer');
const semver = require('semver');

gulp.task('clean', function (callback) {
    rimraf("./dist", callback);
});

gulp.task('build-projects', function (callback) {
    let tasks = Promise.resolve();

    projects.forEach((project) => {
        tasks = tasks.then(() => {
            return buildPackage(project)
        })
    });

    tasks.then(callback).catch(callback)
});

gulp.task('publish-projects', function (callback) {
    let tasks = Promise.resolve();

    projects.forEach((package) => {
        tasks = tasks.then(() => {
            return publishPackage(package)
        })
    });

    tasks.then(callback).catch(callback)
});

gulp.task("update-package.json", function (callback) {
    getCurrentVersion()
        .then((version) => {
            gutil.log("The version is", version);

            gulp.src("./dist/*/package*.json")
                .pipe(replace("0.0.0-PLACEHOLDER", version))
                .pipe(replace("./build/", "./"))
                .pipe(gulp.dest("./dist"))
                .on("error", callback)
                .on("end", callback);

        })
        .catch(callback);
});

gulp.task("check-login", function (callback) {
    exec("npm whoami", function (err, stdout, stderr) {
        if (err) {
            callback("You have to use `npm login` to login");
            return;
        }

        callback();
    });
});

gulp.task("increase-version", function (callback) {
    if (args.silent) {
        callback()
        return;
    }

    let version;
    getCurrentVersion()
        .then((v) => {
            version = v;
            if (args["version-type"]) {
                return {
                    type: args["version-type"]
                }
            } else {
                return inquirer.prompt({
                    type: 'list',
                    name: "type",
                    message: `What type of version level would you like to increase? (The current version is ${version})`,
                    choices: ['none', 'prerelease', 'patch', 'minor', 'major']
                })
            }
        })
        .then((result) => {
            if (result.type != "none") {
                return semver.inc(version, result.type, 'beta')
            }
        })
        .then((newVesion) => {
            if (newVesion) {
                return updateVersion(newVesion)
            }
        })
        .then(callback)
        .catch(callback)
});

gulp.task("install-cli-in-local", function (callback) {
    let install = function () {
        exec(`cd ./dist/fulton-cli/ && npm pack && npm install -g fulton-cli-0.0.0-PLACEHOLDER.tgz`, function (err, stdout, stderr) {
            if (err) {
                gutil.log("install-cli-in-local error:", err);
                callback("install-cli-in-local failed");
                return;
            }

            callback()
        });
    }

    let build = function () {
        buildPackage(projects[0]).then(install).catch(callback)
    }

    rimraf("./dist", build);
});

gulp.task('build', sequence("increase-version", "clean", "build-projects", "update-package.json"));

gulp.task('publish', sequence("check-login", "publish-projects"));

gulp.task('buildPublish', sequence("build", "publish"));

function getCurrentVersion() {
    return new Promise((resolve, reject) => {
        // use version from git tags
        exec("git describe --tags --abbrev=0", function (err, stdout, stderr) {
            if (err) {
                gutil.log("get git tags error:", err);
                reject("get git tags failed");
                return;
            }

            resolve(stdout.split("/")[1].trim())
        });
    })
}

function updateVersion(version) {
    return new Promise((resolve, reject) => {
        // use version from git tags
        exec(`git tag version/${version}`, function (err, stdout, stderr) {
            if (err) {
                gutil.log("set git tags error:", err);
                reject("set git tags failed");
                return;
            }

            gutil.log(`update version to ${version}`)

            resolve()
        });
    })
}

function buildPackage(package) {
    const name = package.name;
    const extraFolders = package.extraFolders;

    return new Promise((resolve, reject) => {
        gutil.log(`--> Start build fulton-${name}`)
        exec(`cd ../fulton-${name}/ && npm run build`, function (err, stdout, stderr) {
            if (err) {
                gutil.log(`build-fulton-${name} error:`, err);
                reject(`build-fulton-${name} failed`);
                return;
            }

            let tasks = [];

            tasks.push(new Promise((r, j) => {
                gulp.src(`../fulton-${name}/build/**/*`)
                    .pipe(gulp.dest(`./dist/fulton-${name}/`))
                    .on("error", j)
                    .on("end", r);
            }));

            extraFolders.forEach((folder) => {
                tasks.push(new Promise((r, j) => {
                    gulp.src(`../fulton-${name}/${folder}/**/*`, { dot: true })
                        .pipe(gulp.dest(`./dist/fulton-${name}/${folder}/`))
                        .on("error", j)
                        .on("end", r);
                }));
            })

            tasks.push(new Promise((r, j) => {
                gulp.src([`../fulton-${name}/package*.json`, `../fulton-${name}/README.md`])
                    .pipe(gulp.dest(`./dist/fulton-${name}/`))
                    .on("error", j)
                    .on("end", r);
            }));

            Promise.all(tasks)
                .then(() => {
                    gutil.log(`<-- Finish build fulton-${name}`)
                    resolve();
                })
                .catch(reject);
        });
    });
}

function publishPackage(package) {
    const name = package.name;

    return new Promise((resolve, reject) => {
        gutil.log(`--> Start publish fulton-${name}`)

        exec(`cd ./dist/fulton-${name}/ && npm publish`, function (err, stdout, stderr) {
            if (err) {
                gutil.log(`publish-fulton-${name} error:`, err);
                reject(`publish-fulton-${name} failed`);
                return;
            }

            gutil.log(`<-- Finish publish fulton-${name}`)
            resolve();
        });
    })
}