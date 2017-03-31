/* global calculator */
"use strict";

$(function(){
  function CalculatorInstance() {
    let _calculator = calculator;
    let _option = 1;

    this.init = function() {
      google.charts.load('current', { 'packages': ['corechart'] });
      google.charts.setOnLoadCallback(() => this.run());
      qs('form').onsubmit = () => this.run();

      window.addEventListener('resize', () => _calculator.drawCharts());
    };

    this.run = function() {
      let params = _getParamsFromDOM();
      _calculator.init(params, _option);
      _calculator.run();
      return false;
    };

    function _getParamsFromDOM() {
      let f = 1 + parseFloat(qs('#deposit').value) / 1200;
      let Gm = parseFloat(qs('#credit').value) / 1200;
      let h = 1 + parseFloat(qs('#inflation').value) / 1200;
      let w = 1 + parseFloat(qs('#wage-growth').value) / 1200;
      let R = parseFloat(qs('#rent').value);
      let A = parseFloat(qs('#start').value);
      let B = parseFloat(qs('#payment').value);
      let S = parseFloat(qs('#sum').value);

      return [f, Gm, h, w, R, A, B, S];
    }
  }


  let calc = new CalculatorInstance();
  calc.init();
});