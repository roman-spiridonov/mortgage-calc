/**
 * Created by Roman Spiridonov <romars@phystech.edu> on 5/8/2017.
 */
"use strict";

const
  through = require('through2'),
  gutil = require('gulp-util'),
  PluginError = gutil.PluginError;

/**
 * @name Converter
 * @type constructor
 * @description class that implements functions init(options) and convert(fileStr, cb)
 */
/**
 * Fabric that creates a gulp plug-in for a specified Converter class.
 * @param Converter {Converter}
 * @param name {string} - specify to change the default name of the converter
 * @returns {function}
 */
module.exports = function(Converter, name) {
  const c = new Converter();

  if (name === undefined) {
    name = Converter.prototype._name;
  }
  const PLUGIN_NAME = 'gulp-' + name;

  return function gulpPlugin(options) {
    c.init(options);

    return through.obj(function (file, enc, cb) {
      if (file.isNull()) {
        return cb(new PluginError(PLUGIN_NAME, "Gulp-formula needs file contents to be read. Try removing {read: false}."));

      } else if (file.isBuffer()) {
        let fileStr = file.contents.toString();
        runConversion(fileStr);

      } else if (file.isStream()) {
        // Converter requires full string to process
        let fileStr = '';
        file.contents
          .on('data', (data) => { fileStr+=data; })
          .on('end', () => runConversion(fileStr));
      }

      function runConversion(fileStr) {
        c.convert(fileStr, (err, preparedFileStr, report) => {
          if (err) return cb(new PluginError(PLUGIN_NAME, err.message));
          file.contents = new Buffer(preparedFileStr);
          cb(null, file);
        });
      }
    });
  };
};
