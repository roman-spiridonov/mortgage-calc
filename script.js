(function() {
    google.charts.load('current', { 'packages': ['corechart'] });
    google.charts.setOnLoadCallback(run);

	qs = (s) => document.body.querySelector(s); // shortcut for querySelector
	qs('form').onsubmit = () => run();

    var data;
    var option = 3;

    var findn = function(f, Gm, h, w, R, A, B, S) { // deposit
        var fh = f / h;
        if(option == 1 || option == 2) {
            return Math.log((B + S * (fh - 1)) / (B + A * (1 - 1 / fh))) / Math.log(fh) || (S - A) / B;
        }

        return false;
    };

    var findm = function(f, Gm, h, w, R, A, B, S) {   // credit
        if (option == 1) { 
            return Math.log(1 - Gm * (S - A) / (B + R)) / Math.log(1 / (1 + Gm));
        } else if (option == 2) { 
            return Math.log(1 - (S - A) / (B + R) * (1 - h / (1 + Gm))) / Math.log(h / (1 + Gm));
        } else if (option == 3) {
            return Math.log(1 - (S - A) / (B + R) * (1 - w / (1 + Gm))) / Math.log(w / (1 + Gm));
        }
    };

    var fn = function(x, f, Gm, h, w, R, A, B, S) { // m(n) for arbitrary S
        var fh = f / h;
        if (option == 1) {  // pay B+R each month
            return Math.log(1 - Gm * (Sn(x, f, Gm, h, w, R, A, B, S) - A) / (B + R)) / Math.log(1 / (1 + Gm));
        } else if (option == 2) {  // pay (B+R)*h each month
            return Math.log(1 - (Sn(x, f, Gm, h, w, R, A, B, S) - A) / (B + R) * (1 - h / (1 + Gm))) / Math.log(h / (1 + Gm));
        } else if (option == 3) {  // w - speed of wages
            return Math.log(1 - (Sn(x, f, Gm, h, w, R, A, B, S) - A) / (B + R) * (1 - w / (1 + Gm))) / Math.log(w / (1 + Gm));;
        }
    };

    var Sn = function(x, f, Gm, h, w, R, A, B, S) { // S(n) - what cost of property one can afford when saving for n years at given params
        // S(n)
        var fh = f / h;
        if(option == 1 || option == 2) {
            return B / h * (Math.pow(fh, x) - 1) / (fh - 1) + A * Math.pow(fh, x - 1) * h || B * x + A;
        } else if(option == 3) {
            return B * Math.pow(w/h, x) / w * (Math.pow(f/w, x) - 1) / (f/w - 1) + A * Math.pow(fh, x - 1) * h || B * x + A;
        }

    };

    function calcData() {
        var f = 1 + parseFloat(qs('#deposit').value) / 1200;
        var Gm = parseFloat(qs('#credit').value) / 1200;
        var h = 1 + parseFloat(qs('#inflation').value) / 1200;
        var w = 1 + parseFloat(qs('#wage-growth').value) / 1200;
        var S = parseFloat(qs('#sum').value);
        var R = parseFloat(qs('#rent').value);
        var A = parseFloat(qs('#start').value);
        var B = parseFloat(qs('#payment').value);

        // Calculate
        var n = findn(f, Gm, h, w, R, A, B, S);
        var m = findm(f, Gm, h, w, R, A, B, S);
        var nText = (n != false && !isNaN(n)? Math.ceil(n) + ' мес., или ' + Math.ceil(n / 12) + ' лет' : 'см. по графику');
        var mText = (m != false && !    isNaN(m)? Math.ceil(m) + ' мес., или ' + Math.ceil(m / 12) + ' лет' : 'см. по графику');
        qs('#resn').innerHTML = nText;
        qs('#resm').innerHTML = mText;
        qs('#fracmn').innerHTML = (m !== false && n !== false ? (m / n).toFixed(2) : '-');

        // Data for charts
        data = new google.visualization.DataTable();
        data.addColumn('number', 'Месяц');
        data.addColumn('number', 'Кривая безразличия');
        data.addColumn('number', 'm(n)');
        data.addColumn('number', 'S');
        data.addColumn('number', 'm(n)_current');
        data.addColumn('number', 'S(n)_current');

        for (var i = 1; i < 251; i++) {
            if (Math.ceil(n) == i) {
                data.addRow([i, i, fn(i, f, Gm, h, w, R, A, B, S), Math.round(S), m, S]);
            } else {
                data.addRow([i, i, fn(i, f, Gm, h, w, R, A, B, S), Math.round(Sn(i, f, Gm, h, w, R, A, B, S)), m, null]);
            }
        }

        return data;

    };

    function drawCharts(data) {
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

    }

    function run() {
        data = calcData();
        drawCharts(data);

        return false;
    }

    window.addEventListener('resize', () => drawCharts(data));

})();
