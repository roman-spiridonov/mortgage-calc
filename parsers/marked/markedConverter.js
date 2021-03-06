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
  // doctype gets encoded fix: https://github.com/chjj/marked/issues/354
  let regex = /^(<\!DOCTYPE[^<]*)/i,
      matches = fileStr.match(regex),
      hasDoctype = !!matches,
      doctype = hasDoctype ? matches[0] : "";
  fileStr = fileStr.replace(regex, "");

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

    let output = hasDoctype ? content : doctype + content;

    // HACKS
    output = output.replace(/\\left{/g, "\\left\\{");
    output = output.replace(/(\\)(\s)/g, "$1$1$2");
    // output = output.replace(/($$[\s\S]*?)(\\)(\s[\s\S]*?$$)/g, "$1$2$2$3");

    return cb(null, output, report);
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

