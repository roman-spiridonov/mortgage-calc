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
  cm = require('../parsers/converterManager'),
  formulaConv = require('../parsers/formula');

function readFileFake (file, encoding, cb) {
  if(file === 'data/test1.html') {
    cb(null, "# Heading\n" +
      "This is some custom math.\n" +
      "$$x^2$$ + <math>2x</math> = $$x\times (x+2)$$\n");
  } else if(file === 'data/test2.md') {
    cb(null, "# Heading\n"+
      "This file contains no formulas.");
  } else {
    cb(new Error(`File ${file} not found`));
  }
}


describe("converterManager", function () {
  before(function () {
    sinon.stub(fs, 'readFile').callsFake(readFileFake);
    sinon.stub(fs, 'writeFile').yields();
    cm = proxyquire('../parsers/converterManager', {
      'glob' : sinon.stub().yields(null, ['data/test1.html', 'data/test2.md'])
    });

    cm.use(formulaConv);

    cm.setUp({
      converters: [   // order is significant
        {
          name: 'formula',  // should be available at parsers/formula
          scope: '',
          settings: require('./fixtures/config-formula-default')
        }
      ],
      src: 'data', // source folder
      dest: 'out'  // destination folder
    });

  });

  after(function () {
    fs.readFile.restore();
    fs.writeFile.restore();
  });

  describe("setUp", function () {
    it("should throw an error if converter is not registered");

  });

  describe("run", function () {
    let testGlobAll = "**/*";

    it("calls runOnFile with file names from the glob", function (done) {

      sinon.stub(cm, 'runOnFile').callsArgWith(1, null);

      cm.run(testGlobAll, (err, res) => {
        expect(cm.runOnFile.callCount).to.equal(2);
        expect(cm.runOnFile.getCall(0).args[0]).to.match(/test1.html/);
        expect(cm.runOnFile.getCall(1).args[0]).to.match(/test2.md/);
        cm.runOnFile.restore();
        done();
      });
    });
  });

  describe("getDestForFile", function () {
    it("returns full destination path to the specified input file", function () {
      let sourcePath = path.join('data','test1.html');
      expect(cm.getDestForFile(sourcePath)).to.match(/out\\test1.html/);
    })

  });


});

