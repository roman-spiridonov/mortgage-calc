/**
 * Created by Roman Spiridonov <romars@phystech.edu> on 4/20/2017.
 */
"use strict";

const glob = require('glob');
const async = require('async');

/**
 * Provides public API. Registers and runs individual converters.
 * @constructor
 */
function ConverterManager() {
  this._isRunning = false;
  this._converters = [];
  this._setup = [];
  this._result = [];  // current conversion result
}

const _p = ConverterManager.prototype;

_p.run = function (globStr, cb) {
  if(this._isRunning) {  // prevent concurrent runs on a single instance
    return cb(new Error("Running multiple conversions on a single ConverterManager instance is not allowed."));
  }  
  
  this._isRunning = true;
  this._result = [];

  glob(globStr, (err, filenames) => {
    async.each(filenames, this.runOnFile, (err) => {
      if(err) return cb(err);
      this._isRunning = false;  // unlock for new runs
      cb(null, this._result);
    });
  });

};

_p.runOnFile = function (fileStr, cb) {
  cb(null);
};

_p.setUp = function (options) {
  options.converters.forEach((conv) => {
    this._setup.push(conv);
  });
};


module.exports = new ConverterManager();