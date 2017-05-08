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

  // Project modules
  formula = require('../parsers/formula/gulpFormula');

const DIRS = {
  data: path.join(__dirname, 'fixtures', 'data'),
  out: path.join(__dirname, 'fixtures', 'out'),
  expected: path.join(__dirname, 'fixtures', 'expected'),
};

function removeDir(dir) {
  if (fs.existsSync(dir)) {
    let files = fs.readdirSync(dir);
    for (let i in files) {
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

function doGulpTest(fileName, gulpSrcOptions, options, cb) {
  gulp.src(path.join(DIRS.data, fileName), gulpSrcOptions)
    .pipe(formula(options))
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


describe("gulp-formula", function () {
  beforeEach(function () {
    removeDir(DIRS.out);
  });

  it("Works by default in gulp", function (done) {
    doGulpTest('formulas.html', {}, {}, done);
  });

  it("Works for stream of objects in gulp {buffer: false}", function (done) {
    doGulpTest('formulas.html', {buffer: false}, {}, done);
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