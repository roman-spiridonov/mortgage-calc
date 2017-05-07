"use strict";

const
  // Libraries
  expect = require('chai').expect,
  sinon = require('sinon'),

  // Project modules
  MarkdownConverter = require('../parsers/markdown/markdownConverter').MarkdownConverter;

describe("MarkdownConverter", function () {
  describe("convert", function () {

    it("saves marked settings to the converter instance", function() {
      let mc = new MarkdownConverter({codeHighlight: {enabled: true}, smartLists: true, sanitize: false, gfm: true, tables: true});
      expect(mc).to.contain.all.keys('smartLists', 'sanitize', 'gfm', 'tables', 'highlight');
      expect(typeof(mc.highlight)).to.equal('function');
      expect(mc.gfm).to.be.true;
    });

    it("converts empty markdown string to empty html", function (done) {
      let mc = new MarkdownConverter();
      mc.convert("", (err, result) => {
        expect(err).to.be.null;
        expect(result).to.equal("");
        done();
      });
    });

    it("converts simple markdown string to html", function (done) {
      let mc = new MarkdownConverter();
      const input = "# Heading\n\nSome Text";
      mc.convert(input, (err, result) => {
        expect(err).to.be.null;
        expect(result).to.match(/<h1[\s\S]*>\s*Heading\s*<\/h1>\s*<p>\s*Some\s*Text\s*<\/p>/);
        done();
      });
    });

    it("works from command line");
  });
});