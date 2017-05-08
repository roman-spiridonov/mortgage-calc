/**
 * Created by Roman Spiridonov <romars@phystech.edu> on 5/9/2017.
 */
"use strict";

const
  fs = require('fs'),
  path = require('path'),
  expect = require('chai').expect,
  glob = require('glob'),
  async = require('async');

const DIRS = {
  data: path.join(__dirname, 'fixtures', 'data'),
  out: path.join(__dirname, 'fixtures', 'out'),
  expected: path.join(__dirname, 'fixtures', 'expected'),
};

function getFixture(file, version) {
  return fs.readFileSync(path.join(DIRS[version], file), {encoding: 'utf-8'});
}

function verify(files, cb) {
  if(files.match(/\*/)) {
    verifyFixtures(files, cb)
  } else {
    verifyFixture(files, cb)
  }
}

function verifyFixtures(globStr, cb) {
  glob(path.join(DIRS.out, globStr), function (err, filenames) {
    if (err) return cb(err);

    async.each(filenames, verifyFixture.bind(this), cb);
  });
}

function verifyFixture(fileName, cb) {
  let fileStrActual, fileStrExpected;
  try {
    fileStrActual = fs.readFileSync(path.join(DIRS.out, fileName), {encoding: "utf-8"});
    fileStrExpected = fs.readFileSync(path.join(DIRS.expected, fileName), {encoding: "utf-8"});
  } catch (err) {
    return cb(err);
  }

  expect(checkFileStrEql(fileStrActual, fileStrExpected)).to.be.true;
  cb(null);
}

function dos2nix(fileStr) {
  return fileStr.replace(/\r\n/g, "\n");
}

function checkFileStrEql(fileStr1, fileStr2) {
  return ( dos2nix(fileStr1) === dos2nix(fileStr2) );
}

function removeDir(dir) {
  if (fs.existsSync(dir)) {
    let files = fs.readdirSync(dir);
    for (let i in Object.keys(files)) {
      fs.unlinkSync(path.join(dir, files[i]));
    }
    fs.rmdirSync(dir);
  }
}

exports.DIRS = DIRS;
exports.verify = verify;
exports.removeDir = removeDir;
exports.getFixture = getFixture;
