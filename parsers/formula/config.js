"use strict";

let config = {
  // Override defaults here

};

let defaults = {
  src: "src",
  dest: "webapp",
  port: 8080,
  isDevelopment: false,
  mainScriptBlockLabel: "main",
  subordinateScriptBlockLabel: "sub",
  formula: {
    mathjax: {},
    delims: ["\\$\\$", "<math>"],
    output: "mml"
  },

  meta: {
    formula: {
      mathjax: {},
      delims: {
        desc: "Formula delimeters in an input string",
        type: "Array"
      },
      input: {
        desc: "Input formula format",
        type: "string"
      },
      output: {
        desc: "Output formula format",
        type: "string"
      },
      linebreaks: {
        desc: "Perform automatic line-breaking",
        type: "boolean"
      }
    }
  }
};


function Config(config, defaults) {
  Object.assign(this, defaults, config);
  this._defaults = defaults;
}

/**
 * Get the default value of a property in a format like "formula.output".
 */
Config.prototype.getDefault = function (propStr) {
  return _getPropRef(propStr, this._defaults);
};

/**
 * Parse meta information for a config property in a format like "formula.output" and return its ref.
 */
Config.prototype.getMeta = function (propStr) {
  return _getPropRef(propStr, this.meta);
};

/**
 * Get description of the config property (help).
 */
Config.prototype.getDesc = function (prop) {
  let meta = this.getMeta(prop);
  if(!meta || !meta.desc) {
    return "No description available";
  }
  return meta.desc;
};

/**
 * Get type of the config property as a string (help).
 */
Config.prototype.getType = function (prop) {
  let meta = this.getMeta(prop);
  if(!meta || !meta.type) {
    return "No type information available";
  }
  return meta.type;
};

/**
 * Get the meta object in a format suitable for usage() function of yargs library.
 * @param {string[]} propStrs - list of properties.
 */
Config.prototype.getMetaYargsObj = function (propStrs) {
  let res = {};
  propStrs.forEach((propStr) => {
    let prop = propStr.split('.').slice(-1)[0];  // rightmost word after "."
    res[prop] = {};
    res[prop].desc = this.getDesc(propStr);
    res[prop].type = this.getType(propStr);
    res[prop].default = this.getDefault(propStr);
  });

  return res;
};

/**
 * Returns options object stored in one of the properties of another object.
 * Useful for generating options object when creating command-line apps (with libraries like yargs).
 * @param {Object} obj - object that contains option values, among other options
 * @param {string} rootStr - root where to look for options (e.g. 'formula')
 */
Config.prototype.getOptionsObj = function (obj, rootStr) {
  let options = {};
  for (let key in obj) {
    if(obj[key]) {
      let root = _getPropRef(rootStr || "", this);
      if (key in root) {
        options[key] = root[key];
      }
    }
  }

  return options;
};

/**
 * Parse config property in a format like "formula.output" and return prop ref.
 * @param {string} propStr - Reference to a property as a "." delimited string
 * @param {Object} target - Object to look at
 */
function _getPropRef (propStr, target) {
  let interimProps = propStr.split('.');
  let res = target;
  for(let i=0; i<interimProps.length; i++) {
    let prop = interimProps[i];
    if (i===0) {
      res = target[prop];
      continue;
    }
    res = res[prop];
  }

  return res;
}


module.exports = new Config(config, defaults);