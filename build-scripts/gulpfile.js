// read arguments
const yargs = require('yargs');
const argv = yargs
    .alias("n", "newVersion")
    .alias("i", "increaseType")
    .choices("increaseType", ["major", "minor", "patch", "pre-release"])
    .default({ increaseType: "patch" })
    .argv

const path = require('path');
const exec = require('child_process').exec;

const gulp = require('gulp');
const gutil = require('gulp-util');
const bump = require('gulp-bump');
const rimraf = require('rimraf');
const sequence = require('gulp-sequence');
const replace = require('gulp-replace');

gulp.task('clean', function (callback) {
    rimraf("./dist", callback);
});

gulp.task('increase-version', function () {
    var option = {};

    if (argv.newVersion) {
        option.version = argv.newVersion;
    } else {
        option.type = argv.increaseType;
    }

    return gulp.src("./package.json")
        .pipe(bump(option))
        .pipe(gulp.dest('./'));
});

gulp.task('add-git-tag', function (callback) {
    let version = require("./package.json").version;

    exec("cd ../ && git tag version/" + version, function (err, stdout, stderr) {
        if (err) {
            gutil.log("add-git-tag error:", err);            
            callback("add-git-tag failed");
            return;
        }

        callback()
    });
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

gulp.task("update-package.json", function () {
    // use version of build-script/package.json 
    let version = require("./package.json").version;

    return gulp.src("./dist/*/package*.json")
        .pipe(replace("0.0.0-PLACEHOLDER", version))
        .pipe(replace("./build/", "./"))
        .pipe(gulp.dest("./dist"));
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

gulp.task('build:try', sequence("clean", "build-fulton-server", "update-package.json"));

gulp.task('build', sequence("clean", "increase-version", "add-git-tag", "build-fulton-server", "update-package.json"));

gulp.task('publish', sequence("check-login", "publish-fulton-server"));

gulp.task('buildAndPublish', sequence("build", "publish"));