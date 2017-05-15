"use strict";

const
  // Libraries
  gulp = require('gulp'),
  // sourcemaps = require('gulp-sourcemaps'),
  debug = require('gulp-debug'),
  gulpIf = require('gulp-if'),
  noop = require('gulp-noop'),
  inject = require('gulp-inject'),
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

const isDevelopment = nconf.get('isDevelopment'),
  doStandalone = nconf.get('doStandalone'),
  src = nconf.get('src'),
  dest = nconf.get('dest');


if (isDevelopment) {
  gulp.task('html', function () {
    return gulp.src(path.join(src, '**/*.html'), {buffer: false})
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
  console.log('Gulp: executing a production build!');

  gulp.task('html', function () {
    let source = doStandalone ?
      gulp.src(path.join(src, 'index.html')).pipe(inject(gulp.src(path.join(src, 'fragments/**/*.html')), {
        starttag: '<!-- inject:{{path}} -->',
        relative: true,
        transform: function (filePath, file) {
          return file.contents.toString('utf8');
        }
      }))
      : gulp.src(path.join(src, '**/*.html'), {buffer: false});

    return source
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
      .pipe(gulpIf(nconf.get('doMinify'), uglify(), noop))
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
