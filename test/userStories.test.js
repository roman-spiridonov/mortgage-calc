/**
 * Created by Roman Spiridonov <romars@phystech.edu> on 4/20/2017.
 */
"use strict";

const
  // Libraries
  path = require('path'),
  expect = require('chai').expect,
  fs = require('fs'),
  sinon = require('sinon'),

  // Project modules
  cm = require('../parsers/converterManager'),
  formulaConv = require('../parsers/formula');

describe("user stories", function () {
  let testGlobPrefix = path.join(__dirname, "data");
  function globFor(str) {
    return path.join(testGlobPrefix, "/", str);
  }
  let testGlobAll = globFor("**/*");

  it("I want to convert a glob of documents of special syntax (e.g. markdown + latex) to a specified destination. " +
    "To do that, I choose a set of converters to run and pass their parameters." +
    "At destination folder, the system keeps the directory structure of a glob.", function (done) {

    // Register the converters
    cm.use(formulaConv);

    // Set up and instantiate the converters
    cm.setUp({
      converters: [   // order is significant
        {
          name: 'formula',  // should be available at parsers/formula
          scope: '',
          settings: require('./fixtures/config-formula-default')
        },
        // {
        //   name: 'markdown',
        //   scope: '',
        //   settings: {}
        // },
      ],

      src: path.join(__dirname, 'data'), // source folder
      dest: path.join(__dirname, 'out')  // destination folder
    });

    cm.run(testGlobAll, (err, res) => {
      expect(err).to.be.null;
      expect(res).to.have.property(path.join(testGlobPrefix, 'test.html'))
        .that.is.an('object')
        .that.contains.all.keys(['status', 'report', 'dest'])
        .with.property('report')
          .that.is.an.instanceof(Array)
          .with.deep.property('[0]')
            .that.contains.all.keys({converter: 'formula'});

      expect(res).to.have.all.keys(path.join(testGlobPrefix, 'test.html'), path.join(testGlobPrefix, 'test.md'));
      // res = {
      //  'path\\to\\test.md': {
      //    status: "warnings",
      //    report: [{converter: "markdown", status: "warnings", errors: []}, ...],
      //    dest: 'test.html'
      //    }, ...
      // }

      done();
    });


  });

  it("The above scenario works via cmd line launch");

  it("A set of converters is determined based on input content automatically");

  it("Files can be linked together and will be merged into one at destination");

  it("can register a new converter (and throws an error if it does not implement a specific interfrace)");
});