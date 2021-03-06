/**
 * Created by Roman Spiridonov <romars@phystech.edu> on 4/20/2017.
 */
"use strict";

const
  glob = require('glob'),
  async = require('async'),
  fs = require('fs'),
  path = require('path'),

  config = require('../config').config,
  nconf = require('../config').nconf,
  helpers = require('../helpers');

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

const NAME_TO_CONV = {
  'formula': require('./formula/formulaConverter').FormulaConverter,
  'marked': require('./marked/markedConverter').MarkedConverter
};

/**
 * Provides public API. Registers and runs individual converters.
 * @constructor
 */
function ConverterManager() {
  this._isRunning = false;
  this._options = {converters: [], src: nconf.get('src'), dest: nconf.get('dest'), glob: nconf.get('glob')};

  this._converters = {};  // registered converters (converter constructors)

  this._fileMap = {};  // file contents cache
  this._resultMap = {};  // current conversion result (maps file names to conversion report)
}

const _p = ConverterManager.prototype;

/**
 * Run all converters on a glob of files.
 * @param files
 * @param cb
 */
_p.run = function (files, cb) {
  if (this._isRunning) {  // prevent concurrent runs on a single instance
    return cb(new Error("Running multiple conversions on a single ConverterManager instance is not allowed."));
  } else if (!files || files === '') {
    files = this._options.glob;
  }

  if (Array.isArray(files)) {
    // passed list of files
    this._isRunning = true;

    // create destination directory if not exists
    helpers.createDir(this._options.dest, (err) => {
      if(err) return cb(err);
      // run each file from the collection
      async.each(files,
        this.runOnFile.bind(this),
        (err) => {
          if (err) return cb(err);
          this._isRunning = false;  // unlock for new runs
          cb(null, this._resultMap);
        }
      );
    });

  } else {
    // passed a glob
    glob(files, (err, filenames) => {
      if (err) return cb(err);
      this.run(filenames, cb);
    });
  }

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
  let self = this;
  fs.readFile(file, {encoding: 'utf-8'}, (err, fileStr) => {
    if (err) return cb(err);
    this._fileMap[file] = {contents: fileStr, preparedFileStr: fileStr, dest: this.getDestForFile(file)};
    this._resultMap[file] = {};

    this._fileMap[file]._outstandingHandlers = this._options.converters.length;

    let convertFuncs = [];
    let j = 0;
    for (let i = 0; i < this._options.converters.length; i++) {
      let c = this._options.converters[i];
      if (j === 0) {
        convertFuncs[j++] = (cb) => cb(null, self._fileMap[file].preparedFileStr);
      }
      convertFuncs[j++] = c.convert.bind(c);
      convertFuncs[j++] = interimCb;
    }
    // running converters in order, saving interim results to cache
    async.waterfall(convertFuncs, finalCb);

    function interimCb(preparedFileStr, report, cb) {
      /**
       * @callback ConverterManager~convertCallback
       * @param err {null|Error}
       * @param preparedFileStr {string} - resulting string
       * @param report {ReportObject} - JSON with the report that has the following structure
       */
      /**
       * @name ReportObject
       * @type object
       * @property converter {string} - name of the converter
       * @property status {string} - "success", "warning", "error", or "fatal"
       * @property message {string} - error message (if status is "warning" or lower)
       */
      self._fileMap[file].preparedFileStr = preparedFileStr;

      // Store parsing report
      let resForFile = self._resultMap[file];
      if (!resForFile.report) {
        resForFile.report = [report];
      } else {
        resForFile.report.push(report);
      }
      self._fileMap[file]._outstandingHandlers--;

      cb(null, self._fileMap[file].preparedFileStr);
    }

    function finalCb(err, preparedFileStr, report) {
      if (err) {
        interimCb(preparedFileStr, report, () => {
        });
      }

      let resForFile = self._resultMap[file];
      if (self._fileMap[file]._outstandingHandlers !== 0) {
        console.error(`Expected outstandingHandlers counter to be 0, but got ${self._fileMap[file]._outstandingHandlers}.`)
      }
      let statuses = self._extractStatusFromResults(resForFile);
      resForFile.status = self._calculateStatus(statuses);

      return cb(null, self._resultMap);
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

_p.setUp = function (setUpObject) {
  setUpObject.converters.forEach((conv) => {
    if (!this._converters.hasOwnProperty(conv.name)) {
      if (!NAME_TO_CONV[conv.name]) {
        // unknown converter
        throw new Error(`Converter ${conv.name} was not registered with prior call to use() function.`);
      } else {
        // standard converter name, register it
        this.use(NAME_TO_CONV[conv.name]);
      }
    }
    // instantiates it with the passed settings
    const C = this._converters[conv.name];
    let settings = helpers.mergeDeep(nconf.get(C.prototype._name), conv.settings);  // nconf contains default settings
    let c = new C(settings);

    // add the instance (in order) to the list of active converters
    this._options.converters.push(c);
  });

  setUpObject.dest && (this._options.dest = setUpObject.dest);
  setUpObject.src && (this._options.src = setUpObject.src);
};

_p.getDestForFile = function (file) {
  // TODO: keep src directory structure
  if (!this._options.dest) throw new Error("Destination folder was not specified");
  return path.join(this._options.dest, path.basename(file));
};

/**
 * Register converter.
 * @param Converter {Converter}
 * @param [name] {string} - specify to change the default name of the converter
 */
_p.use = function (Converter, name) {
  if (name === undefined) {
    name = Converter.prototype._name;
  }

  // Add constructor to the map
  this._converters[name] = Converter;
};

if (!module.parent) {
  let cm = new ConverterManager();

  let argv = require('yargs')
    .usage("Usage: $0 glob [--converters c1 c2 ...] [other options]", config.getMetaYargsObj(''))
    .example("$0 src/*.html --converters formula marked --formula:output svg")
    .help('h').alias('h', 'help')
    .argv
  ;

  // parse converters list and their settings
  let converters = [];
  argv.converters.forEach && argv.converters.forEach((convName) => {
    converters.push({
      name: convName,
      settings: argv[convName]
    });
  });
  argv.converters = converters;

  // prepare converter manager setup object
  let setUpObject = {};
  helpers.mergeDeep(setUpObject, argv);
  cm.setUp(setUpObject);

  // everything is prepared, run
  let files;
  if(argv._.length === 1) {
    if(argv._[0].match(/\*/)) {
      // glob
      files = argv._[0];
    } else {
      files = argv._;
    }
  }
  cm.run(files, (err, report) => {
    if (err) throw err;
    console.log(report);
  });

} else {
  module.exports = new ConverterManager();
}


