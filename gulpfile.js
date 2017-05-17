"use strict";

const
  // Libraries
  path = require('path'),
  glob = require('glob'),
  del = require('del'),
  fs = require('fs'),
  cp = require('child_process'),
  browserify = require('browserify'),
  babelify = require('babelify'),
  bs = require('browser-sync').create(),
  source = require('vinyl-source-stream'),
  buffer = require('vinyl-buffer'),

  gulp = require('gulp'),
  $ = require('gulp-load-plugins')(),

  // Project files
  helpers = require('./helpers'),
  nconf = require('./config').nconf,
  formula = require('./parsers/formula/gulp-formula'),
  marked = require('./parsers/marked/gulp-marked');

const isDevelopment = nconf.get('NODE_ENV') || nconf.get('isDevelopment'),
  src = nconf.get('src'),
  dest = nconf.get('dest');


gulp.task('html-inject', function () {
  return gulp.src(path.join(dest, 'index.html'))
    .pipe($.if((file) => /index\.html/.test(file.path), // execute inject only on index.html
      $.inject(gulp.src(path.join(dest, 'fragments/**/*.html')), {
        starttag: '<!-- inject:{{path}} -->',
        relative: true,
        transform: function (filePath, file) {
          let res = file.contents.toString('utf8');
          $.util.log(`Fragment ${filePath} loaded`);
          return res;
        }
      })))
    .pipe(gulp.dest(dest));
});

gulp.task('html-remove-injected', function (cb) {
  fs.readFile(path.join(dest, 'index.html'), {encoding: 'utf-8'}, function (err, data) {
    // identify injected fragments
    if (err) return cb(err);
    let results = data.match(/<!--\s*inject:(\S*)\s*-->([\s\S]*?)<!--\s*endinject\s*-->/g);
    if (!results) {
      $.util.log(`No injections to index.html`);
      return cb();
    }
    // remove injected fragments
    results.forEach((commentString) => {
      let results = commentString.match(/<!--\s*inject:(\S*)\s*-->([\s\S]*?)<!--\s*endinject\s*-->/),
        filePath = results[1],
        contents = results[2];
      if (!contents.trim().length) return;

      $.util.log(`Injected fragment: ${filePath}`);
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
    .pipe($.htmlReplace({'js': isDevelopment ? 'script.js' : 'script.min.js', 'cut': ''}))
    .pipe(gulp.dest(dest)).pipe($.debug());
});

gulp.task('html', gulp.series('html-main', 'html-inject', 'html-remove-injected'));


gulp.task('js', function () {
  let entries = [];
  nconf.get('entryPoints').forEach(function (entry) {
    entries.push(glob.sync(path.join(src, entry)));
  });

  let bConfig = {
    entries: entries,
    debug: isDevelopment,
    transform: [babelify]
  };

  let b = browserify(bConfig);

  return b.bundle()
    .pipe(source('script.js'))
    .pipe(buffer())  // convert stream to buffer for gulp-uglify
    .pipe($.if(isDevelopment, $.sourcemaps.init({loadMaps: true})))
    .pipe($.if(!isDevelopment, $.uglify()))
    .pipe($.if(!isDevelopment, $.concat('script.min.js')))
    .pipe($.if(isDevelopment, $.sourcemaps.write()))
    .pipe(gulp.dest(dest));
});


gulp.task('static', function () {
  return gulp.src(path.join(src, '*.{css,png,json}'), {buffer: false})
    .pipe($.cached())
    .pipe(gulp.dest(dest)).pipe($.debug());
});

gulp.task('clean', function () {
  return del(dest);
});

gulp.task('build', gulp.series(
  'clean',
  gulp.parallel('html', 'js', 'static')
));

gulp.task('lint', function () {
  return gulp.src(path.join(src, '**/*.js'))
    .pipe($.eslint())
    .pipe($.eslint.format());
});

gulp.task('serve', function () {
  let serverRoot = nconf.get('serveFromSrc') && isDevelopment ? src : dest;
  bs.init({
    server: {baseDir: serverRoot}
    // proxy: {target: `localhost:${nconf.get("port")}`}
  });
  bs.watch(path.join(dest, '**/*.*')).on('change', bs.reload);
});

gulp.task('watch:static', function () {
  let watcher = gulp.watch(path.join(src, '*.{css,png,json}'), gulp.series('static'));  // webpack

  // https://github.com/gulpjs/gulp/blob/4.0/docs/recipes/handling-the-delete-event-on-watch.md
  watcher.on('unlink', function (filepath) {
    let filePathFromSrc = path.relative(path.resolve(src), filepath);
    let destFilePath = path.resolve(dest, filePathFromSrc);
    del.sync(destFilePath);
  });

  return watcher;
});

gulp.task('watch:html', function () {
  return gulp.watch(path.join(src, '**/*.html'), gulp.series('html'));
});
gulp.task('watch:js', function () {
  return gulp.watch(path.join(src, '**/*.js'), gulp.series('js'));
});
gulp.task('watch', gulp.series(gulp.parallel('watch:static', 'watch:html', 'watch:js')));


gulp.task('dev', gulp.series('build', gulp.parallel('watch', 'serve')));
gulp.task('prod', gulp.series('build'));

if (isDevelopment) {
  console.log('Gulp: executing a development build.');
  gulp.task('default', gulp.series('dev'));
} else {
  console.log('Gulp: executing a production build!');
  gulp.task('default', gulp.series('prod'));
}
