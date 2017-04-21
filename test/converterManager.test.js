/**
 * Created by Roman Spiridonov <romars@phystech.edu> on 4/20/2017.
 */
"use strict";

const
    // Libraries
    path = require('path'),
    glob = require('glob'),
    expect = require('chai').expect,
    sinon = require('sinon'),

    // Project modules
    cm = require('../parsers/converterManager');

let testGlobPrefix = path.join(__dirname, "data");
function globFor(str) {
  return path.join(testGlobPrefix, "/", str);
}
let testGlobAll = globFor("**/*");

describe("user stories", function () {
  it("I want to convert a glob of documents of special syntax (e.g. markdown + latex) to a specified destination. " +
    "To do that, I choose a set of converters to run and pass their parameters." +
    "At destination folder, the system keeps the directory structure of a glob.", function (done) {

    cm.setUp({
      converters: [   // order is significant
        {
          name: 'formula',
          scope: '',  // selector for jQuery, empty string for whole document
          settings: {  // settings for a specific converter
            input: 'tex',
            output: 'mml'
          }

        },
        {
          name: 'markdown',  // should be registered under that name, otherwise throw an exception
          scope: '',
          settings: {}
        },
      ]
    });

    cm.run(testGlobAll, (err, res) => {
      // res = [ {
      //  fileName: 'test.md',
      //  status: "warnings",
      //  convertersRun: ["formula", "markdown"]
      //  report: [{converter: "markdown", status: "warnings", errors: []}, ...],
      //  destName: 'test.html'
      //  }, ...
      // ]
      done();
    });


  });

  it("The above scenario works via cmd line launch");

  it("A set of converters is determined based on input content automatically");

  it("Files can be linked together and will be merged into one at destination");
});


describe("formulaConverter", function () {
  it("can register a new converter (and throws an error if it does not implement a specific interfrace)", function () {

  });

  describe("run", function () {
    it("calls runOnFile with file names from the glob", function (done) {
      sinon.stub(cm, 'runOnFile').callsArgWith(1, null);

      cm.run(testGlobAll, (err, res) => {
        expect(cm.runOnFile.callCount).to.equal(2);
        expect(cm.runOnFile.getCall(0).args[0]).to.match(/description.html/);
        expect(cm.runOnFile.getCall(1).args[0]).to.match(/test.md/);
        cm.runOnFile.restore();
        done();
      });
    });
  });


});