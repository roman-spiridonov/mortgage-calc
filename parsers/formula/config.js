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
    mathjax: {
      tex2jax: {
        inlineMath: [ ['$','$'], ["\\(","\\)"] ],
        displayMath: [ ['$$','$$'], ["\\[","\\]"] ],
        processEscapes: true
      }
    },
    delims: ["\\$\\$", "<math>"],
    output: "mml",
    linebreaks: false
  },
  meta: {
    formula: {
      mathjax: {
        tex2jax: {
          inlineMath: {
            desc: 'Delimeters that define inline formulas',
            type: 'string'
          },
          displayMath: {
            desc: 'Delimeters that define display formulas (on separate line)',
            type: 'string'
          },
          processEscapes: {
            desc: 'Trigger math conversion on escaped dollar signs, i.e. when faced with a \\$ instead of an $',
            type: 'boolean'
          }
        }
      },
      delims: {
        desc: "Formula delimeters in an input string",
        type: "array"
      },
      input: {
        alias: "i",
        desc: "Input formula format",
        type: "string",
      },
      output: {
        alias: "o",
        desc: "Output formula format",
        type: "string",
      },
      linebreaks: {
        desc: "Perform automatic line-breaking",
        type: "boolean",
      }
    }
  }
};

config.add(overrides, defaults);

module.exports = config;