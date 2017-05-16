"use strict";

const calculator = require('../calculator');

$(function(){
  function CalculatorInstance() {
    let _calculator = calculator;
    let _option = 1;

    this.init = function() {
      google.charts.load('current', { 'packages': ['corechart'] });
      google.charts.setOnLoadCallback(() => this.run());

      window.addEventListener('resize', () => _calculator.drawCharts());
    };

    this.run = function() {
      $('form').on('submit', () => this.run());
      let params = _getParamsFromDOM();
      _calculator.init(params, _option);
      _calculator.run();
      return false;
    };

    function _getParamsFromDOM() {
      let f = 1 + parseFloat($('#deposit').val()) / 1200;
      let Gm = parseFloat($('#credit').val()) / 1200;
      let h = 1 + parseFloat($('#inflation').val()) / 1200;
      let w = 1 + parseFloat($('#wage-growth').val()) / 1200;
      let R = parseFloat($('#rent').val());
      let A = parseFloat($('#start').val());
      let B = parseFloat($('#payment').val());
      let S = parseFloat($('#sum').val());

      return [f, Gm, h, w, R, A, B, S];
    }
  }

  let calc = new CalculatorInstance();
  calc.init();
});