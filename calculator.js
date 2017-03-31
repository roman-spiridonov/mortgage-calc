"use strict";

let calculator = (function() {

  function Calculator() {
    this._option = 1;
    this._params = [];
    this._isInit = false;
  }


  Calculator.prototype.findn = function() { // deposit
    let [f, Gm, h, w, R, A, B, S] = this._params;
    let fh = f / h;
    if (this._option === 1 || this._option === 2) {
      return Math.log((B + S * (fh - 1)) / (B + A * (1 - 1 / fh))) / Math.log(fh) || (S - A) / B;
    }

    return false;
  };

  Calculator.prototype.findm = function() { // credit
    let [f, Gm, h, w, R, A, B, S] = this._params;

    if (this._option === 1) {
      return Math.log(1 - Gm * (S - A) / (B + R)) / Math.log(1 / (1 + Gm));
    } else if (this._option === 2) {
      return Math.log(1 - (S - A) / (B + R) * (1 - h / (1 + Gm))) / Math.log(h / (1 + Gm));
    } else if (this._option === 3) {
      return Math.log(1 - (S - A) / (B + R) * (1 - w / (1 + Gm))) / Math.log(w / (1 + Gm));
    }
  };

  Calculator.prototype.fn = function(n) { // m(n) for arbitrary S
    let [f, Gm, h, w, R, A, B, S] = this._params;
    let fh = f / h;
    if (this._option === 1) { // pay B+R each month
      return Math.log(1 - Gm * (this.Sn(n) - A) / (B + R)) / Math.log(1 / (1 + Gm));
    } else if (this._option === 2) { // pay (B+R)*h each month
      return Math.log(1 - (this.Sn(n) - A) / (B + R) * (1 - h / (1 + Gm))) / Math.log(h / (1 + Gm));
    } else if (this._option === 3) { // w - speed of wages
      return Math.log(1 - (this.Sn(n) - A) / (B + R) * (1 - w / (1 + Gm))) / Math.log(w / (1 + Gm));
    }
  };

  Calculator.prototype.Sn = function(n) { // S(n) - what cost of property one can afford when saving for n years at given params
    let [f, Gm, h, w, R, A, B, S] = this._params;
    let fh = f / h;
    if (this._option === 1 || this._option === 2) {
      return B / h * (Math.pow(fh, n) - 1) / (fh - 1) + A * Math.pow(fh, n - 1) * h || B * n + A;
    } else if (this._option === 3) {
      return B * Math.pow(w / h, n) / w * (Math.pow(f / w, n) - 1) / (f / w - 1) + A * Math.pow(fh, n - 1) * h || B * n + A;
    }

  };

  Calculator.prototype.calcData = function() {
    let [f, Gm, h, w, R, A, B, S] = this._params;
    // Calculate
    let n = this.findn();
    let m = this.findm();

    // TODO: move to presentation layer (calculator-exec)
    let nText = (n !== false && !isNaN(n) ? Math.ceil(n) + ' мес., или ' + Math.ceil(n / 12) + ' лет' : 'см. по графику');
    let mText = (m !== false && !isNaN(m) ? Math.ceil(m) + ' мес., или ' + Math.ceil(m / 12) + ' лет' : 'см. по графику');
    qs('#resn').innerHTML = nText;
    qs('#resm').innerHTML = mText;
    qs('#fracmn').innerHTML = (m !== false && n !== false ? (m / n).toFixed(2) : '-');

    // Data for charts
    let data = new google.visualization.DataTable();
    data.addColumn('number', 'Месяц');
    data.addColumn('number', 'Кривая безразличия');
    data.addColumn('number', 'm(n)');
    data.addColumn('number', 'S');
    data.addColumn('number', 'm(n)_current');
    data.addColumn('number', 'S(n)_current');

    for (let i = 1; i < 251; i++) {
      if (Math.ceil(n) === i) {
        data.addRow([i, i, this.fn(i, f, Gm, h, w, R, A, B, S), Math.round(S), m, S]);
      } else {
        data.addRow([i, i, this.fn(i, f, Gm, h, w, R, A, B, S), Math.round(this.Sn(i, f, Gm, h, w, R, A, B, S)), m, null]);
      }
    }

    this._data = data;
    return data;
  };

  Calculator.prototype.drawCharts = function(data) {
    if (!data) {
      data = this._data;
    }
    // Chart m(n)
    let chart_mn = new google.visualization.ComboChart(document.getElementById('chart_mn'));
    chart_mn.draw(data, {
      title: 'График отношения сроков кредита (m) и вклада (n)',
      chartArea: { 'width': '80%', 'height': '80%' },
      vAxis: { title: "срок кредита (m), мес", minorGridlines: { color: '#eee', count: 5 } },
      hAxis: { title: "срок вклада (n), мес", minorGridlines: { color: '#eee', count: 5 }, minValue: 0, maxValue: 250 },
      //seriesType:   "line",
      series: {
        0: { type: "line" },
        1: { type: "line" },
        2: { type: "none" },
        3: { type: "line" },
        4: { type: "none" }
      },
      legend: 'none'
    });

    // Chart S(n)
    let chart_S = new google.visualization.ComboChart(document.getElementById('chart_S'));
    chart_S.draw(data, {
      title: 'График стоимости (S), которую можно себе позволить при накоплении n лет, тыс. руб.',

      chartArea: { 'width': '80%', 'height': '80%' },
      vAxis: { title: "Стоимость (S)", minorGridlines: { color: '#eee', count: 5 } },
      hAxis: { title: "месяц", minorGridlines: { color: '#eee', count: 5 }, minValue: 0, maxValue: 250 },
      series: {
        0: { type: "none" },
        1: { type: "none" },
        2: { type: "line" },
        3: { type: "none" },
        4: { type: "scatter" }
      },
      legend: 'none',
      colors: ['', '', 'orange', '', 'green']
    });

  };

  /**
   * Initialize calculator instance before usage.
   * @param {Number} option - method of calculation
   * @param {Object} data - object containing input parameters of the model
   */
  Calculator.prototype.init = function(params, option) {
    this._option = option || 1;
    this._params = params;  // [f, Gm, h, w, R, A, B, S]
    
    this._isInit = true;
  };

  Calculator.prototype.run = function() {
    if(!this._isInit) {
      console.error("Initialize your Calculator instance before using it.");
      return false;
    }
    let data = this.calcData();
    this.drawCharts(data);

    return true;
  };

  return new Calculator();

})();
