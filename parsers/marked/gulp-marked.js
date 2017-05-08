/**
 * Created by Roman Spiridonov <romars@phystech.edu> on 5/8/2017.
 */
"use strict";

const MarkedConverter = require('./markedConverter').MarkedConverter;

module.exports = require('../gulpPluginFabric')(MarkedConverter);
