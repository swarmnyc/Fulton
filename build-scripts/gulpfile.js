const path = require('path');
const exec = require('child_process').exec;

const gulp = require('gulp');
const gutil = require('gulp-util');
const rimraf = require('rimraf');
const sequence = require('gulp-sequence');
const replace = require('gulp-replace');


gulp.task('clean', function (callback) {
    rimraf("./dist", callback);
});

gulp.task('build-fulton-server', function (callback) {
    exec("cd ../fulton-server/ && npm run build", function (err, stdout, stderr) {
        if (err) {
            gutil.log("fulton-server build error:", stdout);
            callback("fulton-server build failed");
            return;
        }

        let tasks = [];

        tasks.push(new Promise((resolve, reject) => {
            gulp.src('../fulton-server/build/*')
                .pipe(gulp.dest("./dist/fulton-server/build"))
                .on("error", reject)
                .on("end", resolve);
        }));

        tasks.push(new Promise((resolve, reject) => {
            gulp.src('../fulton-server/package*.json')
                .pipe(gulp.dest("./dist/fulton-server/"))
                .on("error", reject)
                .on("end", resolve);
        }));

        tasks.push(new Promise((resolve, reject) => {
            gulp.src('../readme.md')
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
            gutil.log("fulton-server publish error:", stdout);
            callback("fulton-server publish failed");
            return;
        }

        callback();
    });
});

gulp.task("update-version", function () {
    // use version of build-script/package.json 
    let version = require("./package.json").version;

    return gulp.src("./dist/*/package*.json")
        .pipe(replace("0.0.0-PLACEHOLDER", version))
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

gulp.task('build', sequence("clean", "build-fulton-server", "update-version"));

gulp.task('publish', sequence("check-login", "publish-fulton-server"));