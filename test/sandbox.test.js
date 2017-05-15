/**
 * Created by Roman Spiridonov <romars@phystech.edu> on 4/20/2017.
 */
"use strict";

const
  // Libraries
  path = require('path'),
  expect = require('chai').expect,
  sinon = require('sinon'),

  // Project modules
  mjAPI = require("mathjax-node"),
  mjpage = require("mathjax-node-page").mjpage;

describe("sandbox", function () {
  it.skip("mjpage API", function (done) {
    mjpage("\$\$x\$\$ + \$\$\\frac{x^2+x}{y^3}\$\$", {
      format: ["TeX"],
      tex: {
        processEscapes: false
      },
      singleDollars: true,
      fragment: false
    }, {
      html: true,
      css: true,
      equationNumbers: "all"
    }, function (data) {
      console.log(data);
      done();
    });
  });
});
