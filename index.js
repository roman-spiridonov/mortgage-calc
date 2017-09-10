/**
 * Created by Roman Spiridonov <romars@phystech.edu> on 7/15/2017.
 */
"use strict";

const gulp = require('gulp');
const nconf = require('./config').nconf;

module.exports = function main(userConfig) {
  nconf.use('literal', userConfig);
  require('./gulpfile');
};
