'use strict';

var gulp = require('gulp');
var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var nodemon = require('gulp-nodemon');
var mocha = require('gulp-mocha');
var argv = require('yargs').argv;

gulp.task('lint', () => {
  return gulp.src('web/assets/js/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('sass', () => {
  return gulp.src('web/assets/scss/*.scss')
    .pipe(sass({outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(gulp.dest('web/public/css'));
});

gulp.task('scripts', () => {
  return gulp.src([
    'web/bower_components/jquery/dist/jquery.min.js',
    'web/bower_components/underscore/underscore-min.js',
    'web/bower_components/moment/moment.js',
    'web/bower_components/angular/angular.js',
    'web/bower_components/angular-route/angular-route.js',
    'web/bower_components/angular-mocks/angular-mocks.js',
    'web/bower_components/highcharts/highcharts.js',
    'web/assets/js/typey.js',
    'web/assets/js/services.js',
    'web/assets/js/controllers.js',
    'web/assets/js/app.js'
])
  .pipe(concat('scripts.js'))
  .pipe(gulp.dest('web/public/js'))
  .pipe(rename('scripts.min.js'))
  .pipe(uglify())
  .pipe(gulp.dest('web/public/js'));
});

gulp.task('watch', () => {
  gulp.watch('web/assets/js/*.js', ['lint', 'scripts']);
  gulp.watch('web/assets/scss/*.scss', ['sass']);
  gulp.watch('./');
});

gulp.task('nodemon', (cb) => {
  let started = false;
  return nodemon({
    script: 'connections/localhostConfig.js',
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

gulp.task('test', () => {
  var testFile = './spec/serverTest.js';
  if(argv.scraper){
    testFile = './spec/scraperTest.js';
  }
  if(argv.heroku){
    process.env.heroku = true;
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
    .once('error', (err) => {
        console.log('error in gulptest',err)
        process.exit(1);
    })
    .once('end', () => {
      process.exit();
    });
});

// gulp.task('test', () => {
//   return gulp.src('./spec/server-localhost-test.js')
//     .pipe(mocha({reporter: 'spec' }))  
//     .once('error', (err) => {
//         console.log('error in gulptest',err)
//         process.exit(1);
//     })
//     .once('end', () => {
//       process.exit();
//     });
// });

gulp.task('default', ['lint', 'sass', 'scripts', 'watch']);