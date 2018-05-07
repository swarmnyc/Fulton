const path = require('path');
const exec = require('child_process').exec;

const gulp = require('gulp');
const gutil = require('gulp-util');
const rimraf = require('rimraf');
const sequence = require('gulp-sequence');
const replace = require('gulp-replace');
const prompt = require('inquirer');
const semver = require('semver')

gulp.task('clean', function (callback) {
    rimraf("./dist", callback);
});

gulp.task('build-fulton-server', function (callback) {
    exec("cd ../fulton-server/ && npm run build", function (err, stdout, stderr) {
        if (err) {
            gutil.log("build-fulton-server error:", err);
            callback("build-fulton-server failed");
            return;
        }

        let tasks = [];

        tasks.push(new Promise((resolve, reject) => {
            gulp.src('../fulton-server/build/**/*')
                .pipe(gulp.dest("./dist/fulton-server/"))
                .on("error", reject)
                .on("end", resolve);
        }));

        tasks.push(new Promise((resolve, reject) => {
            gulp.src('../fulton-server/assets/**/*')
                .pipe(gulp.dest("./dist/fulton-server/assets"))
                .on("error", reject)
                .on("end", resolve);
        }));

        tasks.push(new Promise((resolve, reject) => {
            gulp.src(['../fulton-server/package*.json', '../fulton-server/readme.md'])
                .pipe(gulp.dest("./dist/fulton-server/"))
                .on("error", reject)
                .on("end", resolve);
        }));

        Promise.all(tasks)
            .then((test) => {
                callback();
            })
            .catch(callback);
    });
});

gulp.task('publish-fulton-server', function (callback) {
    exec("cd ./dist/fulton-server/ && npm publish", function (err, stdout, stderr) {
        if (err) {
            gutil.log("publish-fulton-server error:", err);
            callback("publish-fulton-server failed");
            return;
        }

        callback();
    });
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

gulp.task('build', sequence("increase-version", "clean", "build-fulton-server", "update-package.json"));

gulp.task('publish', sequence("check-login", "publish-fulton-server"));

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
