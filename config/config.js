/**
 * Created by Roman Spiridonov <romars@phystech.edu> on 5/6/2017.
 */
"use strict";

const helpers = require('../helpers');


/**
 * Provides helper functions and meta descriptions for embedded configs.
 * @param config {object} - current configuration
 * @param defaults {object} - default configuration
 * @constructor
 */
function Config(config, defaults) {
  this._defaults = {};
  this.add(config, defaults);
}

const _p = Config.prototype;

/**
 * Add more config options (overrides repeated ones).
 * @param config {object}
 * @param defaults {object}
 */
_p.add = function (config, defaults = {}) {
  helpers.mergeDeep(this, defaults, config);
  helpers.mergeDeep(this._defaults, defaults);
};

/**
 * Get the default value of a property in a format like "formula.output".
 */
_p.getDefault = function (propStr) {
  return this._getPropRef(propStr, this._defaults);
};

/**
 * Parse meta information for a config property in a format like "formula.output" and return its ref.
 */
_p._getMeta = function (propStr, target = this) {
  // add defaults to yargs meta
  let meta = this._getPropRef(propStr, target.meta);
  let config = this._getPropRef(propStr, target);

  config = this._normalizeMeta(config);
  meta = this._normalizeMeta(meta);
  helpers.mergeDeep(meta, (targetProp, sourceProp) => {
    // do not create new object properties on target
    if(helpers.isObject(sourceProp) && !targetProp) return true;
  }, config);

  return meta;
};


/**
 * Plainifies meta object and wraps values into { default: ... }.
 *
 * @private
 */
_p._normalizeMeta = function (config) {
  function _isMetaProp(prop) {
    return !!(prop.desc && prop.type);
  }

  // make plain object, do not plainify already prepared meta props
  let res = helpers.plainify(config, _isMetaProp);

  // wrap in {default: ...}
  for (let key of Object.keys(res)) {
    if (_isMetaProp(res[key])) continue;
    res[key] = {default: res[key]};
  }

  return res;
};


/**
 * Get the meta object in a format suitable for usage() function of yargs library.
 * @param {string[]} propStr - property object reference.
 */
_p.getMetaYargsObj = function (propStr) {
  return this._getMeta(propStr);
};

/**
 * Parse config property in a format like "formula.output" and return prop ref.
 * @param {string} propStr - Reference to a property as a "." delimited string
 * @param {Object} target - Object to look at
 */
_p._getPropRef = function (propStr, target = this) {
  if (propStr === null || propStr === '') {
    return target;
  }

  let interimProps = propStr.split('.');
  let res = target;
  for (let i = 0; i < interimProps.length; i++) {
    let prop = interimProps[i];
    if (i === 0) {
      res = target[prop];
      continue;
    }
    res = res[prop];
  }

  return res;
};

/**
 * @callback Config~executeCallback
 * @param {Error|null} err - returns error as a first argument in case it occurred, null if everything was ok.
 * @param {string} data - input data for a script
 * @param {object} argv - yargs object (add app-specific instructions)
 */

/**
 * Starts command-line application with yargs, supporting piped inputs.
 * @param propStr {string} - where to look for settings (e.g. inside 'formula' property)
 * @param cb {Config~executeCallback} - calls when done
 */
_p.runFromCmd = function (propStr, cb) {
  let self = this;

  // Support piping
  let data = "";
  if (!process.stdin.isTTY) {  // running as <cmd> "#Heading"
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function (chunk) {
      data += chunk;
    });
    process.stdin.on('end', () => {
      data = data.replace(/\n$/, ''); // replace trailing \n from hitting enter on stdin
      return execute(data);
    });

  } else {  // running as cat file.html | <cmd>
    return execute(null);
  }


  function execute(data) {
    let argv = require('yargs');
    if (!data) {
      // require formula string as a first parameter
      argv = argv.demandCommand(1);
    }

    argv = argv
      .usage("Usage: $0 \"<your input>\" [options]", self.getMetaYargsObj(propStr))
      .example("$0 \"your input\" [options]")
      .example("echo \"your input\" | $0 [options]")
      .help('h').alias('h', 'help')
      .argv
    ;

    cb(null, data || argv._[0], argv);
  }

};

exports.Config = Config;