"use strict";

const
  // Libraries
  gulp = require('gulp'),
  // sourcemaps = require('gulp-sourcemaps'),
  debug = require('gulp-debug'),
  gulpIf = require('gulp-if'),
  del = require('del'),
  path = require('path'),
  cp = require('child_process'),
  concat = require('gulp-concat'),
  uglify = require('gulp-uglify'),
  babel = require('gulp-babel'),
  htmlReplace = require('gulp-html-replace'),
  // Project files
  nconf = require('./config').nconf,
  formula = require('./parsers/formula/gulp-formula'),
  marked = require('./parsers/marked/gulp-marked');

const isDevelopment = nconf.get('isDevelopment');
const src = nconf.get('src');
const dest = nconf.get('dest');

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
      .pipe(htmlReplace({'js': 'script.min.js', 'cut': ''}))
      .pipe(marked())
      .pipe(formula({output: "html"}))
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
