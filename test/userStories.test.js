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
  formulaConv = require('../parsers/formula'),
  markedConv = require('../parsers/marked');

const DIRS = {
  data: path.join(__dirname, 'fixtures', 'data'),
  out: path.join(__dirname, 'fixtures', 'out'),
  expected: path.join(__dirname, 'fixtures', 'expected'),
};

function getFixture(file, version) {
  return fs.readFileSync(path.join(DIRS[version], file), {encoding: 'utf-8'});
}


describe("user stories", function () {
  let testGlobPrefix = DIRS.data;
  function globFor(str) {
    return path.join(testGlobPrefix, "/", str);
  }
  let testGlob = globFor("**/test.*");

  before(function () {
    if (!fs.existsSync(DIRS.out)) {
      fs.mkdirSync(DIRS.out);
    }
  });

  it("I want to convert a glob of documents of special syntax (e.g. markdown + latex) to a specified destination. " +
    "To do that, I choose a set of converters to run and pass their parameters." +
    "At destination folder, the system keeps the directory structure of a glob.", function (done) {

    // Register the converters
    cm.use(formulaConv);
    cm.use(markedConv);

    // Set up and instantiate the converters
    cm.setUp({
      converters: [   // order is significant
        {
          name: 'formula',  // should be available at parsers/formula
          scope: '',
          settings: require('./fixtures/config-formula-default')
        },
        {
          name: 'marked',
          scope: '',
          settings: require('./fixtures/config-marked-default')
        }
      ],

      src: testGlobPrefix, // source folder
      dest: path.join(__dirname, 'fixtures', 'out')  // destination folder
    });

    cm.run(testGlob, (err, res) => {
      let sourceFile1 = path.join(testGlobPrefix, 'test.html');
      let sourceFile2 = path.join(testGlobPrefix, 'test.md');

      expect(err).to.be.null;
      // check structure
      // res = {
      //  'path\\to\\test.md': {
      //    status: "warnings",
      //    report: [{converter: "marked", status: "warnings", message: ""}, {converter: "formula", parsedFormulas: [], ...}, ...],
      //    dest: 'test.html'
      //    }, ...
      // }
      expect(res).to.have.property(sourceFile1)
        .that.is.an('object')
        .that.have.all.keys(['status', 'report', 'dest'])
        .with.property('report')
          .that.is.an.instanceof(Array)
          .that.has.lengthOf(2)
          .with.deep.property('[0]').that.contains({converter: 'formula', status: 'success'});
      expect(res[sourceFile1].report[1]).to.eql({converter: 'marked', status: 'success'});
      expect(res).to.have.all.keys(sourceFile1, sourceFile2);

      // read resulting files from disk and check
      expect(getFixture('test.html', 'out')).to.match(
        /<h1[\s\S]*>\s*Heading\s*<\/h1>\s*<p>This is some custom math.<\/p>\s*<math[\s\S]*>\s*<msup>\s*<mi>x<\/mi>\s*<mn>2<\/mn>\s*<\/msup>/
      );
      expect(getFixture('test.md', 'out')).to.match(
        /<h2[\s\S]*>\s*Section\s*<\/h2>\s*<p>No math in this document!<\/p>/
      );

      done();
    });


  });

  it("The above scenario works via cmd line launch");

  it("A set of converters is determined based on input content automatically");

  it("Files can be linked together and will be merged into one at destination");

  it("can register a new converter (and throws an error if it does not implement a specific interfrace)");
});