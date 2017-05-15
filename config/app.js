/**
 * Created by Roman Spiridonov <romars@phystech.edu> on 5/6/2017.
 */
"use strict";

let config = {
  // Override defaults here

};

let defaults = {
  src: "src",
  glob: "**/*",
  dest: "webapp",
  converters: ["formula", "marked"],
  port: 8080,
  isDevelopment: false,

  meta: {
    src: {
      desc: "Source folder",
      type: "string"
    },
    glob: {
      desc: "glob to search for",
      type: "string"
    },
    dest: {
      desc: "Destination folder",
      type: "string"
    },
    converters: {
      desc: "list of converters to run (ordered)",
      type: "array"
    },
    port: {
      alias: "p",
      desc: "port to run server on",
      type: "number"
    },
    isDevelopment: {
      desc: "if false, runs in production mode (may affect gulp tasks)",
      type: "boolean"
    },
    mainScriptBlockLabel: {
      desc: `Script tags wrapped into <!-- build:yourLabel -->...<!--endbuild-->, will be concatenated and minified.`,
      type: "string"
    },
    subordinateScriptBlockLabel: {
      desc: `Script tags wrapped into <!-- build:yourLabel -->...<!--endbuild-->, will be removed to avoid duplication after concatenation.`,
      type: "string"
    }
  }
};


exports.config = config;
exports.defaults = defaults;
