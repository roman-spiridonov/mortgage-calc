/**
 * Created by Roman Spiridonov <romars@phystech.edu> on 4/28/2017.
 */
"use strict";

const marked = require('marked');
const config = require('./config');
const helpers = require('../../helpers');

function MarkdownConverter(options) {
  helpers.mergeDeep(this, config.marked, options);

  // Add highlighting function if it is enabled
  if (this.codeHighlight.enabled) {
    switch (this.codeHighlight.library) {
      case 'pygmentize-bundled':
        this.highlight = function (code, lang, callback) {
          require('pygmentize-bundled')({lang: lang, format: 'html'}, code, function (err, result) {
            callback(err, result.toString());
          });
        };
        break;

      case 'highlight.js':
        this.highlight = function (code) {
          return require('highlight.js').highlightAuto(code).value;
        };
        break;

      default:
        // TODO: add logger and report error message
        this.enabled = false;
    }
  }
}

const _p = MarkdownConverter.prototype;
_p._name = "markdown";


/**
 * Return converted file as a string.
 * @param fileStr {string} - input string
 * @param cb
 */
_p.convert = function (fileStr, cb) {
  marked.setOptions(this);
  marked(fileStr, cb);
};


if (!module.parent) {
  // <cmd> "#Heading"

} else {
  exports.MarkdownConverter = MarkdownConverter;
}

