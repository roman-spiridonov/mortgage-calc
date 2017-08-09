/**
 * Created by Roman Spiridonov <romars@phystech.edu> on 5/6/2017.
 */
"use strict";

const
  nconf = require('nconf'),
  path = require('path'),

  Config = require('./config').Config,
  appConfig = require('./app');

let config = new Config(appConfig.config, appConfig.defaults);

nconf
  .env()
  .argv()
  .defaults(config);

module.exports = function config(userConfig) {
  nconf.use('literal', userConfig);
};
module.exports.nconf = nconf;
module.exports.config = config;  // default config
