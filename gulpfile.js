'use strict';

// Include gulp
var gulp = require('gulp');

// Include Our Plugins
var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

// // Lint Task
// gulp.task('lint', function() {
//   return gulp.src('assets/js/*.js')
//     .pipe(jshint())
//     .pipe(jshint.reporter('default'));
// });

// Compile Our Sass
gulp.task('sass', function() {
  return gulp.src('web/assets/scss/*.scss')
    .pipe(sass({outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(gulp.dest('web/public/css'));
});

// // Concatenate & Minify JS
// gulp.task('scripts', function() {
//   return gulp.src([
//     'bower_components/jquery/dist/jquery.min.js',
//     'bower_components/underscore/underscore-min.js',
//     'assets/js/app.js'
// ])
//   .pipe(concat('scripts.js'))
//   .pipe(gulp.dest('public/js'))
//   .pipe(rename('scripts.min.js'))
//   .pipe(uglify())
//   .pipe(gulp.dest('public/js'));
// });

// // Watch Files For Changes
// gulp.task('watch', function() {
//   gulp.watch('assets/js/*.js', ['lint', 'scripts']);
//   gulp.watch('assets/scss/*.scss', ['sass']);
// });

// Default Task
gulp.task('default', []);