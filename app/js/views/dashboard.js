/* HomeLedger view: Dashboard. One job: the month at a glance. */
(function () {
  "use strict";
  var F = window.HLFmt, D = window.HLData, C = window.HLCharts;

  function render(data) {
    var m = data.month;
    var income = D.sumIncome(data, m);
    var spending = D.sumSpending(data, m);
    var remaining = income - spending;
    var rate = income > 0 ? (income - spending) / income : 0;
    var byCat = D.spentByCategory(data, m);
    var recent = D.monthTx(data, m).slice().sort(function (a, b) {
      return b.date.localeCompare(a.date) || b.id - a.id;
    }).slice(0, 6);
    var upcoming = data.bills.slice().sort(function (a, b) { return a.dueDay - b.dueDay; });
    var unpaidTotal = upcoming.filter(function (b) { return !b.paid; })
      .reduce(function (s, b) { return s + b.amount; }, 0);

    var legend = D.CATEGORIES.map(function (cat) {
      if (byCat[cat] <= 0) return "";
      return '<span><span class="dot" style="background:' + D.CAT_COLORS[cat] + '"></span>' +
        F.esc(cat) + " " + F.money0(byCat[cat]) + "</span>";
    }).join("");

    var goalsHtml = data.goals.map(function (g) {
      var p = Math.min(100, Math.round(g.saved / g.target * 100));
      return '<div class="progress-row"><span>' + F.esc(g.name) + '</span>' +
        '<div class="bar"><i style="width:' + p + '%"></i></div>' +
        '<span class="amt">' + F.money0(g.saved) + " / " + F.money0(g.target) + " &middot; " + p + "%</span></div>";
    }).join("");

    var billsHtml = upcoming.map(function (b) {
      var badge = b.paid
        ? '<span class="badge badge-green">Paid</span>'
        : '<span class="badge badge-amber">Due Nov ' + b.dueDay + "</span>";
      var btn = b.paid
        ? '<button type="button" class="btn btn-ghost btn-small" data-unpay-bill="' + b.id + '">Undo</button>'
        : '<button type="button" class="btn btn-small" data-pay-bill="' + b.id + '">Mark paid</button>';
      return '<div class="list-row"><div class="grow"><strong>' + F.esc(b.name) + "</strong><br>" +
        '<span class="sub">' + F.esc(b.category) + " &middot; due Nov " + b.dueDay + "</span></div>" +
        '<span class="amt">' + F.money(b.amount) + "</span>" + badge + btn + "</div>";
    }).join("");

    var recentHtml = recent.map(function (t) {
      var cls = t.type === "income" ? "pos" : "neg";
      var sign = t.type === "income" ? "+" : "−";
      return '<div class="list-row"><div class="grow"><strong>' + F.esc(t.desc) + "</strong><br>" +
        '<span class="sub">' + F.shortDate(t.date) + " &middot; " + F.esc(t.category) + "</span></div>" +
        '<span class="amt ' + cls + '">' + sign + F.money(t.amount) + "</span></div>";
    }).join("");

    var catOptions = D.CATEGORIES.map(function (c) {
      return '<option value="' + F.esc(c) + '">' + F.esc(c) + "</option>";
    }).join("");

    return '' +
      '<div class="page-head"><h1>Dashboard</h1>' +
      '<div class="month-nav"><button type="button" class="btn btn-ghost btn-small" data-month-shift="-1">&larr; Prev</button>' +
      "<strong>" + F.monthName(m) + "</strong>" +
      '<button type="button" class="btn btn-ghost btn-small" data-month-shift="1">Next &rarr;</button></div></div>' +

      '<div class="grid">' +
      '<div class="card span4"><div class="stat">Income</div><div class="stat-value">' + F.money(income) + '</div><div class="stat-sub">Paychecks, freelance &amp; refunds</div></div>' +
      '<div class="card span4"><div class="stat">Spending</div><div class="stat-value">' + F.money(spending) + '</div><div class="stat-sub">' + D.monthTx(data, m).filter(function (t) { return t.type !== "income"; }).length + ' expenses this month</div></div>' +
      '<div class="card span4"><div class="stat">Remaining</div><div class="stat-value ' + (remaining >= 0 ? "good" : "warn") + '">' + F.money(remaining) + '</div><div class="stat-sub">Savings rate ' + F.percent(rate) + '</div></div>' +

      '<div class="card span6"><h2>Where the money went</h2><p class="hint">Spending by category, ' + F.monthName(m) + '</p>' +
      '<canvas id="donut" class="chart" width="260" height="260"></canvas><div class="legend">' + legend + '</div></div>' +

      '<div class="card span6"><h2>Spending, last 6 months</h2><p class="hint">Total spending per month — November is the lowest in half a year</p>' +
      '<canvas id="bars" class="chart" width="520" height="240"></canvas></div>' +

      '<div class="card span6"><h2>Upcoming bills</h2><p class="hint">' + F.money(unpaidTotal) + ' still due this month</p>' + billsHtml + '<p style="margin-top:12px"><a href="#/bills">Manage all bills &rarr;</a></p></div>' +

      '<div class="card span6"><h2>Savings goals</h2><p class="hint">Every goal, moving forward</p>' + goalsHtml + '<p style="margin-top:12px"><a href="#/goals">Open goals &rarr;</a></p></div>' +

      '<div class="card span6"><h2>Recent transactions</h2>' + recentHtml + '<p style="margin-top:12px"><a href="#/transactions">See all transactions &rarr;</a></p></div>' +

      '<div class="card span6"><h2>Quick add</h2><p class="hint">Log a purchase in seconds</p>' +
      '<form id="quick-add" class="inline">' +
      '<span class="field"><label for="qa-date">Date</label><input id="qa-date" type="date" value="2026-11-26" required></span>' +
      '<span class="field"><label for="qa-desc">What was it?</label><input id="qa-desc" type="text" placeholder="e.g. Weekly shop" required></span>' +
      '<span class="field"><label for="qa-cat">Category</label><select id="qa-cat">' + catOptions + '</select></span>' +
      '<span class="field"><label for="qa-amt">Amount ($)</label><input id="qa-amt" type="number" min="0.01" step="0.01" placeholder="0.00" required></span>' +
      '<span class="field"><label for="qa-type">Type</label><select id="qa-type"><option value="expense">Expense</option><option value="income">Income</option></select></span>' +
      '<button class="btn" type="submit">Add</button></form></div>' +
      '</div>';
  }

  function mount(data) {
    var byCat = D.spentByCategory(data, data.month);
    C.drawDonut(document.getElementById("donut"), D.CATEGORIES.map(function (cat) {
      return { label: cat, value: byCat[cat], color: D.CAT_COLORS[cat] };
    }));
    var hist = data.history.slice(-6);
    C.drawBars(document.getElementById("bars"),
      hist.map(function (h) { return F.monthShort(h.month); }),
      hist.map(function (h) { return h.spending; }), "#1d6b3c");

    document.querySelectorAll("[data-month-shift]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var d = window.HLApp.getData();
        d.month = F.shiftMonth(d.month, parseInt(btn.getAttribute("data-month-shift"), 10));
        D.save(d);
        window.HLApp.rerender();
      });
    });
    document.querySelectorAll("[data-pay-bill]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var d = window.HLApp.getData();
        var b = d.bills.find(function (x) { return x.id === parseInt(btn.getAttribute("data-pay-bill"), 10); });
        if (b) { b.paid = true; D.save(d); window.HLApp.rerender(); }
      });
    });
    document.querySelectorAll("[data-unpay-bill]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var d = window.HLApp.getData();
        var b = d.bills.find(function (x) { return x.id === parseInt(btn.getAttribute("data-unpay-bill"), 10); });
        if (b) { b.paid = false; D.save(d); window.HLApp.rerender(); }
      });
    });
    var form = document.getElementById("quick-add");
    if (form) form.addEventListener("submit", function (e) {
      e.preventDefault();
      var d = window.HLApp.getData();
      var desc = document.getElementById("qa-desc").value.trim();
      var amt = parseFloat(document.getElementById("qa-amt").value);
      var date = document.getElementById("qa-date").value;
      var cat = document.getElementById("qa-cat").value;
      var type = document.getElementById("qa-type").value;
      if (!desc || !(amt > 0) || !date) return;
      d.transactions.push({
        id: D.nextId(d.transactions), date: date, desc: desc,
        category: type === "income" ? "Income" : cat, amount: amt, type: type
      });
      D.save(d);
      window.HLApp.rerender();
    });
  }

  window.HLViews = window.HLViews || {};
  window.HLViews.dashboard = { render: render, mount: mount };
})();
