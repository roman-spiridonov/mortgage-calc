/**
 * Created by Roman Spiridonov <romars@phystech.edu> on 5/8/2017.
 */
"use strict";

const FormulaConverter = require('./formulaConverter').FormulaConverter;

let fc = new FormulaConverter();
module.exports = require('gulp-plugin-fabric')(fc._name, fc.convert.bind(fc), fc.init.bind(fc));
