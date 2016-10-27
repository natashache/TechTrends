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
var argv = require('yargs').argv;

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
gulp.task('nodemon-debug', (cb) => {
  let started = false;
  var file = process.args[2];
  console.log(file);
  return nodemon({
    script: 'connections/mlabTestConfig.js',
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
  var testFile = './spec/serverTest.js';
  if(argv.scraper){
    testFile = './spec/scraperTest.js';
  }
  if(argv.mlab){
    process.env.target = '../connections/mlabTestConfig.js';
  }
  if(argv.local){
    process.env.target = '../connections/localhostConfig.js';
  }
  if(argv.debug){
    process.env.debug = true;
  }
  return gulp.src(testFile)
    .pipe(mocha({reporter: 'spec' }))  
    .once('error', function(err) {
        console.log('error in gulptest',err)
        process.exit(1);
    })
    .once('end', function() {
      process.exit();
    });
});

// gulp.task('test', function() {
//   return gulp.src('./spec/server-localhost-test.js')
//     .pipe(mocha({reporter: 'spec' }))  
//     .once('error', function(err) {
//         console.log('error in gulptest',err)
//         process.exit(1);
//     })
//     .once('end', function() {
//       process.exit();
//     });
// });

// Default Task
gulp.task('default', ['lint', 'sass', 'scripts', 'watch']);