"use strict";

const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const debug = require('gulp-debug');
const gulpIf = require('gulp-if');
const del = require('del');
const jshint = require('gulp-jshint');
const path = require('path');
const cp = require('child_process');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const htmlReplace = require('gulp-html-replace');

const config = require('./parsers/formula/config');

const isDevelopment = config.isDevelopment;
const src = config.src;
const dest = config.dest;

if (!isDevelopment) {
  console.log('Gulp: executing a production build!');
}

if(isDevelopment) {
  gulp.task('html', function () {
    return gulp.src(path.join(src,'**/*.html'), {buffer: false})
      .pipe(gulp.dest(dest)).pipe(debug());
  });

  gulp.task('js', function () {
    return gulp.src(path.join(src, '*.js'))
      .pipe(babel({presets: ['es2015']}))
      // .pipe(sourcemaps.init())
      // .pipe(sourcemaps.write())
      .pipe(gulp.dest(dest)).pipe(debug());
  });

} else {  // isDevelopment === false
  gulp.task('html', function () {  // TODO: 1) insert templates/, 2) change script refs to minimized file
    return gulp.src(path.join(src, '**/*.html'), {buffer: false})
      .pipe(htmlReplace({'main': 'script.min.js', 'sub': ''}))
      .pipe(gulp.dest(dest)).pipe(debug());
  });
  
  gulp.task('js', function () {
    return gulp.src(path.join(src, '*.js'))
      .pipe(babel({presets: ['es2015']}))
      .pipe(concat('script.min.js'))
      .pipe(gulp.dest(dest)).pipe(debug())
      .pipe(uglify())
      .pipe(gulp.dest(dest)).pipe(debug());
  });
}

gulp.task('static', function () {
  return gulp.src(path.join(src, '*.{css,png,json}'), {buffer: false})
    .pipe(gulp.dest(dest)).pipe(debug());
});

gulp.task('clean', function () {
  return del(dest);
});

gulp.task('build', gulp.series(
  'clean',
  gulp.parallel('html', 'js', 'static')
));


if (isDevelopment) {
  gulp.task('watch:static', function () {
    return gulp.watch(path.join(src, '*.{css,png,json}'), gulp.series('static'));  // webpack
  });
  gulp.task('watch:html', function () {
    return gulp.watch(path.join(src, '**/*.html'), gulp.series('html'));
  });
  gulp.task('watch', gulp.parallel('watch:static', 'watch:html'));

  gulp.task('default', gulp.series('build', 'watch'));

} else {  // isDevelopment == false
  gulp.task('default', gulp.series('build'));
}

gulp.task('jshint', function () {
  return gulp.src(path.join(src, '*.js'))
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
  // .pipe(jshint.reporter('fail'));
});