/**
 * Created by Roman Spiridonov <romars@phystech.edu> on 5/6/2017.
 */
"use strict";

const Config = require('./config').Config;
let appConfig = require('./app');

exports.config = new Config(appConfig.config, appConfig.defaults);
