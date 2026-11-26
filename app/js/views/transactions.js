/* HomeLedger view: Transactions. One job: every dollar, searchable. */
(function () {
  "use strict";
  var F = window.HLFmt, D = window.HLData;

  // UI state kept on the view (not persisted): search, filters, sort.
  var ui = { q: "", cat: "all", type: "all", sort: "date-desc" };

  function render(data) {
    var m = data.month;
    var rows = D.monthTx(data, m).slice();
    if (ui.q) {
      var q = ui.q.toLowerCase();
      rows = rows.filter(function (t) { return t.desc.toLowerCase().indexOf(q) !== -1; });
    }
    if (ui.cat !== "all") rows = rows.filter(function (t) { return t.category === ui.cat; });
    if (ui.type !== "all") rows = rows.filter(function (t) { return t.type === ui.type; });
    rows.sort(function (a, b) {
      if (ui.sort === "date-asc") return a.date.localeCompare(b.date) || a.id - b.id;
      if (ui.sort === "amount-desc") return b.amount - a.amount;
      if (ui.sort === "amount-asc") return a.amount - b.amount;
      return b.date.localeCompare(a.date) || b.id - a.id;
    });

    // Running balance: start from income minus spending, walk newest-first.
    var balance = D.sumIncome(data, m) - D.sumSpending(data, m);
    var body = rows.map(function (t) {
      var cls = t.type === "income" ? "pos" : "neg";
      var sign = t.type === "income" ? "+" : "−";
      var shown = balance;
      balance -= (t.type === "income" ? t.amount : -t.amount);
      return '<tr><td>' + F.shortDate(t.date) + "</td><td>" + F.esc(t.desc) + "</td><td>" +
        F.esc(t.category) + '</td><td class="num ' + cls + '">' + sign + F.money(t.amount) + '</td>' +
        '<td class="num">' + F.money(shown) + '</td><td class="num">' +
        '<button type="button" class="btn btn-ghost btn-small" data-edit-tx="' + t.id + '">Edit</button> ' +
        '<button type="button" class="btn btn-danger btn-small" data-del-tx="' + t.id + '">Delete</button></td></tr>';
    }).join("");

    var catOptions = ['<option value="all">All categories</option>'].concat(
      D.CATEGORIES.concat(["Income"]).map(function (c) {
        return '<option value="' + F.esc(c) + '"' + (ui.cat === c ? " selected" : "") + ">" + F.esc(c) + "</option>";
      })).join("");
    var sortOptions = [
      ["date-desc", "Newest first"], ["date-asc", "Oldest first"],
      ["amount-desc", "Largest amount"], ["amount-asc", "Smallest amount"]
    ].map(function (o) {
      return '<option value="' + o[0] + '"' + (ui.sort === o[0] ? " selected" : "") + ">" + o[1] + "</option>";
    }).join("");

    return '' +
      '<div class="page-head"><h1>Transactions</h1><p>' + F.monthName(m) + " &middot; " + rows.length + " shown &middot; balance " + F.money(D.sumIncome(data, m) - D.sumSpending(data, m)) + "</p></div>" +
      '<div class="card span12"><div class="toolbar">' +
      '<span class="field"><label for="tx-q">Search</label><input id="tx-q" type="search" placeholder="Search description…" value="' + F.esc(ui.q) + '"></span>' +
      '<span class="field"><label for="tx-cat">Category</label><select id="tx-cat">' + catOptions + '</select></span>' +
      '<span class="field"><label for="tx-type">Type</label><select id="tx-type">' +
      '<option value="all"' + (ui.type === "all" ? " selected" : "") + '>All</option>' +
      '<option value="expense"' + (ui.type === "expense" ? " selected" : "") + '>Expenses</option>' +
      '<option value="income"' + (ui.type === "income" ? " selected" : "") + '>Income</option></select></span>' +
      '<span class="field"><label for="tx-sort">Sort</label><select id="tx-sort">' + sortOptions + '</select></span>' +
      '</div>' +
      (rows.length ? '<table><thead><tr><th>Date</th><th>Description</th><th>Category</th><th class="num">Amount</th><th class="num">Balance after</th><th class="num">Actions</th></tr></thead><tbody>' + body + "</tbody></table>"
        : '<p class="empty">No transactions match. Try clearing the search or filters.</p>') +
      '</div>' +
      '<div class="card span12" style="margin-top:16px"><h2>Add a transaction</h2>' +
      '<form id="tx-add" class="inline">' +
      '<span class="field"><label for="tx-date">Date</label><input id="tx-date" type="date" value="2026-11-26" required></span>' +
      '<span class="field"><label for="tx-desc">Description</label><input id="tx-desc" type="text" placeholder="e.g. Weekly shop" required></span>' +
      '<span class="field"><label for="tx-cat2">Category</label><select id="tx-cat2">' + D.CATEGORIES.map(function (c) { return '<option value="' + F.esc(c) + '">' + F.esc(c) + "</option>"; }).join("") + '</select></span>' +
      '<span class="field"><label for="tx-amt">Amount ($)</label><input id="tx-amt" type="number" min="0.01" step="0.01" placeholder="0.00" required></span>' +
      '<span class="field"><label for="tx-type2">Type</label><select id="tx-type2"><option value="expense">Expense</option><option value="income">Income</option></select></span>' +
      '<button class="btn" type="submit">Add transaction</button></form></div>' +
      '<div class="card span12" id="tx-edit-wrap" style="margin-top:16px; display:none"><h2>Edit transaction</h2>' +
      '<form id="tx-edit" class="inline">' +
      '<input id="tx-edit-id" type="hidden">' +
      '<span class="field"><label for="tx-edit-date">Date</label><input id="tx-edit-date" type="date" required></span>' +
      '<span class="field"><label for="tx-edit-desc">Description</label><input id="tx-edit-desc" type="text" required></span>' +
      '<span class="field"><label for="tx-edit-cat">Category</label><select id="tx-edit-cat">' + D.CATEGORIES.concat(["Income"]).map(function (c) { return '<option value="' + F.esc(c) + '">' + F.esc(c) + "</option>"; }).join("") + '</select></span>' +
      '<span class="field"><label for="tx-edit-amt">Amount ($)</label><input id="tx-edit-amt" type="number" min="0.01" step="0.01" required></span>' +
      '<span class="field"><label for="tx-edit-type">Type</label><select id="tx-edit-type"><option value="expense">Expense</option><option value="income">Income</option></select></span>' +
      '<button class="btn" type="submit">Save changes</button> ' +
      '<button class="btn btn-ghost" type="button" id="tx-edit-cancel">Cancel</button></form></div>';
  }

  function mount(data) {
    function bind(id, ev, fn) { var el = document.getElementById(id); if (el) el.addEventListener(ev, fn); }
    bind("tx-q", "input", function (e) { ui.q = e.target.value; window.HLApp.rerender(true); });
    bind("tx-cat", "change", function (e) { ui.cat = e.target.value; window.HLApp.rerender(); });
    bind("tx-type", "change", function (e) { ui.type = e.target.value; window.HLApp.rerender(); });
    bind("tx-sort", "change", function (e) { ui.sort = e.target.value; window.HLApp.rerender(); });

    document.querySelectorAll("[data-del-tx]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var d = window.HLApp.getData();
        var id = parseInt(btn.getAttribute("data-del-tx"), 10);
        d.transactions = d.transactions.filter(function (t) { return t.id !== id; });
        D.save(d); window.HLApp.rerender();
      });
    });
    document.querySelectorAll("[data-edit-tx]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var d = window.HLApp.getData();
        var t = d.transactions.find(function (x) { return x.id === parseInt(btn.getAttribute("data-edit-tx"), 10); });
        if (!t) return;
        document.getElementById("tx-edit-wrap").style.display = "";
        document.getElementById("tx-edit-id").value = t.id;
        document.getElementById("tx-edit-date").value = t.date;
        document.getElementById("tx-edit-desc").value = t.desc;
        document.getElementById("tx-edit-cat").value = t.category;
        document.getElementById("tx-edit-amt").value = t.amount;
        document.getElementById("tx-edit-type").value = t.type;
        document.getElementById("tx-edit-wrap").scrollIntoView();
      });
    });
    bind("tx-edit-cancel", "click", function () {
      document.getElementById("tx-edit-wrap").style.display = "none";
    });
    bind("tx-edit", "submit", function (e) {
      e.preventDefault();
      var d = window.HLApp.getData();
      var id = parseInt(document.getElementById("tx-edit-id").value, 10);
      var t = d.transactions.find(function (x) { return x.id === id; });
      if (!t) return;
      t.date = document.getElementById("tx-edit-date").value;
      t.desc = document.getElementById("tx-edit-desc").value.trim();
      t.category = document.getElementById("tx-edit-cat").value;
      t.amount = parseFloat(document.getElementById("tx-edit-amt").value);
      t.type = document.getElementById("tx-edit-type").value;
      D.save(d); window.HLApp.rerender();
    });
    bind("tx-add", "submit", function (e) {
      e.preventDefault();
      var d = window.HLApp.getData();
      var desc = document.getElementById("tx-desc").value.trim();
      var amt = parseFloat(document.getElementById("tx-amt").value);
      var date = document.getElementById("tx-date").value;
      if (!desc || !(amt > 0) || !date) return;
      var type = document.getElementById("tx-type2").value;
      d.transactions.push({
        id: D.nextId(d.transactions), date: date, desc: desc,
        category: type === "income" ? "Income" : document.getElementById("tx-cat2").value,
        amount: amt, type: type
      });
      D.save(d); window.HLApp.rerender();
    });
  }

  window.HLViews = window.HLViews || {};
  window.HLViews.transactions = { render: render, mount: mount };
})();
