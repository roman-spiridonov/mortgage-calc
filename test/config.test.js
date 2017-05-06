/**
 * Created by Roman Spiridonov <romars@phystech.edu> on 5/6/2017.
 */
"use strict";

const
  // Libraries
  expect = require('chai').expect,
  sinon = require('sinon');

let
  // Project modules
  Config = require('../config/config').Config;

describe("config", function () {
  let overrides = {
    // Override defaults here

  };

  let defaults = {
    formula: {
      mathjax: {},
      delims: ["\\$\\$", "<math>"],
      output: "mathml",
      linebreaks: false
    },

    meta: {
      formula: {
        mathjax: {},
        delims: {
          desc: "Formula delimeters in an input string",
          type: "Array"
        },
        input: {
          desc: "Input formula format",
          type: "string"
        },
        output: {
          desc: "Output formula format",
          type: "string"
        },
        linebreaks: {
          desc: "Perform automatic line-breaking",
          type: "boolean"
        }
      }
    }
  };

  describe("Construction and initialization", function () {
    let overrides = {
      port: 8080,
      formula: {
        delims: ["<math>"],
        output: "mml"
      }
    };

    let defaults = {
      port: 8000,
      delims: ["\\$\\$"],
      formula: {
        input: "TeX"
      }
    };

    it("creates new config properly using constructor", function () {
      let config = new Config(overrides, defaults);
      expect(config.port).to.equal(8080);
      expect(config._defaults.port).to.equal(8000);
      expect(config).to.have.property('formula').that.is.an('object');
      expect(config.formula.input).to.equal("TeX");
      expect(config.formula.output).to.equal("mml");
      expect(config.formula).to.have.property('delims').that.is.an('array')
        .that.deep.equals(["<math>"]);
    });
  });

  describe("add", function () {
    it("deeply extends config object with new options, overriding old values with new ones", function () {
      it("creates new config properly", function () {
        let config = new Config({}, defaults);
        config.add(overrides);

        expect(config.port).to.equal(8080);
        expect(config._defaults.port).to.equal(8000);
        expect(config).to.have.property('formula').that.is.an('object').that.deep.equals({
          input: "TeX",
          output: "mml",
          delims: ["<math>"]
        });
      });
    })
  });

  describe("_getPropRef", function () {
    it("returns target if the first parameter is null or empty string", function () {
      let config = new Config(overrides, defaults);
      expect(config._getPropRef(null)).to.equal(config);
      expect(config._getPropRef('')).to.equal(config);
      let obj = {test: 'this'};
      expect(config._getPropRef('', obj)).to.equal(obj);
    });

    it("returns correct property based on reference string", function() {
      let config = new Config(overrides, defaults);
      expect(config._getPropRef('formula.output')).to.equal('mathml');
      expect(config._getPropRef('formula', config.meta)).to.be.an('object')
          .that.deep.equals(defaults.meta.formula);
      expect(config._getPropRef('formula.delims', config.meta)).to.deep.equal(defaults.meta.formula.delims);
    });
  });

  describe("getMetaYargsObj", function() {
    it("returns part of meta object with parameter descriptions for yargs.usage options", function() {
      let config = new Config(overrides, defaults);
      expect(config.getMetaYargsObj('formula')).to.deep.equal(defaults.meta.formula);
    })
  })

});