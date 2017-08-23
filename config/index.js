/**
 * Created by Roman Spiridonov <romars@phystech.edu> on 5/6/2017.
 */
"use strict";

const
  nconf = require('nconf'),

  Config = require('yargs-config').Config,
  appConfig = require('./app');

let config = new Config(appConfig.config, appConfig.defaults);

nconf
  .env()
  .argv()
  .defaults(config);

module.exports.nconf = nconf;
module.exports.config = config;  // default config
