/**
 * Created by Roman Spiridonov <romars@phystech.edu> on 5/6/2017.
 */
"use strict";

let config = {
  // Override defaults here

};

let defaults = {
  src: "src",
  dest: "webapp",
  port: 8080,
  isDevelopment: false,
  mainScriptBlockLabel: "main",
  subordinateScriptBlockLabel: "sub"
};


exports.config = config;
exports.defaults = defaults;
