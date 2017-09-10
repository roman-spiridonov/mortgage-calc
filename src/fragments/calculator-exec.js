"use strict";

const $ = require('jquery');

const calculator = require('../calculator');

$(function() {
  function CalculatorInstance() {
    let _calculator = calculator;

    this.init = function() {
      google.charts.load('current', {'packages': ['corechart']});
      google.charts.setOnLoadCallback(() => {
        $('form').on('submit', () => this.run());
        this.run();
      });

      window.addEventListener('resize', () => _calculator.drawCharts());

      $('#wage-growth').change((e) => {
        _updateOption(e.target.value);
      });
    };

    this.run = function() {
      let params = _getParamsFromDOM();

      let option = _updateOption($('#wage-growth').val());
      // let option = $('#option').val();

      _calculator.init(params, parseFloat(option));
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

    function _updateOption(wage) {
      let o;
      if (wage <= 0.000000001) {
        o = 1;
      } else if (Math.abs(wage - $('#inflation').val()) <= 0.000000001) {
        o = 2;
      } else {
        o = 3;
      }
      $('#option').val(o);
      return o;
    }
  }

  let calc = new CalculatorInstance();
  calc.init();
});