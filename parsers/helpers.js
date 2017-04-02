"use strict";

function Helpers() {

}

/**
 * Add new characters to a string at a specific index, removing some other characters.
 *
 * @param {String} string - source string
 * @param {number} start - index starting at which new characters will be inserted
 * @param {number} delCount - the number of old chars to remove
 * @param {string} newSubStr - the string to insert
 * @return {string} - a resulting string with the inserted substring
 */
Helpers.prototype.spliceString = function(string, start, delCount, newSubStr) {
  return string.slice(0, start) + newSubStr + string.slice(start + Math.abs(delCount));
};

module.exports = new Helpers();