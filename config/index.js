/**
 * Created by Roman Spiridonov <romars@phystech.edu> on 5/6/2017.
 */
"use strict";

const
  nconf = require('nconf'),
  path = require('path'),

  Config = require('./config').Config,
  appConfig = require('./app'),
  userConfig = require('../.user-config');

exports.config = new Config(appConfig.config, appConfig.defaults);  // default config

// Actual (nconf) config
nconf
  .env()
  .argv()
  .use('literal', userConfig)
  .defaults(exports.config);

exports.nconf = nconf;
