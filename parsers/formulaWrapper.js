"use strict";

const config = require('../config');
const FormulaConverter = require('./formulaConverter').FormulaConverter;
const util = require('util');
const fs = require('fs');
const helpers = require('./helpers');


/**
 * Launches formula converter on a set of files and provides API to integrate it into the framework.
 * Has state.
 * @constructor
 */
function FormulaWrapper(options) {
  FormulaConverter.apply(this, arguments);

  this._formulasMap = new Map();  // map of file names to lists of parsed formulas,
  // e.g. "file.c" -> [{formula: "x^2", startIndex: 0, endIndex: 3}, {formula: "y^2", startIndex: 5, endIndex: 8}]
  this._fileMap = new Map();  // map of file contents
}

util.inherits(FormulaWrapper, FormulaConverter);
FormulaWrapper.prototype.constructor = FormulaWrapper;

/**
 * Load and parse formulas from a specified file.
 * @param {string} file - text string with path to a file
 * @param {function} cb - callback that receives an array of parsed formulas
 */
FormulaWrapper.prototype.parseFile = function (file, cb) {
  fs.readFile(file, {encoding: 'utf-8'}, (err, fileStr) => {
    if(err) {
      cb(err);
      return;
    }
    this.parse(fileStr, (err, parsedFormulas) => {
      if(err) {
        cb(err);
        return;
      }
      this._fileMap.set(file, {contents: fileStr, dest: file});
      this._formulasMap.set(file, parsedFormulas);
      cb(null, parsedFormulas);
    });
  });
};

/**
 * Stores files with converted formulas. Removes successfully saved files from the formula map.
 */
// TODO: specify destination
FormulaWrapper.prototype.storeResults = function () {
  for (let file of this._formulasMap.keys()) {
    let parsedFormulas = this._formulasMap.get(file);
    let preparedFile = this._fileMap.get(file);
    let preparedFileStr = preparedFile.contents;
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
      return parsedFormulas[index++].formula;
    });

    // Add CSS for HTML output inline to file
    if(parsedFormulas[0].css) {
      preparedFileStr += `\n<style>${parsedFormulas[0].css}</style>`;
    }

    // Save prepared file contents to disk
    let dest = preparedFile.dest;
    fs.writeFile(dest, preparedFileStr, {encoding: 'utf-8'}, () => this.clearCache(file));

    // Remove successfully saved file from the map
  }

};


/**
 * Removes specified files from state.
 * @param {Array} files - array of strings which are paths to files.
 */
FormulaWrapper.prototype.clearCache = function (files) {
  if(files.forEach) {
    files.forEach((file) => this._formulasMap.delete(file));
  } else {
    this._formulasMap.delete(files);
  }
};

if (!module.parent) {
  let fw = new FormulaWrapper(config.formula);
  fw.parseFile('src/templates/description.html', (err) => {
    if(err) throw err;
    fw.storeResults();
  });
} else {
  module.exports = (options) => new FormulaWrapper(options);
}
