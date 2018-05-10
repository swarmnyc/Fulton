const path = require('path');
const exec = require('child_process').exec;

const gulp = require('gulp');
const gutil = require('gulp-util');
const rimraf = require('rimraf');
const sequence = require('gulp-sequence');
const replace = require('gulp-replace');
const prompt = require('inquirer');
const semver = require('semver');

const packages = [{
    name: "cli",
    extraFolders: ["templates"]
},
{
    name: "server",
    extraFolders: ["assets"]
}]

gulp.task('clean', function (callback) {
    rimraf("./dist", callback);
});

gulp.task('build-fulton-packages', function (callback) {
    let tasks = Promise.resolve();

    packages.forEach((package) => {
        tasks = tasks.then(() => {
            return buildPackage(package)
        })
    });

    tasks.then(callback).catch(callback)
});

gulp.task('publish-fulton-packages', function (callback) {
    let tasks = Promise.resolve();

    packages.forEach((package) => {
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
    let version;
    getCurrentVersion()
        .then((v) => {
            version = v;
            return prompt.prompt({
                type: 'list',
                name: "type",
                message: `What type of version level would you like to increase? (The current version is ${version})`,
                choices: ['none', 'prerelease', 'patch', 'minor', 'major']
            })
        })
        .then((result) => {
            if (result.type != "none") {
                return semver.inc(version, result.type)
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

gulp.task('build', sequence("increase-version", "clean", "build-fulton-packages", "update-package.json"));

gulp.task('publish', sequence("check-login", "publish-fulton-packages"));

gulp.task('buildAndPublish', sequence("build", "publish"));

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
                    gulp.src(`../fulton-${name}/${folder}/**/*`)
                        .pipe(gulp.dest(`./dist/fulton-${name}/${folder}/assets`))
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