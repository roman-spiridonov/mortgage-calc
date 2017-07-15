/**
 * Created by Roman Spiridonov <romars@phystech.edu> on 7/15/2017.
 */
"use strict";

const run = require('../index.js');

process.once("uncaughtException", err => {
  console.log("\nuncaughtException: Something went wrong!\n");
  console.log(err.message);
  console.log(err.stack);
  process.exitCode = 1;
});

run(process.argv[1]);