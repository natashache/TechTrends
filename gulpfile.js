'use strict';

// Include gulp
var gulp = require('gulp');

// Include Our Plugins
var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var nodemon = require('gulp-nodemon');
var mocha = require('gulp-mocha');

// Lint Task
gulp.task('lint', function() {
  return gulp.src('web/assets/js/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

// Compile Our Sass
gulp.task('sass', function() {
  return gulp.src('web/assets/scss/*.scss')
    .pipe(sass({outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(gulp.dest('web/public/css'));
});

// Concatenate & Minify JS
gulp.task('scripts', function() {
  return gulp.src([
    'bower_components/jquery/dist/jquery.min.js',
    'bower_components/underscore/underscore-min.js',
    'web/assets/js/app.js'
])
  .pipe(concat('scripts.js'))
  .pipe(gulp.dest('web/public/js'))
  .pipe(rename('scripts.min.js'))
  .pipe(uglify())
  .pipe(gulp.dest('web/public/js'));
});

// Watch Files For Changes
gulp.task('watch', function() {
  gulp.watch('web/assets/js/*.js', ['lint', 'scripts']);
  gulp.watch('web/assets/scss/*.scss', ['sass']);
  gulp.watch('./');
});

//start server with localhost database
gulp.task('nodemon', (cb) => {
  let started = false;

  return nodemon({
    script: 'devConfig.js',
  })
    .on('data', () => {
      if (!started) {
        started = true;
      }
    })
    .on('restart', () => {
      console.log('restarting');
    });

});

gulp.task('test', function() {
  return gulp.src('./spec/*.js')
    .pipe(mocha({reporter: 'spec' }))  
    .once('error', function(err) {
        console.log('error in gulptest',err)
        process.exit(1);
    })
    .once('end', function() {
      process.exit();
    });
});

// Default Task
gulp.task('default', ['lint', 'sass', 'scripts', 'watch']);