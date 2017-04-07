"use strict";

const FormulaConverter = require('./formulaConverter').FormulaConverter;
const fc = new FormulaConverter({delims: ["\\$\\$", "<math>"], output: "mml"});

const formula0 = {
  latex: "\\frac{x^2+x}{y^3}",
  mml: '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block" alttext="\\frac{x^2+x}{y^3}">\n  <mfrac>\n    <mrow>\n      <msup>\n        <mi>x</mi>\n        <mn>2</mn>\n      </msup>\n      <mo>+</mo>\n      <mi>x</mi>\n    </mrow>\n    <msup>\n      <mi>y</mi>\n      <mn>3</mn>\n    </msup>\n  </mfrac>\n</math>'
};

const formula1 = {
  latex: "x",
  mml: '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block" alttext="x">  <mi>x</mi></math>'
};


describe('_getMatchedRegExpGroup', () => {
  test('returns the first group match, but not the full match at index 0', () => {
    expect(fc._getMatchedRegExpGroup(["$$x^2$$", "x^2", undefined])).toBe("x^2");
    expect(fc._getMatchedRegExpGroup(["<math>x^2</math>", undefined, "x^2"])).toBe("x^2");
  });

  test('treats empty string as a result', () => {
    expect(fc._getMatchedRegExpGroup(["$$x^2$$", "", undefined])).toBe("");
  });
});


describe('parse', function () {
  test('parses empty string to an empty array', function (done) {

    fc.parse("", function (err, parsedFormulas) {
      expect(err).toEqual(expect.any(Error));
      expect(parsedFormulas).toEqual(undefined);
      done();
    });
  });

  test('parses empty formulas to an array of empty formulas', function (done) {
    const input = "\$\$\$\$ blabla <math></math> blabla";

    fc.parse(input, function (err, parsedFormulas) {
      expect(err).toBe(null);
      expect(parsedFormulas).toHaveLength(2);
      expect(parsedFormulas).toEqual(expect.arrayContaining([
        expect.objectContaining({
          formula: "<math xmlns=\"http://www.w3.org/1998/Math/MathML\" display=\"block\" />",
          startIndex: 0
        }),
        expect.objectContaining({
          formula: "<math xmlns=\"http://www.w3.org/1998/Math/MathML\" display=\"block\" />",
          endIndex: input.split('>', 2).join('>').length + 1  // second occurrence of '>'
        })
      ]));

      done();
    });
  });

  test('parses string of two formulas into MathML', function (done) {
    const input = `\$\$${formula0.latex}\$\$ asld;as+a;lsdbflakjsbf \$\$${formula1.latex}\$\$`;

    fc.parse(input, function (err, parsedFormulas) {
      expect(err).toBe(null);
      expect(parsedFormulas).toHaveLength(2);
      expect(parsedFormulas).toContainEqual({
        sourceFormula: `\$\$${formula0.latex}\$\$`,
        output: 'mml',
        startIndex: 0,
        endIndex: 21,
        formula: `${formula0.mml}`
      });

      parsedFormulas[1].formula = parsedFormulas[1].formula.replace(/(\n|\r)/g, '');
      expect(parsedFormulas).toContainEqual({
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


