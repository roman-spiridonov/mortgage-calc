"use strict";

const util = require('util');
const EventEmitter = require('events').EventEmitter;
const mjAPI = require("mathjax-node");
const config = require('../config');
const helpers = require('./helpers');


/**
 * @typedef {Object} FormulaConverter~options
 * @property {Object} mathjax - set of standard MathJax options
 * @property {string[]} delims - an array of formula delimeters (e.g. "$$", "<math>").
 * If delimeter is a tag "<*>", converter considers that it should be properly closed with "</*>"
 * @property {string} output - desired output formula format (e.g. "svg")
 */

/**
 * Formula Converter provides API to parse formulas from the provided strings and convert them to other formats.
 * The module is a wrapper around MathJax-node.
 * Pure class (no side effects, only options).
 * Supported input formats: TeX.
 * Supported output formats: MathML.
 * @constructor
 * @param {FormulaConverter~options} options
 */

function FormulaConverter(options) {
  this._delims = options.delims || ["\\$\\$"];  // array e.g. ["$$", "<math>"]
  this._re = this._setUpRegExp();  // /\$\$([^$]+)\$\$/ig  // --> $$(f1)$$ ... $$(f2)$$
  this._output = options.output || 'mathml';
  this._linebreaks = options.linebreaks || false;
  this._outstandingHandlers = {};  // counter for outstanding async operations on files
  this._parsedFormulasCache = {};  // keeping state between callbacks
  this._mathjax = options.mathjax || {};

  mjAPI.config({
    MathJax: this._mathjax
  });
  mjAPI.start();

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
 * Returns the formula inside the matched delims.
 * @param matches - array of formula regexp matches
 * @private
 */
FormulaConverter.prototype._getMatchedRegExpGroup = function (matches) {
  for (let i = 1; i < matches.length; i++) {
    if (matches[i] !== undefined) {
      return matches[i];
    }
  }
  return undefined;
};

/**
 * @callback FormulaConverter~parseCallback
 * @param {Error|null} err - returns error as a first argument in case it occurred, null if everything was ok.
 * @param {ParsedFormula[]} [parsedFormula] - array of parsed formulas
 */

/**
 * Given a string, returns parsed formulas from the string to callback.
 * @param {string} fileStr - string with formulas
 * @param {FormulaConverter~parseCallback} cb - callback that receives an array of parsed formulas
 */
FormulaConverter.prototype.parse = function (fileStr, cb) {
  let formula;
  let hash = helpers.hashCode(fileStr).toString();
  this._parsedFormulasCache[hash] = [];
  this._outstandingHandlers[hash] = 0;

  let formulasCount = 0;
  while (formula = this._re.exec(fileStr)) {
    formulasCount++;
    // TODO: extract ParsedFormula class and create an extended instance of it at this point
    let typesetParameter = {
      math: this._getMatchedRegExpGroup(formula),
      format: "TeX", // "inline-TeX", "MathML"
      linebreaks: this._linebreaks,
      state: {  // state can be accessed from callback
        sourceFormula: formula[0],
        startIndex: formula.index,     // start of $$ block to replace
        endIndex: this._re.lastIndex,  // end of $$ block to replace (index immediately after the block)
        hash: hash
      }
    };
    try {
      let prop = this._getOutputProperty();
      if (prop === 'html') {
        typesetParameter.css = true;
      }
      typesetParameter[prop] = true;
    } catch (err) {
      cb(err);
      return;
    }

    mjAPI.typeset(typesetParameter, this._collectMath.bind(this));
    this._outstandingHandlers[hash]++;
  }

  // when all formulas are parsed, relies on ready event internally to invoke the cb
  if (formulasCount > 0) {
    this.once('ready:' + hash, (parsedFormulas) => {
      delete this._parsedFormulasCache[hash];  // clear cache
      delete this._outstandingHandlers[hash];
      cb(null, parsedFormulas);
    });
  } else {
    cb(new Error("The string contains no formulas"));
  }
};

/**
 * Updates parsed formulas cache in an object. To be used as a callback to mjAPI.typset function.
 * @param {Object} mjData - result of MathJax formula parsing
 * @param {Object} options - initial options for MathJax parsing; state is saved in options.state
 * @fires FormulaConverter#ready - indicates that parsing has been complete
 */
FormulaConverter.prototype._collectMath = function (mjData, options) {
  let hash = options.state.hash;
  if (mjData.errors) {
    console.error(mjData.errors);
    this._outstandingHandlers[hash]--;
    return;
  }
  /**
   * @name ParsedFormula
   * @type Object
   * @proprety {string} output - formula format
   * @property {string} sourceFormula - the source formula (including delimeters)
   * @property {string} formula - the converted formula (without delimeters)
   * @property {number} startIndex - the index at which sourceFormula appears in the text
   * @property {number} endIndex - the index immediately after the sourceFormula in the text
   * @property {string} [css] - css string for HTML output
   */

  let prop = this._getOutputProperty();
  let parsedFormula = {
    output: this._output,
    sourceFormula: options.state.sourceFormula,
    formula: mjData[prop],
    startIndex: options.state.startIndex,
    endIndex: options.state.endIndex
  };
  if (prop === 'html') {
    parsedFormula.css = mjData.css;
  }

  this._parsedFormulasCache[hash].push(parsedFormula);

  // Since this call is async, decrease the counter of async operations to make sure all formulas are processed
  this._outstandingHandlers[hash]--;
  /**
   * Ready event.
   * @event FormulaConverter#ready
   * @type {ParsedFormula[]}
   */
  if (this._outstandingHandlers[hash] === 0) {
    this.emit('ready:' + hash, this._parsedFormulasCache[hash]);
  }
};

/**
 * Returns mjAPI property name where formula is stored based on output config setting.
 * @param {string} output - config setting
 * @returns {string}
 * @throws {Error} - when config parameter is not recognized
 * @private
 */
// TODO: handle more configs (png, plain text)
FormulaConverter.prototype._getOutputProperty = function () {
  let res;
  switch (this._output) {
    case 'mml':
    case 'mathml':
      res = 'mml';
      break;
    case 'svg':
      res = 'svg';
      break;
    case 'html':
      res = 'html';
      break;
    default:
      throw new Error(`Unrecognized output parameter '${this._output}'`);
  }

  return res;
};

if (!module.parent) {
  // <cmd> "$$x^2$$ + $$x$$" --input TeX --output MathML
  let argv = require('yargs')
    .demandCommand(1)
    .usage("Usage: $0 [options] \"<your formula>\" > file", config.getMetaYargsObj([
      'formula.input',
      'formula.output',
      'formula.delims',
      'formula.linebreaks']))
    .example("$0 \"x^2\" -i TeX -o svg")
    .example("cat file1 | $0 -i TeX > file2")
    .alias('f', 'file').alias('o', 'output').alias('i', 'input')
    .help('h')
    .alias('h', 'help')
    .epilog('copyright 2017')
    .argv
  ;

  let options = config.getOptionsObj(argv, "formula");

  let fc = new FormulaConverter(options);
  fc.parse(argv._[0], (err, parsedFormulas) => {
    if (err) throw err;
    console.log(parsedFormulas);
  });

} else {
  exports.FormulaConverter = FormulaConverter;
}
