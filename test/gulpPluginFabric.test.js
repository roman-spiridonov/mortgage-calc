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
  fs = require('fs'),
  async = require('async'),

// Project modules
  formula = require('../parsers/formula/gulp-formula'),
  marked = require('../parsers/marked/gulp-marked');

const DIRS = {
  data: path.join(__dirname, 'fixtures', 'data'),
  out: path.join(__dirname, 'fixtures', 'out'),
  expected: path.join(__dirname, 'fixtures', 'expected'),
};

function removeDir(dir) {
  if (fs.existsSync(dir)) {
    let files = fs.readdirSync(dir);
    for (let i in Object.keys(files)) {
      fs.unlinkSync(path.join(dir, files[i]));
    }
    fs.rmdirSync(dir);
  }
}

function dos2nix(fileStr) {
  return fileStr.replace(/\r\n/g, "\n");
}

function checkFileStrEql(fileStr1, fileStr2) {
  return ( dos2nix(fileStr1) === dos2nix(fileStr2) );
}

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
    .on('end', function () {
      let fileStrActual, fileStrExpected;
      try {
        fileStrActual = fs.readFileSync(path.join(DIRS.out, fileName), {encoding: "utf-8"});
        fileStrExpected = fs.readFileSync(path.join(DIRS.expected, fileName), {encoding: "utf-8"});
      } catch (err) {
        throw err;
      }

      expect(checkFileStrEql(fileStrActual, fileStrExpected)).to.be.true;
      cb();
    });
}


describe("gulpPluginFabric", function () {
  beforeEach(function () {
    removeDir(DIRS.out);
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
