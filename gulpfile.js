const { src, dest, watch, series } = require("gulp");
const pug = require("gulp-pug");
const stylus = require("gulp-stylus");
const debug = require("gulp-debug");

function pugTask(cb) {
    return src("views/*.pug")
        .pipe(debug())
        .pipe(pug({

        }))
        .pipe(dest("."));
}

function stylusTask(cb) {
    return src("stylus/*.styl")
        .pipe(debug())
        .pipe(stylus())
        .pipe(dest("css/"));
}

// Watch doesn't seem to work with node 10 on Mojave so boo!
function watchTask(cb) {
    watch("views/*.pug", pugTask);
}

// exports.default = watchTask;
exports.default = series(pugTask, stylusTask);

