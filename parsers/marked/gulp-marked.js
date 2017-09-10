/**
 * Created by Roman Spiridonov <romars@phystech.edu> on 5/8/2017.
 */
"use strict";

const MarkedConverter = require('./markedConverter').MarkedConverter;

let mc = new MarkedConverter();
module.exports = require('gulp-plugin-fabric')(mc._name, (str, options, cb) => mc.convert(str, cb), mc.init.bind(mc));
