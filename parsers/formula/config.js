/**
 * Default configuration for formula converter.
 */
"use strict";

const config = require('../../config').config;

let overrides = {
  // Override defaults here

};

let defaults = {
  formula: {
    mathjax: {},
    delims: ["\\$\\$", "<math>"],
    output: "mathml",
    linebreaks: false
  },

  meta: {
    formula: {
      mathjax: {},
      delims: {
        desc: "Formula delimeters in an input string",
        type: "array"
      },
      input: {
        alias: "i",
        desc: "Input formula format",
        type: "string"
      },
      output: {
        alias: "o",
        desc: "Output formula format",
        type: "string"
      },
      linebreaks: {
        desc: "Perform automatic line-breaking",
        type: "boolean"
      }
    }
  }
};

config.add(overrides, defaults);

module.exports = config;