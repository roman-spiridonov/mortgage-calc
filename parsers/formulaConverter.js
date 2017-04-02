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

function FormulaConverter() {
  this._outstandingHandlers = 0;  // counter for outstanding async operations on files
  this._delims = config.formula.delims || ["\\$\\$"];  // array e.g. ["$$", "<math>"]
  this._formulasMap = new Map();  // map of file names to lists of parsed formulas,
  // e.g. "file.c" -> [{formula: "x^2", startIndex: 0, endIndex: 3}, {formula: "y^2", startIndex: 5, endIndex: 8}]
  this._fileMap = new Map();  // map of file contents

  this._re = (() => {  // /\$\$([^$]+)\$\$/ig  // --> $$(f1)$$ ... $$(f2)$$
    let regexp = new RegExp();
    this._delims.forEach((delim, index) => {
      let closingChar = delim.charAt(delim.search(/[^\\]/));
      let closingChars = closingChar === '<' ? '</' + delim.slice(1) : delim;

      // TODO: do not expect escaped chars to be in config
      if(index === 0) {
        regexp = new RegExp(delim + `([^${closingChar}]*)` + closingChars, "ig");
      } else if(index === 1) {
        regexp = new RegExp(`(?:${regexp.source}|` + delim + `([^${closingChar}]*)` + closingChars + ')', "ig");
      } else {
        regexp = new RegExp(`(?:${regexp.source.slice(0,-2)}|` + delim + `([^${closingChar}]*)` + closingChars + ')', "ig");
      }
    });
    return regexp;
  })();
}

util.inherits(FormulaConverter, EventEmitter);
FormulaConverter.prototype.constructor = FormulaConverter;

/**
 * Retrieve formulas from a specified file.
 * @param file - text string with path to a file
 */
FormulaConverter.prototype.parseMath = function(file) {
  this._outstandingHandlers = 0;
  this._formulasMap.set(file, []);
  let fileStr = fs.readFileSync(file, {encoding: 'utf-8'});
  this._fileMap.set(file, {contents: fileStr, dest: file});
  let formula;
  while(formula = this._re.exec(fileStr)) {
    mjAPI.typeset({
      math: formula[1],
      format: "TeX", // "inline-TeX", "MathML"
      mml: true,
      state: {
        sourceFormula: formula[0],
        startIndex: formula.index,     // start of $$ block to replace
        endIndex: this._re.lastIndex,  // end of $$ block to replace
        file: file
      }
    }, (mjData, options) => this.collectMath(mjData, options));
    this._outstandingHandlers++;
  }
};

/**
 * Updates parsed formula map in an object.
 * @param {Object} mjData - result of MathJax formula parsing
 * @param {Object} options - initial options for MathJax parsing; state is saved in options.state
 */
FormulaConverter.prototype.collectMath = function(mjData, options) {
    if (mjData.errors) {
      console.error(mjData.errors);
      return;
    }
    this._formulasMap.get(options.state.file).push({
      sourceFormula: options.state.sourceFormula,
      formula: mjData.mml,
      startIndex: options.state.startIndex,
      endIndex: options.state.endIndex
    }); // TODO: handle via config.formula.output

    // Since this call is async, decrease the counter of async operations to make sure all formulas are processed
    this._outstandingHandlers--;
    if(this._outstandingHandlers === 0) this.emit('ready');
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
    fs.writeFileSync(dest, preparedFileStr, {encoding: 'utf-8'});

    // Remove successfully saved file from the map
    this._formulasMap.delete(file);
  }
};


if (!module.parent) {
  let fc = new FormulaConverter();
  fc.parseMath('src/templates/description.html');
  fc.once('ready',() => fc.storeResults());
} else {
  module.exports = FormulaConverter;
}
