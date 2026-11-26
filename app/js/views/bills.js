/* HomeLedger view: Bills. One job: never miss a due date. */
(function () {
  "use strict";
  var F = window.HLFmt, D = window.HLData;

  function render(data) {
    var bills = data.bills.slice().sort(function (a, b) { return a.dueDay - b.dueDay; });
    var total = bills.reduce(function (s, b) { return s + b.amount; }, 0);
    var unpaid = bills.filter(function (b) { return !b.paid; })
      .reduce(function (s, b) { return s + b.amount; }, 0);
    var paidCount = bills.filter(function (b) { return b.paid; }).length;

    var rows = bills.map(function (b) {
      var badge = b.paid
        ? '<span class="badge badge-green">Paid</span>'
        : '<span class="badge badge-amber">Due Nov ' + b.dueDay + "</span>";
      var btn = b.paid
        ? '<button type="button" class="btn btn-ghost btn-small" data-unpay-bill="' + b.id + '">Mark unpaid</button>'
        : '<button type="button" class="btn btn-small" data-pay-bill="' + b.id + '">Mark paid</button>';
      return '<tr><td><strong>' + F.esc(b.name) + '</strong><br><span class="sub">' + F.esc(b.category) + "</span></td>" +
        '<td class="num">' + F.money(b.amount) + '</td><td>Nov ' + b.dueDay + "</td><td>" + badge + "</td>" +
        '<td class="num">' + btn + ' <button type="button" class="btn btn-danger btn-small" data-del-bill="' + b.id + '">Delete</button></td></tr>';
    }).join("");

    return '' +
      '<div class="page-head"><h1>Bills</h1><p>' + paidCount + " of " + bills.length + " paid &middot; " + F.money(unpaid) + " still due &middot; " + F.money(total) + " total per month</p></div>" +
      '<div class="card span12"><h2>Recurring bills — November</h2>' +
      '<table><thead><tr><th>Bill</th><th class="num">Amount</th><th>Due</th><th>Status</th><th class="num">Actions</th></tr></thead><tbody>' + rows + "</tbody></table></div>" +
      '<div class="card span12" style="margin-top:16px"><h2>Add a bill</h2>' +
      '<form id="bill-add" class="inline">' +
      '<span class="field"><label for="bill-name">Bill name</label><input id="bill-name" type="text" placeholder="e.g. Water — City Water" required></span>' +
      '<span class="field"><label for="bill-amt">Amount ($)</label><input id="bill-amt" type="number" min="0.01" step="0.01" placeholder="0.00" required></span>' +
      '<span class="field"><label for="bill-day">Due day</label><input id="bill-day" type="number" min="1" max="31" value="1" required></span>' +
      '<span class="field"><label for="bill-cat">Category</label><select id="bill-cat">' + D.CATEGORIES.map(function (c) { return '<option value="' + F.esc(c) + '">' + F.esc(c) + "</option>"; }).join("") + '</select></span>' +
      '<button class="btn" type="submit">Add bill</button></form></div>';
  }

  function mount(data) {
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
    document.querySelectorAll("[data-del-bill]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var d = window.HLApp.getData();
        var id = parseInt(btn.getAttribute("data-del-bill"), 10);
        d.bills = d.bills.filter(function (b) { return b.id !== id; });
        D.save(d); window.HLApp.rerender();
      });
    });
    var form = document.getElementById("bill-add");
    if (form) form.addEventListener("submit", function (e) {
      e.preventDefault();
      var d = window.HLApp.getData();
      var name = document.getElementById("bill-name").value.trim();
      var amt = parseFloat(document.getElementById("bill-amt").value);
      var day = parseInt(document.getElementById("bill-day").value, 10);
      if (!name || !(amt > 0) || !(day >= 1 && day <= 31)) return;
      d.bills.push({
        id: D.nextId(d.bills), name: name, amount: amt, dueDay: day,
        category: document.getElementById("bill-cat").value, paid: false
      });
      D.save(d); window.HLApp.rerender();
    });
  }

  window.HLViews = window.HLViews || {};
  window.HLViews.bills = { render: render, mount: mount };
})();
