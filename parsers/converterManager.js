/**
 * Created by Roman Spiridonov <romars@phystech.edu> on 4/20/2017.
 */
"use strict";

const
  glob = require('glob'),
  async = require('async'),
  fs = require('fs'),
  path = require('path');

const STATUS_TO_NUM = {
  'success': 1,
  'warning': 2,
  'error': 3,
  'fatal': 4
};

const NUM_TO_STATUS = {
  1: 'success',
  2: 'warning',
  3: 'error',
  4: 'fatal'
};

/**
 * Provides public API. Registers and runs individual converters.
 * @constructor
 */
function ConverterManager() {
  this._isRunning = false;
  this._options = {converters: [], src: '', dest: 'out/'};

  this._converters = {};  // registered converters (converter constructors)

  this._fileMap = {};  // file contents cache
  this._resultMap = {};  // current conversion result (maps file names to conversion report)
}

const _p = ConverterManager.prototype;

/**
 * Run all converters on a glob of files.
 * @param globStr
 * @param cb
 */
_p.run = function (globStr, cb) {
  if (this._isRunning) {  // prevent concurrent runs on a single instance
    return cb(new Error("Running multiple conversions on a single ConverterManager instance is not allowed."));
  }

  this._isRunning = true;

  glob(globStr, (err, filenames) => {
    async.each(filenames, this.runOnFile.bind(this), (err) => {
      if (err) return cb(err);
      this._isRunning = false;  // unlock for new runs
      cb(null, this._resultMap);
    });
  });

};


/**
 * Run all converters on a single file.
 * @param file
 * @param cb
 */
_p.runOnFile = function (file, cb) {
  file = path.normalize(file);
  this._parseFile(file, (err) => {
    if (err) return cb(err);
    this._storeResults(file, cb);
  });
};

/**
 * Load and parse a specified file using all converters.
 * @param {string} file - text string with path to a file
 * @param {function} cb - callback that receives resulting file string and parsing report
 * @private
 */
_p._parseFile = function (file, cb) {
  fs.readFile(file, {encoding: 'utf-8'}, (err, fileStr) => {
    if (err) return cb(err);
    this._fileMap[file] = {contents: fileStr, dest: this.getDestForFile(file)};
    this._resultMap[file] = {};

    this._fileMap[file]._outstandingHandlers = this._options.converters.length;

    for (let i = 0; i < this._options.converters.length; i++) {
      this._options.converters[i].convert(fileStr, (err, preparedFileStr, report) => {
        if (err) return cb(err);

        this._fileMap[file].preparedFileStr = preparedFileStr;

        // Store parsing report
        let resForFile = this._resultMap[file];
        if (!resForFile.report) {
          resForFile.report = [report];
        } else {
          resForFile.report.push(report);
        }

        this._fileMap[file]._outstandingHandlers--;
        if (this._fileMap[file]._outstandingHandlers === 0) {
          let statuses = this._extractStatusFromResults(resForFile);
          resForFile.status = this._calculateStatus(statuses);

          cb(null, this._resultMap);
        }
      });
    }
  });
};


/**
 * Return array of statuses from file conversion report object.
 * @param resForFile {Object} - an object that contains .report array with statuses
 * @returns {Array} - array of statuses
 * @private
 */
_p._extractStatusFromResults = function (resForFile) {
  let statuses = [];
  resForFile.report.forEach((singleConverterReport) => {
    statuses.push(singleConverterReport.status);
  });

  return statuses;
};


/**
 * Returns a resulting status from an array of statuses.
 * @param statuses {Array}
 * @private
 */
_p._calculateStatus = function (statuses) {
  let resStatusNum = 1;
  statuses.forEach((status) => {
    resStatusNum = STATUS_TO_NUM[status] > resStatusNum ? STATUS_TO_NUM[status] : resStatusNum;
  });

  return NUM_TO_STATUS[resStatusNum];
};

/**
 * Store file with converted results.
 * @param file {string} - path to a file (key in the result map)
 * @param cb
 * @private
 */
_p._storeResults = function (file, cb) {
  if (!this._fileMap[file]) {
    throw new Error("File is not in the map.")
  }

  let preparedFileStr = this._fileMap[file].preparedFileStr;

  // Save prepared file contents to disk
  let dest = this._fileMap[file].dest;
  this._resultMap[file].dest = dest;
  fs.writeFile(dest, preparedFileStr, {encoding: 'utf-8'}, (err) => {
    if (err) return cb(err);
    cb(null, file);
  });
};


/**
 * Removes specified files from state.
 * @param {Array} files - array of strings which are paths to files.
 */
_p.clearCache = function (files) {
  if (files.forEach) {
    files.forEach((file) => {
      delete this._resultMap[file];
      delete this._fileMap[file];
    });
  } else {  // single file
    delete this._resultMap[files];
    delete this._fileMap[files];
  }
};

// TODO: refactor (too slow)
_p.setUp = function (setUpObject) {
  setUpObject.converters.forEach((conv) => {
    if (!this._converters.hasOwnProperty(conv.name)) {
      throw new Error(`Converter ${conv.name} was not registered with prior call to use() function.`);
    }
    // instantiates it with the passed settings
    const C = this._converters[conv.name];
    let c = new C(conv.settings);

    // add the instance (in order) to the list of active converters
    this._options.converters.push(c);
  });

  this._options.dest = setUpObject.dest;
  this._options.src = setUpObject.src;
};

_p.getDestForFile = function (file) {
  if (!this._options.dest) throw new Error("Destination folder was not specified");
  return path.join(this._options.dest, path.basename(file));
};

/**
 * Register converter.
 * @param Converter {constructor}
 */
_p.use = function (Converter, name) {
  if (name === undefined) {
    name = Converter.prototype._name;
  }

  // Add constructor to the map
  this._converters[name] = Converter;
};

module.exports = new ConverterManager();