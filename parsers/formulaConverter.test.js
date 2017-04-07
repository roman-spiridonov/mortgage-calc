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

describe('parse', () => {
  test('parses string of two formulas into MathML', (done) => {
    const input = `\$\$${formula0.latex}\$\$ asld;as+a;lsdbflakjsbf \$\$${formula1.latex}\$\$`;

    function cb(err, parsedFormulas) {
      expect(err).toBe(null);
      expect(parsedFormulas).toHaveLength(2);
      expect(parsedFormulas).toContainEqual({
        sourceFormula: `\$\$${formula0.latex}\$\$`,
        output: 'mml',
        startIndex: 0,
        endIndex: 21,
        formula: `${formula0.mml}`
      });

      parsedFormulas[1].formula = parsedFormulas[1].formula.replace(/(\n|\r)/g,'');
      expect(parsedFormulas).toContainEqual({
        sourceFormula: `\$\$${formula1.latex}\$\$`,
        output: 'mml',
        startIndex: 45,
        endIndex: input.length,
        formula: `${formula1.mml}`
      });

      done();
    }

    fc.parse(input, cb);

  });


});


