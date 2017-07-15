/**
 * Created by Roman Spiridonov <romars@phystech.edu> on 7/15/2017.
 */
"use strict";

const gulp = require('gulp');

module.exports = function main(userConfig) {
  require('./config')(userConfig);
  require('./gulpfile');
};
