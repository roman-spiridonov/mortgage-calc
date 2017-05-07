"use strict";

const
  // Libraries
  expect = require('chai').expect,
  sinon = require('sinon'),

  // Project modules
  MarkedConverter = require('../parsers/marked/markedConverter').MarkedConverter;

describe("MarkedConverter", function () {
  describe("convert", function () {

    it("saves marked settings to the converter instance", function() {
      let mc = new MarkedConverter({codeHighlight: {enabled: true}, smartLists: true, sanitize: false, gfm: true, tables: true});
      expect(mc).to.contain.all.keys('smartLists', 'sanitize', 'gfm', 'tables', 'highlight');
      expect(typeof(mc.highlight)).to.equal('function');
      expect(mc.gfm).to.be.true;
    });

    it("converts empty markdown string to empty html", function (done) {
      let mc = new MarkedConverter();
      mc.convert("", (err, result) => {
        expect(err).to.be.null;
        expect(result).to.equal("");
        done();
      });
    });

    it("converts simple markdown string to html", function (done) {
      let mc = new MarkedConverter();
      const input = "# Heading\n\nSome Text";
      mc.convert(input, (err, result, report) => {
        expect(err).to.be.null;
        expect(result).to.match(/<h1[\s\S]*>\s*Heading\s*<\/h1>\s*<p>\s*Some\s*Text\s*<\/p>/);
        expect(report).to.deep.equal({
          converter: "marked",
          status: "success"
        });
        done();
      });
    });
  });

  describe('command line', function () {
    it('works from the command line', function (done) {
      const fork = require('child_process').fork;
      const node = fork('parsers/marked/markedConverter.js',
        ['# Heading\n\nSome Text'], {
          stdio: ['ignore', 'pipe', 'pipe', 'ipc']
        });

      let res = "";
      let report = "";
      node.stdout.on('data', (data) => {
        res += data;
      });
      node.stderr.on('data', (data) => {
        report += data;
      });

      node.on('close', (code) => {
        expect(code).to.equal(0);
        expect(res).to.match(/<h1[\s\S]*>\s*Heading\s*<\/h1>\s*<p>\s*Some\s*Text\s*<\/p>/);
        expect(report).to.match(/{[\s\S]*converter:[\s\'\"]*marked[\s\'\"]*,\s*status: [\s\'\"]*success[\s\'\"]*[\s\S]*}/);
        done();
      });
    });
  });
});