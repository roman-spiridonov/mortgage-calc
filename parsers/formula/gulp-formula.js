/**
 * Created by Roman Spiridonov <romars@phystech.edu> on 5/8/2017.
 */
"use strict";

const FormulaConverter = require('./formulaConverter').FormulaConverter;

module.exports = require('../gulpPluginFabric')(FormulaConverter);
