/**
 * Created by Roman Spiridonov <romars@phystech.edu> on 5/8/2017.
 */
"use strict";

const
  through = require('through2'),
  gutil = require('gulp-util'),
  PluginError = gutil.PluginError,
  fc = new (require('./formulaConverter').FormulaConverter)();  // create singleton with default options

// Consts
const PLUGIN_NAME = 'gulp-formula';

function gulpFormula(options) {
  fc.init(options);

  return through.obj(function (file, enc, cb) {
    if (file.isNull()) {
      return cb(new PluginError(PLUGIN_NAME, "Gulp-formula needs file contents to be read. Try removing {read: false}."));

    } else if (file.isBuffer()) {
      let fileStr = file.contents.toString();
      runConversion(fileStr);

    } else if (file.isStream()) {
      // FormulaConverter requires full string to process
      let fileStr = '';
      file.contents
        .on('data', (data) => { fileStr+=data; })
        .on('end', () => runConversion(fileStr));
    }

    function runConversion(fileStr) {
      fc.convert(fileStr, (err, preparedFileStr, report) => {
        console.log(preparedFileStr);
        if (err) return cb(new PluginError(PLUGIN_NAME, err.message));
        file.contents = new Buffer(preparedFileStr);
        cb(null, file);
      });
    }

  });

}

module.exports = gulpFormula;