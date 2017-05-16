"use strict";

const
  // Libraries
  path = require('path'),
  fs = require('fs'),
  cp = require('child_process'),
  browserify = require('browserify'),
  babelify = require('babelify'),
  source = require('vinyl-source-stream'),
  buffer = require('vinyl-buffer'),
  gulp = require('gulp'),
  sourcemaps = require('gulp-sourcemaps'),
  debug = require('gulp-debug'),
  gulpIf = require('gulp-if'),
  noop = require('gulp-noop'),
  inject = require('gulp-inject'),
  add = require('gulp-add-src'),
  del = require('del'),
  concat = require('gulp-concat'),
  uglify = require('gulp-uglify'),
  babel = require('gulp-babel'),
  htmlReplace = require('gulp-html-replace'),
  gutil = require('gulp-util'),
  // Project files
  helpers = require('./helpers'),
  nconf = require('./config').nconf,
  formula = require('./parsers/formula/gulp-formula'),
  marked = require('./parsers/marked/gulp-marked');

const isDevelopment = nconf.get('isDevelopment'),
  src = nconf.get('src'),
  dest = nconf.get('dest');


gulp.task('html-inject', function () {
  return gulp.src(path.join(dest, 'index.html'))
    .pipe(gulpIf((file) => /index\.html/.test(file.path), // execute inject only on index.html
      inject(gulp.src(path.join(dest, 'fragments/**/*.html')), {
        starttag: '<!-- inject:{{path}} -->',
        relative: true,
        transform: function (filePath, file) {
          let res = file.contents.toString('utf8');
          gutil.log(`Fragment ${filePath} loaded`);
          return res;
        }
      })))
    .pipe(gulp.dest(dest));
});

gulp.task('html-remove-injected', function (cb) {
  fs.readFile(path.join(dest, 'index.html'), {encoding: 'utf-8'}, function (err, data) {
    // identify injected fragments
    if(err) return cb(err);
    let results = data.match(/<!--\s*inject:(\S*)\s*-->([\s\S]*?)<!--\s*endinject\s*-->/g);
    if(!results) {
      gutil.log(`No injections to index.html`);
      return cb();
    }
    // remove injected fragments
    results.forEach((commentString) => {
      let results = commentString.match(/<!--\s*inject:(\S*)\s*-->([\s\S]*?)<!--\s*endinject\s*-->/),
        filePath = results[1],
        contents = results[2];
      if(!contents.trim().length) return;

      gutil.log(`Injected fragment: ${filePath}`);
      try {
        let fullFilePath = path.join(dest, filePath);
        del.sync(fullFilePath);
        helpers.removeDirIfEmptySync(path.dirname(fullFilePath));
      } catch (err) {
        cb(err);
      }

      cb();
    });
  });
});

gulp.task('html-main', function () {
  return gulp.src(path.join(src, '**/*.html'), {buffer: false})
    .pipe(marked())
    .pipe(formula({output: "html"}))
    .pipe(htmlReplace({'js': isDevelopment ? 'script.js' : 'script.min.js', 'cut': ''}))
    .pipe(gulp.dest(dest)).pipe(debug())
});

gulp.task('html', gulp.series('html-main', 'html-inject', 'html-remove-injected'));


gulp.task('js', function () {
  let b = browserify({
    entries: [path.join(src, 'script.js'), path.join(src, 'fragments', 'calculator-exec.js')],
    debug: isDevelopment,
    transform: [babelify]
  });

  return b.bundle()
    .pipe(source('script.js'))
    .pipe(buffer())  // convert stream to buffer for gulp-uglify
    .pipe(gulpIf(isDevelopment, sourcemaps.init({loadMaps: true})))
    .pipe(gulpIf(!isDevelopment, uglify()))
    .pipe(gulpIf(!isDevelopment, concat('script.min.js')))
    .on('error', gutil.log)
    .pipe(gulpIf(isDevelopment, sourcemaps.write('./')))
    .pipe(gulp.dest(dest))
});


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
  gulp.task('watch:js', function () {
    return gulp.watch(path.join(src, '**/*.js'), gulp.series('js'));
  });
  gulp.task('watch', gulp.parallel('watch:static', 'watch:html', 'watch:js'));

  gulp.task('default', gulp.series('build', 'watch'));

} else {  // isDevelopment == false
  console.log('Gulp: executing a production build!');
  gulp.task('default', gulp.series('build'));
}
