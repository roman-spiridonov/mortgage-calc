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
  proxyquire = require('proxyquire');

let
  // Project modules
  cm = require('../parsers/converterManager'),  // for auto-complete, then proxyrequired
  formulaConv = require('../parsers/formula');

cm = proxyquire('../parsers/converterManager', {
  'glob': sinon.stub().yields(null, ['fixtures/data/test.html', 'fixtures/data/test.md'])
});

function readFileFake(file, encoding, cb) {
  if (file === 'fixtures/data/test.html') {
    cb(null, "# Heading\n" +
      "This is some custom math.\n" +
      "$$x^2$$ + <math>2x</math> = $$x\times (x+2)$$\n");
  } else if (file === 'fixtures/data/test.md') {
    cb(null, "# Heading\n" +
      "This file contains no formulas.");
  } else {
    cb(new Error(`File ${file} not found`));
  }
}


describe("converterManager", function () {
  before(function () {
    sinon.stub(fs, 'readFile').callsFake(readFileFake);
    sinon.stub(fs, 'writeFile').yields();
  });

  after(function () {
    fs.readFile.restore();
    fs.writeFile.restore();
  });

  describe("setUp", function () {
    it("should register a converter if it is a standard one", function () {
      cm.setUp({
        converters: [{name: 'formula'}, {name: 'marked'}]
      });
      expect(cm._converters['formula']).to.exist;
      expect(cm._converters['marked']).to.exist;
    });

    it("should throw an error if converter is not registered", function () {
      expect(() => cm.setUp({
        converters: [{name: 'not_exist'}]
      })).to.throw();
    });

  });

  describe("run", function () {
    cm.use(formulaConv);

    cm.setUp({
      converters: [   // order is significant
        {
          name: 'formula',  // should be available at parsers/formula
          settings: require('./fixtures/config-formula-default')
        }
      ],
      src: 'data', // source folder
      dest: 'out'  // destination folder
    });

    let testGlobAll = "**/*";

    it("calls runOnFile with file names from the glob", function (done) {

      sinon.stub(cm, 'runOnFile').callsArgWith(1, null);

      cm.run(testGlobAll, (err, res) => {
        expect(err).to.be.null;
        expect(cm.runOnFile.callCount).to.equal(2);
        expect(cm.runOnFile.getCall(0).args[0]).to.match(/test.html/);
        expect(cm.runOnFile.getCall(1).args[0]).to.match(/test.md/);
        cm.runOnFile.restore();
        done();
      });
    });
  });

  describe("getDestForFile", function () {
    it("returns full destination path to the specified input file", function () {
      cm.setUp({
        converters: [{name: 'formula'}, {name: 'marked'}],
        dest: 'out'
      });
      let sourcePath = path.join('data', 'test.html');
      expect(cm.getDestForFile(sourcePath)).to.match(/out\\test.html/);
    });

    it("works for default src and dest", function () {
      let sourcePath = path.join('data', 'test.html');
      expect(cm.getDestForFile(sourcePath)).to.match(/out\\test.html/);
    });

  });


});

