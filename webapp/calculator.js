"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var calculator = function () {

  function Calculator() {
    this._option = 1;
    this._params = [];
    this._isInit = false;
  }

  Calculator.prototype.findn = function () {
    // deposit
    var _params = _slicedToArray(this._params, 8),
        f = _params[0],
        Gm = _params[1],
        h = _params[2],
        w = _params[3],
        R = _params[4],
        A = _params[5],
        B = _params[6],
        S = _params[7];

    var fh = f / h;
    if (this._option === 1 || this._option === 2) {
      return Math.log((B + S * (fh - 1)) / (B + A * (1 - 1 / fh))) / Math.log(fh) || (S - A) / B;
    }

    return false;
  };

  Calculator.prototype.findm = function () {
    // credit
    var _params2 = _slicedToArray(this._params, 8),
        f = _params2[0],
        Gm = _params2[1],
        h = _params2[2],
        w = _params2[3],
        R = _params2[4],
        A = _params2[5],
        B = _params2[6],
        S = _params2[7];

    if (this._option === 1) {
      return Math.log(1 - Gm * (S - A) / (B + R)) / Math.log(1 / (1 + Gm));
    } else if (this._option === 2) {
      return Math.log(1 - (S - A) / (B + R) * (1 - h / (1 + Gm))) / Math.log(h / (1 + Gm));
    } else if (this._option === 3) {
      return Math.log(1 - (S - A) / (B + R) * (1 - w / (1 + Gm))) / Math.log(w / (1 + Gm));
    }
  };

  Calculator.prototype.fn = function (n) {
    // m(n) for arbitrary S
    var _params3 = _slicedToArray(this._params, 8),
        f = _params3[0],
        Gm = _params3[1],
        h = _params3[2],
        w = _params3[3],
        R = _params3[4],
        A = _params3[5],
        B = _params3[6],
        S = _params3[7];

    var fh = f / h;
    if (this._option === 1) {
      // pay B+R each month
      return Math.log(1 - Gm * (this.Sn(n) - A) / (B + R)) / Math.log(1 / (1 + Gm));
    } else if (this._option === 2) {
      // pay (B+R)*h each month
      return Math.log(1 - (this.Sn(n) - A) / (B + R) * (1 - h / (1 + Gm))) / Math.log(h / (1 + Gm));
    } else if (this._option === 3) {
      // w - speed of wages
      return Math.log(1 - (this.Sn(n) - A) / (B + R) * (1 - w / (1 + Gm))) / Math.log(w / (1 + Gm));
    }
  };

  Calculator.prototype.Sn = function (n) {
    // S(n) - what cost of property one can afford when saving for n years at given params
    var _params4 = _slicedToArray(this._params, 8),
        f = _params4[0],
        Gm = _params4[1],
        h = _params4[2],
        w = _params4[3],
        R = _params4[4],
        A = _params4[5],
        B = _params4[6],
        S = _params4[7];

    var fh = f / h;
    if (this._option === 1 || this._option === 2) {
      return B / h * (Math.pow(fh, n) - 1) / (fh - 1) + A * Math.pow(fh, n - 1) * h || B * n + A;
    } else if (this._option === 3) {
      return B * Math.pow(w / h, n) / w * (Math.pow(f / w, n) - 1) / (f / w - 1) + A * Math.pow(fh, n - 1) * h || B * n + A;
    }
  };

  Calculator.prototype.calcData = function () {
    var _params5 = _slicedToArray(this._params, 8),
        f = _params5[0],
        Gm = _params5[1],
        h = _params5[2],
        w = _params5[3],
        R = _params5[4],
        A = _params5[5],
        B = _params5[6],
        S = _params5[7];
    // Calculate


    var n = this.findn();
    var m = this.findm();

    // TODO: move to presentation layer (calculator-exec)
    var nText = n !== false && !isNaN(n) ? Math.ceil(n) + ' мес., или ' + Math.ceil(n / 12) + ' лет' : 'см. по графику';
    var mText = m !== false && !isNaN(m) ? Math.ceil(m) + ' мес., или ' + Math.ceil(m / 12) + ' лет' : 'см. по графику';
    qs('#resn').innerHTML = nText;
    qs('#resm').innerHTML = mText;
    qs('#fracmn').innerHTML = m !== false && n !== false ? (m / n).toFixed(2) : '-';

    // Data for charts
    var data = new google.visualization.DataTable();
    data.addColumn('number', 'Месяц');
    data.addColumn('number', 'Кривая безразличия');
    data.addColumn('number', 'm(n)');
    data.addColumn('number', 'S');
    data.addColumn('number', 'm(n)_current');
    data.addColumn('number', 'S(n)_current');

    for (var i = 1; i < 251; i++) {
      if (Math.ceil(n) === i) {
        data.addRow([i, i, this.fn(i, f, Gm, h, w, R, A, B, S), Math.round(S), m, S]);
      } else {
        data.addRow([i, i, this.fn(i, f, Gm, h, w, R, A, B, S), Math.round(this.Sn(i, f, Gm, h, w, R, A, B, S)), m, null]);
      }
    }

    this._data = data;
    return data;
  };

  Calculator.prototype.drawCharts = function (data) {
    if (!data) {
      data = this._data;
    }
    // Chart m(n)
    var chart_mn = new google.visualization.ComboChart(document.getElementById('chart_mn'));
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
    var chart_S = new google.visualization.ComboChart(document.getElementById('chart_S'));
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
  Calculator.prototype.init = function (params, option) {
    this._option = option || 1;
    this._params = params; // [f, Gm, h, w, R, A, B, S]

    this._isInit = true;
  };

  Calculator.prototype.run = function () {
    if (!this._isInit) {
      console.error("Initialize your Calculator instance before using it.");
      return false;
    }
    var data = this.calcData();
    this.drawCharts(data);

    return true;
  };

  return new Calculator();
}();