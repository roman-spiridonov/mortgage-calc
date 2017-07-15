/**
 * Created by Roman Spiridonov <romars@phystech.edu> on 5/8/2017.
 */
"use strict";

const
  // Libraries
  expect = require('chai').expect,
  sinon = require('sinon'),
  gulp = require('gulp'),
  path = require('path'),
  async = require('async'),

// Project modules
  formula = require('../parsers/formula/gulp-formula'),
  marked = require('../parsers/marked/gulp-marked'),
  fixtures = require('./fixtures'),
  DIRS = fixtures.DIRS;


function doGulpTest(fileName, gulpSrcOptions, gulpPlugins, cb) {
  let gulpStream = gulp.src(path.join(DIRS.data, fileName), gulpSrcOptions);
  if (!gulpPlugins.length) throw new Error(`You should pass an array of gulpPlugins [ {plugin: <...>, options: {...} } ] as third parameter`);

  for (let i in Object.keys(gulpPlugins)) {
    let plugin = gulpPlugins[i].plugin;
    let options = gulpPlugins[i].options;
    gulpStream = gulpStream.pipe(plugin(options));
  }

  return gulpStream
    .pipe(gulp.dest(DIRS.out))
    .on('end', () => fixtures.verify(fileName, cb));
}


describe("gulpPluginFabric", function () {
  beforeEach(function () {
    fixtures.removeDir(DIRS.out);
  });

  it("Works by default in gulp", function (done) {
    async.parallel([
      (cb) => doGulpTest('formulas.html', {}, [{plugin: formula}], cb),
      (cb) => doGulpTest('test.html', {}, [{plugin: formula}, {plugin: marked}], cb),
      (cb) => doGulpTest('test.md', {}, [{plugin: marked}, {plugin: formula}], cb)
    ], done);
  });

  it("Works for stream of objects in gulp {buffer: false}", function (done) {
    async.parallel([
      (cb) => doGulpTest('formulas.html', {buffer: false}, [{plugin: formula}], cb),
      (cb) => doGulpTest('test.html', {buffer: false}, [{plugin: formula}, {plugin: marked}], cb),
      (cb) => doGulpTest('test.md', {buffer: false}, [{plugin: marked}, {plugin: formula}], cb)
    ], done);
  });

  it("Throws an error for {read: false}", function (done) {
    gulp.src(path.join(DIRS.data, 'formulas.html'), {read: false})
      .pipe(formula({}))
      .on('error', function (err) {
        expect(err).to.exist;
        expect(err.message).to.match(/gulp-formula/i);
        done();
      });
  });

});
