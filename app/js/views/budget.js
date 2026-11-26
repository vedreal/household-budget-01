/* HomeLedger view: Budget. One job: plan vs actual, per category. */
(function () {
  "use strict";
  var F = window.HLFmt, D = window.HLData;

  function render(data) {
    var m = data.month;
    var spent = D.spentByCategory(data, m);
    var totalBudget = 0, totalSpent = 0;
    var rows = D.CATEGORIES.map(function (cat) {
      var b = data.budgets[cat] || 0;
      var s = spent[cat] || 0;
      totalBudget += b; totalSpent += s;
      var p = b > 0 ? Math.round(s / b * 100) : 0;
      var barCls = s > b ? "bar over" : (p >= 85 ? "bar warn" : "bar");
      var diff = b - s;
      var diffHtml = diff >= 0
        ? '<span class="pos">' + F.money(diff) + " left</span>"
        : '<span class="neg">' + F.money(-diff) + " over</span>";
      return '<div class="progress-row"><span><span class="dot" style="background:' + D.CAT_COLORS[cat] + '"></span>' + F.esc(cat) + '</span>' +
        '<div><div class="' + barCls + '"><i style="width:' + Math.min(100, p) + '%"></i></div>' +
        '<div class="sub" style="margin-top:4px">' + F.money(s) + " of " + F.money(b) + " &middot; " + p + "% &middot; " + diffHtml + "</div></div>" +
        '<span class="amt"><label style="display:inline">Budget $<input type="number" min="0" step="1" value="' + b + '" data-budget-cat="' + F.esc(cat) + '" style="width:84px; padding:5px 8px"></label></span></div>';
    }).join("");

    var overall = totalBudget > 0 ? Math.round(totalSpent / totalBudget * 100) : 0;
    return '' +
      '<div class="page-head"><h1>Budget</h1><p>' + F.monthName(m) + " &middot; " + F.money(totalSpent) + " spent of " + F.money(totalBudget) + " planned (" + overall + "%)</p></div>" +
      '<div class="card span12"><h2>Monthly budgets</h2>' +
      '<p class="hint">Change any amount and press Enter — the bar updates immediately. Green means on track, amber means nearly spent, red means over budget.</p>' +
      rows +
      '<p style="margin-top:14px"><strong>Total planned:</strong> ' + F.money(totalBudget) + " &nbsp;·&nbsp; <strong>Total spent:</strong> " + F.money(totalSpent) + " &nbsp;·&nbsp; <strong>" + (totalBudget - totalSpent >= 0 ? "Under by " : "Over by ") + F.money(Math.abs(totalBudget - totalSpent)) + "</strong></p></div>";
  }

  function mount(data) {
    document.querySelectorAll("[data-budget-cat]").forEach(function (input) {
      input.addEventListener("change", function () {
        var d = window.HLApp.getData();
        var cat = input.getAttribute("data-budget-cat");
        var v = parseFloat(input.value);
        if (!isNaN(v) && v >= 0) {
          d.budgets[cat] = Math.round(v);
          D.save(d);
          window.HLApp.rerender();
        }
      });
    });
  }

  window.HLViews = window.HLViews || {};
  window.HLViews.budget = { render: render, mount: mount };
})();
