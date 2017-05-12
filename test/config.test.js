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

describe("Config", function () {
  let overrides = {};

  let defaults = {
    foo: 'bar',
    nested: {
      nested: {
        foo: 'bar',
        array: [1, 2]
      },
      foo: 'bar'
    },

    meta: {
      foo: {desc: 'Some description', type: 'string', alias: 'f'},
      nested: {
        foo: {desc: 'Some description', type: 'string'},
        nested: {
          foo: {desc: 'Some description', type: 'string'},
          array: {desc: 'Some description', type: 'array', alias: 'a'}
        }
      }
    }
  };

  describe("Construction and initialization", function () {
    it("creates new config properly using constructor", function () {
      let config = new Config(
        {
          port: 8080,
          formula: {
            delims: ["<math>"],
            output: "mml"
          }
        },
        {
          port: 8000,
          delims: ["\\$\\$"],
          formula: {
            input: "TeX"
          }
        });
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

    it("returns correct property based on reference string", function () {
      let config = new Config(overrides, defaults);
      expect(config._getPropRef('nested.foo')).to.equal('bar');
      expect(config._getPropRef('nested', config.meta)).to.be.an('object')
        .that.eql(defaults.meta.nested);
      expect(config._getPropRef('nested.nested.array', config.meta)).to.eql(defaults.meta.nested.nested.array);
    });
  });

  describe("getMetaYargsObj", function () {
    it("returns part of meta object with parameter descriptions for yargs.usage options", function () {
      let config = new Config(overrides, defaults);
      // expect(config.getMetaYargsObj('nested.nested')).to.eql(defaults.meta.nested.nested);
      expect(config.getMetaYargsObj('')).to.eql({
        foo: {desc: 'Some description', type: 'string', alias: 'f', default: 'bar'},
        'nested.foo': {desc: 'Some description', type: 'string', default: 'bar'},
        'nested.nested.foo': {desc: 'Some description', type: 'string', default: 'bar'},
        'nested.nested.array': {desc: 'Some description', type: 'array', alias: 'a', default: [1, 2]}
      });
    });
  });

  describe("_normalizeMeta", function () {
    it("wraps plain object keys in { default: ... }", function () {
      let testObj = {foo: 'bar', someKey: true, someArray: [1, 2]};
      let res = Config.prototype._normalizeMeta(testObj);
      expect(res).to.eql({foo: {default: 'bar'}, someKey: {default: true}, someArray: {default: [1, 2]}});
      expect(res).to.not.equal(testObj);
    });

    it("does not mutate an object", function () {
      let testObj = {foo: 'bar', someKey: true, someArray: [1, 2]};
      Config.prototype._normalizeMeta(testObj);
      expect(testObj).to.eql({foo: 'bar', someKey: true, someArray: [1, 2]});
    });

    it("makes nested object a plain object with nested keys written as some.nested.key = { default: ... }", function () {
      let testObj = {nested: {foo: 'bar', nested: {foo: [1, 2]}}, foo: 'bar'};
      let res = Config.prototype._normalizeMeta(testObj);
      expect(res).to.eql({
        'nested.foo': {default: 'bar'},
        'nested.nested.foo': {default: [1, 2]},
        'foo': {default: 'bar'}
      });
    });

    it("plainifies meta object properly", function() {
      let testObj = defaults.meta;
      let res = Config.prototype._normalizeMeta(testObj);
      expect(res).to.eql({
        foo: {desc: 'Some description', type: 'string', alias: 'f'},
        'nested.foo': {desc: 'Some description', type: 'string'},
        'nested.nested.foo': {desc: 'Some description', type: 'string'},
        'nested.nested.array': {desc: 'Some description', type: 'array', alias: 'a'}
      });

    })
  });

});
