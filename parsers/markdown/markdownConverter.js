/**
 * Created by Roman Spiridonov <romars@phystech.edu> on 4/28/2017.
 */
"use strict";

const marked = require('marked');
const pygmetize = require('pygmentize-bundled');

function MarkdownConverter(options) {
  Object.assign(this, options);
  if (this.codeHighlight) {
    this.highlight = function (code, lang, callback) {
      pygmetize({lang: lang, format: 'html'}, code, function (err, result) {
        callback(err, result.toString());
      });
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

