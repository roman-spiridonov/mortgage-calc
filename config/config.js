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
  return this._getPropRef(propStr, target.meta);
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
_p._getPropRef = function(propStr, target = this) {
  if(propStr === null || propStr === '') {
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


exports.Config = Config;