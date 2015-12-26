/**
 * Created by Rodey on 2015/12/2.
 */

var gulp    = require('gulp'),
    watch   = require('gulp-watch'),
    gulpTsc = require('gulp-tsc'),
    rename  = require('gulp-rename'),
    uglify  = require('gulp-uglify');


gulp.task('build.ts', function(){

    gulp.src('src/*.ts')
        .pipe(gulpTsc({
            sourceMap: false,
            outDir: 'dist',
            out: 'iot-dialog.js'
        }))
        .pipe(gulp.dest('dist'))
        .pipe(uglify())
        .pipe(rename('iot-dialog.min.js'))
        .pipe(gulp.dest('dist'));

});

gulp.task('build.min', function(){
    gulp.src('dist/iot-dialog.js')
        .pipe(rename({suffix: '.min'}))             //rename压缩后的文件名
        .pipe(uglify({ preserveComments: '!' }))    //压缩
        .pipe(gulp.dest('dist'));
});

gulp.task('build.watch', function(){
     gulp.watch('src/*.ts', ['build.ts']);
});

gulp.task('default', ['build.ts'], function(){
    gulp.start(['build.min', 'build.watch']);
});