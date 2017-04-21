"use strict";

const
  // Libraries
  expect = require('chai').expect,
  sinon = require('sinon'),

  // Project modules
  FormulaConverter = require('../parsers/formulaConverter').FormulaConverter;

let fc = new FormulaConverter({delims: ["\\$\\$", "<math>"], output: "mml"});;

const formula0 = {
  latex: "\\frac{x^2+x}{y^3}",
  mml: '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block" alttext="\\frac{x^2+x}{y^3}">\n  <mfrac>\n    <mrow>\n      <msup>\n        <mi>x</mi>\n        <mn>2</mn>\n      </msup>\n      <mo>+</mo>\n      <mi>x</mi>\n    </mrow>\n    <msup>\n      <mi>y</mi>\n      <mn>3</mn>\n    </msup>\n  </mfrac>\n</math>'
};

const formula1 = {
  latex: "x",
  mml: '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block" alttext="x">  <mi>x</mi></math>'
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

      expect(parsedFormulas[0]).to.have.property('formula').that.equals(
        "<math xmlns=\"http://www.w3.org/1998/Math/MathML\" display=\"block\" />");
      expect(parsedFormulas[0]).to.have.property('startIndex', 0);
      expect(parsedFormulas[1]).to.have.property('formula').that.equals(
        "<math xmlns=\"http://www.w3.org/1998/Math/MathML\" display=\"block\" />");
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


