/**
 * Default configuration for marked converter.
 */
"use strict";

const config = require('../../config').config;

let overrides = {
  // Override defaults here

};

let defaults = {
  marked: {
    codeHighlight: {
      enabled: true,
      library: 'pygmentize-bundled'  // also supported: 'highlight.js'
    },
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: false,
    smartLists: true,
    smartypants: false
  },

  meta: {
    marked: {
      gfm: {
        type: 'boolean',
        desc: "Enable GitHub flavored markdown."
      },
      tables: {
        type: 'boolean',
        desc: "Enable GFM tables. This option requires the gfm option to be true."
      },
      breaks: {
        type: 'boolean',
        desc: 'Enable GFM line breaks. This option requires the gfm option to be true.'
      },
      pedantic: {
        type: 'boolean',
        desc: "Conform to obscure parts of markdown.pl as much as possible. Don't fix any of the original markdown bugs or poor behavior."
      },
      sanitize: {
        type: 'boolean',
        desc: "Sanitize the output. Ignore any HTML that has been input."
      },
      smartLists: {
        type: 'boolean',
        desc: "Use smarter list behavior than the original markdown. May eventually be default with the old behavior moved into pedantic."
      },
      smartypants: {
        type: 'boolean',
        desc: 'Use "smart" typograhic punctuation for things like quotes and dashes.'
      }

    }
  }
};

config.add(overrides, defaults);

module.exports = config;