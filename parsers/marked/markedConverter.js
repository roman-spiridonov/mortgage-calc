/**
 * Created by Roman Spiridonov <romars@phystech.edu> on 4/28/2017.
 */
"use strict";

const marked = require('marked');
const config = require('./config');
const helpers = require('../../helpers');

function MarkedConverter(options) {
  this._options = {};
  Object.assign(this._options, config.marked);
  this.init(options);
}

const _p = MarkedConverter.prototype;
_p._name = "marked";


_p.init = function (options) {
  helpers.mergeDeep(this._options, options);

  // Add highlighting function if it is enabled
  if (this._options.codeHighlight.enabled) {
    switch (this._options.codeHighlight.library) {
      case 'pygmentize-bundled':
        this._options.highlight = function (code, lang, callback) {
          require('pygmentize-bundled')({lang: lang, format: 'html'}, code, function (err, result) {
            callback(err, result.toString());
          });
        };
        break;

      case 'highlight.js':
        this._options.highlight = function (code) {
          return require('highlight.js').highlightAuto(code).value;
        };
        break;

      default:
        // TODO: add logger and report error message
        this._options.codeHighlight = false;
    }
  }
};

/**
 * Return converted file as a string.
 * @param fileStr {string} - input string
 * @param cb
 */
_p.convert = function (fileStr, cb) {
  let report = {
    converter: this._name
  };
  report.status = "success";

  marked.setOptions(this._options);
  marked(fileStr, (err, content) => {
    if (err) {
      report.status = "fatal";
      report.message = err.message;
    }

    return cb(null, content, report);
  });
};


if (!module.parent) {
  config.runFromCmd('marked', (err, data, argv) => {
    let mc = new MarkedConverter(argv);
    mc.convert(data, (err, preparedFileStr, report) => {
      if (err) throw err;
      console.log(preparedFileStr);
      console.error(report);
    });

  });

} else {
  exports.MarkedConverter = MarkedConverter;
}

