"use strict";

const
  // Libraries
  expect = require('chai').expect,
  sinon = require('sinon'),

  // Project modules
  FormulaConverter = require('../parsers/formula/formulaConverter').FormulaConverter;

let fc = new FormulaConverter({delims: ["\\$\\$", "<math>"], output: "mml"});

const formula0 = {
  latex: "\\frac{x^2+x}{y^3}",
  mml: '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block" alttext="\\frac{x^2+x}{y^3}">\n  <mfrac>\n    <mrow>\n      <msup>\n        <mi>x</mi>\n        <mn>2</mn>\n      </msup>\n      <mo>+</mo>\n      <mi>x</mi>\n    </mrow>\n    <msup>\n      <mi>y</mi>\n      <mn>3</mn>\n    </msup>\n  </mfrac>\n</math>'
};

const formula1 = {
  latex: "x",
  mml: '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block" alttext="x">  <mi>x</mi></math>'
};

const formula2 = {  // empty formula
  latex: "",
  mml: "<math xmlns=\"http://www.w3.org/1998/Math/MathML\" display=\"block\" />"
};

describe('_getMatchedRegExpGroup', () => {
  it('returns the first group match, but not the full match at index 0', () => {
    expect(fc._getMatchedRegExpGroup(["$$x^2$$", "x^2", undefined])).to.equal("x^2");
    expect(fc._getMatchedRegExpGroup(["<math>x^2</math>", undefined, "x^2"])).to.equal("x^2");
  });

  it('treats empty string as a result', () => {
    expect(fc._getMatchedRegExpGroup(["$$x^2$$", "", undefined])).to.equal("");
  });
});


describe('parse', function () {
  it('parses empty string to an empty array', function (done) {
    fc.parse("", function (err, parsedFormulas) {
      expect(err).to.be.an('error');
      expect(parsedFormulas).to.be.undefined;
      done();
    });
  });

  it('parses empty formulas to an array of empty formulas', function (done) {
    const input = "\$\$\$\$ blabla <math></math> blabla";

    fc.parse(input, function (err, parsedFormulas) {
      expect(err).to.be.null;

      expect(parsedFormulas).to.have.lengthOf(2);

      expect(parsedFormulas[0]).to.have.property('formula').that.equals(formula2.mml);
      expect(parsedFormulas[0]).to.have.property('startIndex', 0);
      expect(parsedFormulas[1]).to.have.property('formula').that.equals(formula2.mml);
      expect(parsedFormulas[1]).to.have.property('endIndex', input.split('>', 2).join('>').length + 1);

      done();
    });
  });

  it('parses string of two formulas into MathML', function (done) {
    const input = `\$\$${formula0.latex}\$\$ asld;as+a;lsdbflakjsbf \$\$${formula1.latex}\$\$`;

    fc.parse(input, function (err, parsedFormulas) {
      expect(err).to.be.null;
      expect(parsedFormulas).to.have.lengthOf(2);

      expect(parsedFormulas[0]).to.contain.all.keys({
        sourceFormula: `\$\$${formula0.latex}\$\$`,
        output: 'mml',
        startIndex: 0,
        endIndex: 21,
        formula: `${formula0.mml}`
      });

      parsedFormulas[1].formula = parsedFormulas[1].formula.replace(/(\n|\r)/g, '');  // clear whitespace
      expect(parsedFormulas[1]).to.contain.all.keys({
        sourceFormula: `\$\$${formula1.latex}\$\$`,
        output: 'mml',
        startIndex: 45,
        endIndex: input.length,
        formula: `${formula1.mml}`
      });
      done();
    });
  });

});


describe('convert', function () {
  it('converts empty file string to an empty file string', function (done) {
    fc.convert("", (err, preparedFileStr, report) => {
      expect(err).to.be.null;
      expect(preparedFileStr).to.equal("");
      expect(report).to.contain.all.keys({'converter': 'formula'});
      done();
    })
  });

  it('converts file with some formulas correctly', function (done) {
    let sourceStr = `Formula 0: \$\$${formula0.latex}\$\$;` +
      `Formula 1: <math>${formula1.latex}</math>;` +
      `Formula empty: \$\$\$\$.`;

    let expectedStr = `Formula 0: ${formula0.mml};` +
      `Formula 1: ${formula1.mml};` +
      `Formula empty: ${formula2.mml}.`;
    expectedStr = expectedStr.replace(/(\n|\r)/g, '');

    fc.convert(sourceStr, (err, preparedFileStr, report) => {
      expect(preparedFileStr.replace(/(\n|\r)/g, '')).to.equal(expectedStr);

      done();
    });
  });

});

describe('command line', function () {
  it('works from the command line', function (done) {
    const fork = require('child_process').fork;
    const node = fork('parsers/formula/formulaConverter.js',
      ['\$\$x^2\$\$ + \$\$x\$\$', '--input', 'TeX', '--output', 'mml'], {
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
      expect(res).to.match(/<math[\s\S]*>\s*<msup>\s*<mi>x<\/mi>\s*<mn>2<\/mn>\s*<\/msup>/);
      expect(report).to.match(/{[\s\S]*startIndex: 10,\s*endIndex: 15[\s\S]*}/);
      done();
    });
  });
});