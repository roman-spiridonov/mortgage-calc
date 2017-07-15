/**
 * Created by Roman Spiridonov <romars@phystech.edu> on 5/8/2017.
 */
"use strict";

const
  through = require('through2'),
  gutil = require('gulp-util'),
  PluginError = gutil.PluginError;

/**
 * Fabric that creates a gulp plug-in for a specified Converter class.
 * @param [onInit] {function} - call this function with options passed to a plugin
 * @param onRun {function} - call this function with the data being piped, passing options as a second argument
 * @param name {string} - specify to change the default name of the converter
 * @returns {function}
 */
module.exports = function(name, onRun, onInit) {
  const PLUGIN_NAME = 'gulp-' + name || 'undefined';

  return function gulpPlugin(options) {
    onInit && onInit(options);

    return through.obj(function (file, enc, cb) {
      if (file.isNull()) {
        return cb(new PluginError(PLUGIN_NAME, `${PLUGIN_NAME} needs file contents to be read. Try removing {read: false}.`));

      } else if (file.isBuffer()) {
        let fileStr = file.contents.toString();
        runConversion(fileStr);

      } else if (file.isStream()) {
        // Function call requires full string to process
        let fileStr = '';
        file.contents
          .on('data', (data) => { fileStr+=data; })
          .on('end', () => runConversion(fileStr));
      }

      function runConversion(fileStr) {
        onRun(fileStr, (err, preparedFileStr, report) => {
          if (err) return cb(new PluginError(PLUGIN_NAME, err.message));
          file.contents = new Buffer(preparedFileStr);
          cb(null, file);
        });
      }
    });
  };
};
