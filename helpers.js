/*jshint bitwise: false*/
"use strict";

const fs = require("fs");

function Helpers() {

}

const _p = Helpers.prototype;

/**
 * Add new characters to a string at a specific index, removing some other characters.
 *
 * @param {String} string - source string
 * @param {number} start - index starting at which new characters will be inserted
 * @param {number} delCount - the number of old chars to remove
 * @param {string} newSubStr - the string to insert
 * @return {string} - a resulting string with the inserted substring
 */
_p.spliceString = function (string, start, delCount, newSubStr) {
  return string.slice(0, start) + newSubStr + string.slice(start + Math.abs(delCount));
};

_p.hashCode = function (str) {
  if (str.length === 0) {
    return 0;
  }

  let hash = 0,
    i, chr;
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

_p.isObject = function (item) {
  return (item && typeof item === 'object' && !Array.isArray(item) && item !== null);
};

/**
 * Mutable merge of nested objects.
 * Supports skipping of keys using skipFunc callback.
 * @param target {object}
 * @param [skipFunc] {function} - callback that gets current target and source properties and returns true if this copy operation should be skipped.
 * Note that target property can be undefined if it is a new property for target.
 * @param sources - comma-separated objects
 * @returns {*}
 */
_p.mergeDeep = function (target, skipFunc, ...sources) {
  let hasSkipFunction = true;
  if (skipFunc && (typeof skipFunc !== 'function')) {
    // first source is in place of skipFunc
    sources.unshift(skipFunc);
    hasSkipFunction = false;
  }
  if (!sources.length) return target;
  const source = sources.shift();

  if (this.isObject(target) && this.isObject(source)) {
    for (const key in source) {
      if (hasSkipFunction && skipFunc(target[key], source[key])) continue;  // skip if necessary

      if (this.isObject(source[key])) {
        if (!target[key]) Object.assign(target, {[key]: {}});
        hasSkipFunction ? this.mergeDeep(target[key], skipFunc, source[key]) : this.mergeDeep(target[key], source[key]);
      } else if (source[key] !== undefined) {  // do not copy undefined values
        Object.assign(target, {[key]: source[key]});
      }
    }
  }

  return this.mergeDeep(target, ...sources);
};


/**
 * Returns plain version of an object, where each nested key is converted to "deep.nested.key": value.
 * @param target {object}
 * @param [condition] {function} - optional function that takes current key and returns true if key needs to be plainified (false, otherwise).
 * By default, all keys will be plainified.
 */
_p.plainify = function (target, condition) {
  let [objectName, parent, parentKeys, mutate] = [].slice.call(arguments, 2);
  let res = mutate ? target : this.mergeDeep({}, target);
  let keys = Object.keys(res);

  for (let key of keys) {
    if (this.isObject(res[key]) && (!condition || !condition(res[key]))) {
      this.plainify(res[key], condition, key, res, keys, true);
      // moved all properties to parent, can remove empty object
      delete res[key];
    } else if (!parent) {
      // simply wrap into default
      res[key] = res[key];
    } else {
      // move property to parent (in addition to wrapping into default)
      let nestedKey = [objectName, key].join('.');
      parent[nestedKey] = res[key];
      parentKeys.push(nestedKey);
      delete res[key];
    }
  }

  return res;
};

_p.createDir = function (dir, cb) {
  fs.exists(dir, (exists) => {
    if (!exists) return fs.mkdir(dir, cb);
    cb(null);
  });
};

_p.removeDirIfEmptySync = function (dirname) {
  try {
    let files = fs.readdirSync(dirname);
    if (!files.length) {
      fs.rmdirSync(dirname);
    }
  } catch (e) {
    throw e;
  }
};


module.exports = new Helpers();