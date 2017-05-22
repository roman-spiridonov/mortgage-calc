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
  serveFromSrc: false,
  isDevelopment: true,
  entryPoints: ['script.js', 'fragments/*.js'],
  vendors: {
    "jquery": "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js",
    "bootstrap": "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js",
    "mathjax": "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1/MathJax.js?config=TeX-MML-AM_CHTML"
  },
  globals: { jquery: '$' },
  isCDN: false,
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
    serveFromSrc: {
      desc: "if true, the static server will run on src/ folder in development mode (use when your code does not need transpiling)",
      type: "boolean"
    },
    isDevelopment: {
      desc: "if false, runs in production mode (may affect gulp tasks)",
      type: "boolean"
    },
    entryPoints: {
      desc: "paths relative to src to entry points of application",
      type: "array"
    },
    vendors: {
      desc: "map of contained vendor libraries (npm installed) to CDN links",
      type: "array"
    },
    globals: {
      desc: "Object that maps dependencies (package names) to the exported global variables in CDN build",
      type: "object"
    },
    isCDN: {
      desc: "true if the result of the build should contain CDN libraries",
      type: "boolean"
    }
  }
};


exports.config = config;
exports.defaults = defaults;
