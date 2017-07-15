#!/usr/bin/env node

/* eslint no-console:off */

/**
 * Created by Roman Spiridonov <romars@phystech.edu> on 7/15/2017.
 */
"use strict";

const gulp = require('gulp');
require('../index.js')();

process.once("uncaughtException", err => {
  console.log("\nuncaughtException: Something went wrong!\n");
  console.log(err.message);
  console.log(err.stack);
  process.exitCode = 1;
});

gulp.series(process.argv[1] || 'default');
