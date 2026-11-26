/* HomeLedger view: Reports. One job: turn six months into answers. */
(function () {
  "use strict";
  var F = window.HLFmt, D = window.HLData, C = window.HLCharts;

  function render(data) {
    var m = data.month;
    var income = D.sumIncome(data, m);
    var spending = D.sumSpending(data, m);
    var byCat = D.spentByCategory(data, m);
    var hist = data.history.slice(-6);

    var topCat = D.CATEGORIES.slice().sort(function (a, b) { return byCat[b] - byCat[a]; })[0];
    var daysInMonth = 30;
    var dayOfMonth = 26; // demo "today" within November
    var avgDaily = spending / dayOfMonth;
    var projected = avgDaily * daysInMonth;
    var avgSpending6 = hist.reduce(function (s, h) { return s + h.spending; }, 0) / hist.length;
    var avgIncome6 = hist.reduce(function (s, h) { return s + h.income; }, 0) / hist.length;
    var rate = income > 0 ? (income - spending) / income : 0;

    var catRows = D.CATEGORIES.slice().sort(function (a, b) { return byCat[b] - byCat[a]; })
      .map(function (cat) {
        var p = spending > 0 ? Math.round(byCat[cat] / spending * 100) : 0;
        return '<div class="progress-row"><span><span class="dot" style="background:' + D.CAT_COLORS[cat] + '"></span>' + F.esc(cat) + '</span>' +
          '<div class="bar"><i style="width:' + p + '%"></i></div>' +
          '<span class="amt">' + F.money(byCat[cat]) + " &middot; " + p + "%</span></div>";
      }).join("");

    return '' +
      '<div class="page-head"><h1>Reports</h1><p>Six months of household money, ' + F.monthShort(hist[0].month) + "–" + F.monthShort(hist[hist.length - 1].month) + " 2026</p></div>" +
      '<div class="grid">' +
      '<div class="card span12"><h2>Income vs spending — last 6 months</h2>' +
      '<canvas id="trend" class="chart" width="520" height="260"></canvas>' +
      '<div class="legend"><span><span class="dot" style="background:#1d6b3c"></span>Income</span><span><span class="dot" style="background:#b45309"></span>Spending</span></div></div>' +

      '<div class="card span6"><h2>Where November went</h2><p class="hint">Share of total spending by category</p>' + catRows + "</div>" +

      '<div class="card span6"><h2>What the numbers say</h2>' +
      '<div class="insight"><strong>Top category: ' + F.esc(topCat) + ".</strong> " + F.money(byCat[topCat]) + " this month — " + F.percent(byCat[topCat] / spending) + " of all spending. Housing is fixed, so the lever is everything after it.</div>" +
      '<div class="insight"><strong>Average daily spend: ' + F.money(avgDaily) + ".</strong> At this pace November ends near " + F.money(projected) + " — below the 6-month average of " + F.money(avgSpending6) + ".</div>" +
      '<div class="insight"><strong>Savings rate: ' + F.percent(rate) + ".</strong> " + F.money(income - spending) + " of " + F.money(income) + " stays in the family this month, against a 6-month average income of " + F.money(avgIncome6) + ".</div>" +
      '<div class="insight"><strong>Projected month-end balance: ' + F.money(income - projected) + ".</strong> If spending holds its daily pace, the Riveras close November about " + F.money(income - projected) + " ahead.</div>" +
      "</div>" +
      "</div>";
  }

  function mount(data) {
    var hist = data.history.slice(-6);
    C.drawTrend(document.getElementById("trend"),
      hist.map(function (h) { return F.monthShort(h.month); }),
      hist.map(function (h) { return h.income; }),
      hist.map(function (h) { return h.spending; }));
  }

  window.HLViews = window.HLViews || {};
  window.HLViews.reports = { render: render, mount: mount };
})();
