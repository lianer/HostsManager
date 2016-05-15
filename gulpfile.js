var gulp = require("gulp");
var sass = require("gulp-sass");
var plumber = require("gulp-plumber");
var gutil = require("gulp-util");
var livereload = require("gulp-livereload");


var errorHandler = function(e) {
    gutil.beep();
    gutil.log(e);
};


var dir = {
    sass: ["./sass/*.scss"]
};


gulp.task("sass", function() {
    gulp.src(dir.sass)
        .pipe(sass())
        .pipe(gulp.dest("css"));
});

gulp.task("watch", function() {
    gulp.watch(dir.sass, function(file) {
        gulp.src(file.path)
            .pipe(plumber({
                errorHandler: errorHandler
            }))
            .pipe(sass())
            .pipe(gulp.dest("css"));
    });

    livereload.listen();
    gulp.watch(["css/*.css", "js/*.js"]).on('change', livereload.changed);
    
    // gulp.watch(["css/*.css", "js/*.js"]).on('change', function(file) {
    //     console.log(new Date().getTime() + " " + file.path + " reloaded");
    // });
});

gulp.task("default", ["sass"]);