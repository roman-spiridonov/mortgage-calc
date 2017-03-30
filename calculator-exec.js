$(function(){
  function CalculatorInstance() {
    var _calculator = calculator;
    var _option = 1;

    this.init = function() {
      google.charts.load('current', { 'packages': ['corechart'] });
      google.charts.setOnLoadCallback(() => this.run());
      qs('form').onsubmit = () => this.run();

      window.addEventListener('resize', () => _calculator.drawCharts());
    }

    this.run = function() {
      var params = _getParamsFromDOM();
      _calculator.init(params, _option);
      _calculator.run();
      return false;
    }

    function _getParamsFromDOM() {
      var f = 1 + parseFloat(qs('#deposit').value) / 1200;
      var Gm = parseFloat(qs('#credit').value) / 1200;
      var h = 1 + parseFloat(qs('#inflation').value) / 1200;
      var w = 1 + parseFloat(qs('#wage-growth').value) / 1200;
      var R = parseFloat(qs('#rent').value);
      var A = parseFloat(qs('#start').value);
      var B = parseFloat(qs('#payment').value);
      var S = parseFloat(qs('#sum').value);

      return [f, Gm, h, w, R, A, B, S];
    }
  }


  var calc = new CalculatorInstance();
  calc.init();
});