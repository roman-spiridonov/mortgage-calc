/**
 * Created by Roman Spiridonov <romars@phystech.edu> on 5/12/2017.
 */
"use strict";

const
  // Libraries
  expect = require('chai').expect,
  sinon = require('sinon');

let
  // Project modules
  helpers = require('../helpers');

describe("Helpers", function () {
  describe("plainify", function () {
    it("does not mutate an object", function () {
      let testObj = {foo: 'bar', someKey: true, someArray: [1, 2]};
      helpers.plainify(testObj);
      expect(testObj).to.eql({foo: 'bar', someKey: true, someArray: [1, 2]});
    });

    it("makes nested object a plain object with nested keys written as some.nested.key = value", function () {
      let testObj = {nested: {foo: 'bar', nested: {foo: [1, 2]}}, foo: 'bar'};
      let res = helpers.plainify(testObj);
      expect(res).to.eql({
        'nested.foo': 'bar',
        'nested.nested.foo': [1, 2],
        'foo': 'bar'
      });
      expect(res).to.not.equal(testObj);
    });

    it("does not plainify nested objects that satisfy a condition passed as a second parameter", function () {
      let testObj = {
        key: {desc: "description", type: "number", default: 5},
        nested: {key: {desc: "description", type: "boolean", default: true}, foo: 'bar', plainKey: {type: "boolean"}}
      };
      let res = helpers.plainify(testObj, (prop) => {
        return !!(prop.desc && prop.type);
      });
      expect(res).to.eql({
        'nested.foo': 'bar',
        'nested.plainKey.type': 'boolean',
        'nested.key': {desc: "description", type: "boolean", default: true},
        'key': {desc: "description", type: "number", default: 5}
      });
      expect(res).to.not.equal(testObj);
    });
  });

  describe("mergeDeep", function () {
    it("merges deeply nested objects and mutates the source object", function () {
      let testObj = {a: 1, nested: {nested: {foo: 'bar'}, foo: 'bar'}};
      let mergedObj = {a: 2, b: 1, nested: {foo: 'new bar', nested: {newfoo: 'bar'}}};
      let res = helpers.mergeDeep(testObj, mergedObj);
      expect(res).to.equal(testObj);
      expect(testObj).to.eql({
        a: 2,
        b: 1,
        nested: {foo: 'new bar', nested: {foo: 'bar', newfoo: 'bar'}}
      });
    });

    it("can skip copying properties which are undefined on target by calling proper callback", function () {
      let testObj = {a: 1, nested: {nested: {foo: 'bar'}, foo: 'bar'}};
      let mergedObj = {a: 2, b: 1, nested: {foo: 'new bar', nested: {newfoo: 'bar'}}};
      helpers.mergeDeep(testObj, (targetProp) => (targetProp === undefined), mergedObj);
      // new props should not be created - only existing props are to be updated
      expect(testObj).to.eql({
        a: 2,
        nested: {foo: 'new bar', nested: {foo: 'bar'}},
      });

    });
  });
});
