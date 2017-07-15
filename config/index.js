/**
 * Created by Roman Spiridonov <romars@phystech.edu> on 5/6/2017.
 */
"use strict";

const
  nconf = require('nconf'),
  path = require('path'),

  Config = require('./config').Config,
  appConfig = require('./app');

module.exports = function config(userConfig) {
  return nconf
    .env()
    .argv()
    .use('literal', userConfig)
    .defaults(exports.config);
};

module.exports.nconf = nconf;
module.exports.config = new Config(appConfig.config, appConfig.defaults);  // default config