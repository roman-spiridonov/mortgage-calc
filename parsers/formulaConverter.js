"use strict";

const fs = require('fs');
const async = require('async');
const util = require('util');
const EventEmitter = require('events').EventEmitter;
const config = require('../config');
const helpers = require('./helpers');

const mjAPI = require("mathjax-node");
mjAPI.config({
  MathJax: config.formula.mathjax
});
mjAPI.start();

/**
 * Formula Converter provides API to parse formulas from the provided strings and convert them to other formats.
 * The module is a wrapper around MathJax-node.
 * Supported input formats: TeX.
 * Supported output formats: MathML.
 * @constructor
 */
function FormulaConverter() {
  this._outstandingHandlers = 0;  // counter for outstanding async operations on files
  this._delims = config.formula.delims || ["\\$\\$"];  // array e.g. ["$$", "<math>"]
  this._formulasMap = new Map();  // map of file names to lists of parsed formulas,
  // e.g. "file.c" -> [{formula: "x^2", startIndex: 0, endIndex: 3}, {formula: "y^2", startIndex: 5, endIndex: 8}]
  this._fileMap = new Map();  // map of file contents

  this._re = this._setUpRegExp();  // /\$\$([^$]+)\$\$/ig  // --> $$(f1)$$ ... $$(f2)$$
}

util.inherits(FormulaConverter, EventEmitter);
FormulaConverter.prototype.constructor = FormulaConverter;

FormulaConverter.prototype._setUpRegExp = function () {
  let regexp = new RegExp();
  this._delims.forEach((delim, index) => {
    let closingChar = delim.charAt(delim.search(/[^\\]/));
    let closingChars = closingChar === '<' ? '</' + delim.slice(1) : delim;

    // TODO: do not expect escaped chars to be in config
    if (index === 0) {
      regexp = new RegExp(delim + `([^${closingChar}]*)` + closingChars, "ig");
    } else if (index === 1) {
      regexp = new RegExp(`(?:${regexp.source}|` + delim + `([^${closingChar}]*)` + closingChars + ')', "ig");
    } else {
      regexp = new RegExp(`(?:${regexp.source.slice(0, -2)}|` + delim + `([^${closingChar}]*)` + closingChars + ')', "ig");
    }
  });
  return regexp;
};

/**
 * Load and parse formulas from a specified file.
 * @param {string} file - text string with path to a file
 * @param {function} cb - callback that receives an array of parsed formulas
 */
FormulaConverter.prototype.parseFile = function (file, cb) {
  this._outstandingHandlers = 0;
  this._formulasMap.set(file, []);
  fs.readFile(file, {encoding: 'utf-8'}, (fileStr) => {
    this._fileMap.set(file, {contents: fileStr, dest: file});
    this.parse(fileStr, (parsedFormulas) => {
      this._formulasMap.get(file).push(parsedFormulas);
      cb(parsedFormulas);
    });
  });
};


/**
 * @callback FormulaConverter~parseCallback
 * @param {ParsedFormula[]} - array of parsed formulas
 */

/**
 * @function
 * Given a string, returns parsed formulas from the string to callback.
 * @param {string} fileStr - string with formulas
 * @param {FormulaConverter~parseCallback} cb - callback that receives an array of parsed formulas
 */
FormulaConverter.prototype.parse = function (fileStr, cb) {
  let formula;
  this._parsedFormulasCache = [];  // keeping state between callbacks

  while (formula = this._re.exec(fileStr)) {
    mjAPI.typeset({
      math: formula[1],
      format: "TeX", // "inline-TeX", "MathML"
      mml: true,
      state: {  // state can be accessed from callback
        sourceFormula: formula[0],
        startIndex: formula.index,     // start of $$ block to replace
        endIndex: this._re.lastIndex,  // end of $$ block to replace (index immediately after the block)
      }
    }, this._collectMath);
    this._outstandingHandlers++;
  }

  // when all formulas are parsed, relies on ready event internally to invoke the cb
  this.once('ready', (parsedFormulas) => {
    delete this._parsedFormulasCache;  // clear cache
    cb(parsedFormulas);
  });
};
/**
 * Updates parsed formula map in an object. To be used as a callback to mjAPI.typset function.
 * @param {Object} mjData - result of MathJax formula parsing
 * @param {Object} options - initial options for MathJax parsing; state is saved in options.state
 * @fires FormulaConverter#ready - indicates that parsing has been complete
 */
FormulaConverter.prototype._collectMath = function (mjData, options) {
  if (mjData.errors) {
    console.error(mjData.errors);
    this._outstandingHandlers--;
    return;
  }
  let parsedFormulas = this._parsedFormulasCache;
  /**
   * @name ParsedFormula
   * @type Object
   * @property {string} sourceFormula - the source formula (including delimeters)
   * @property {string} formula - the converted formula (without delimeters)
   * @property {number} startIndex - the index at which sourceFormula appears in the text
   * @property {number} endIndex - the index immediately after the sourceFormula in the text
   */
  parsedFormulas.push({
    sourceFormula: options.state.sourceFormula,
    formula: mjData.mml,
    startIndex: options.state.startIndex,
    endIndex: options.state.endIndex
  }); // TODO: handle via config.formula.output

  // Since this call is async, decrease the counter of async operations to make sure all formulas are processed
  this._outstandingHandlers--;
  /**
   * Ready event.
   * @event FormulaConverter#ready
   * @type {ParsedFormula[]}
   */
  if (this._outstandingHandlers === 0) this.emit('ready', parsedFormulas);
};


/**
 * Stores files with converted formulas. Removes successfully saved files from the formula map.
 */
// TODO: specify destination
FormulaConverter.prototype.storeResults = function () {
  for (let file of this._formulasMap.keys()) {
    let preparedFileStr = this._fileMap.get(file).contents;
    // Prepare file string for saving
    // // Way 1: manipulate string using stored indices
    // let accumulatedShift = 0;  // initial formula insertion indices change as we change the string in cycle
    // this._formulasMap.get(file).forEach((el) => {
    //   preparedFileStr = helpers.spliceString(preparedFileStr, accumulatedShift + el.startIndex, el.endIndex - el.startIndex, el.formula);
    //   accumulatedShift += el.formula.length - el.sourceFormula.length; // new indices must be shifted after splicing the new formula string
    // });

    // Way 2: rely on the fact that the consecutive order of formulas have not changed
    let index = 0;
    preparedFileStr = preparedFileStr.replace(this._re, (str, p, offset) => {
      return this._formulasMap.get(file)[index++].formula;
    });

    // Save prepared file contents to disk
    let dest = this._fileMap.get(file).dest;
    fs.writeFile(dest, preparedFileStr, {encoding: 'utf-8'}, () => this.clearCache(file));

    // Remove successfully saved file from the map
  }

};


/**
 * Removes specified files from state.
 * @param {Array} files - array of strings which are paths to files.
 */
FormulaConverter.prototype.clearCache = function (files) {
  if(files.forEach) {
    files.forEach((file) => this._formulasMap.delete(file));
  } else {
    this._formulasMap.delete(files);
  }
};


if (!module.parent) {
  let fc = new FormulaConverter();
  fc.parseFile('src/templates/description.html', () => fc.storeResults());
} else {
  module.exports = FormulaConverter;
}
