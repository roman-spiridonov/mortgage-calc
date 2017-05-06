/*jshint bitwise: false*/
"use strict";

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
 * Immutable merge of nested objects.
 * See http://stackoverflow.com/a/37164538.
 * @param target {object}
 * @param source {object}
 * @returns {*}
 */
_p.mergeDeep = function (target, ...sources) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (this.isObject(target) && this.isObject(source)) {
    for (const key in source) {
      if (this.isObject(source[key])) {
        if (!target[key]) Object.assign(target, {[key]: {}});
        this.mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, {[key]: source[key]});
      }
    }
  }

  return this.mergeDeep(target, ...sources);
};

module.exports = new Helpers();