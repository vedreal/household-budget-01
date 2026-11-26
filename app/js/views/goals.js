/* HomeLedger view: Goals. One job: saving, made visible. */
(function () {
  "use strict";
  var F = window.HLFmt, D = window.HLData;

  function render(data) {
    var totalSaved = data.goals.reduce(function (s, g) { return s + g.saved; }, 0);
    var totalTarget = data.goals.reduce(function (s, g) { return s + g.target; }, 0);

    var cards = data.goals.map(function (g) {
      var p = Math.min(100, Math.round(g.saved / g.target * 100));
      var left = Math.max(0, g.target - g.saved);
      return '<div class="card span6"><h2>' + F.esc(g.name) + '</h2><p class="hint">' + F.esc(g.note || "") + "</p>" +
        '<div class="stat-value">' + F.money(g.saved) + ' <span style="font-size:16px;color:var(--muted)">of ' + F.money(g.target) + "</span></div>" +
        '<div class="bar" style="margin:10px 0 6px"><i style="width:' + p + '%"></i></div>' +
        '<p>' + p + "% funded &middot; " + F.money(left) + " to go</p>" +
        '<form class="inline" data-contrib-form="' + g.id + '">' +
        '<span class="field"><label>Add a contribution ($)</label><input type="number" min="0.01" step="0.01" placeholder="0.00" data-contrib-amt="' + g.id + '" required></span>' +
        '<button class="btn btn-amber" type="submit">Add to goal</button></form>' +
        '<p style="margin-top:10px"><button type="button" class="btn btn-danger btn-small" data-del-goal="' + g.id + '">Delete goal</button></p></div>';
    }).join("");

    return '' +
      '<div class="page-head"><h1>Savings goals</h1><p>' + F.money(totalSaved) + " saved toward " + F.money(totalTarget) + " across " + data.goals.length + " goals</p></div>" +
      '<div class="grid">' + cards + "</div>" +
      '<div class="card span12" style="margin-top:16px"><h2>Add a savings goal</h2>' +
      '<form id="goal-add" class="inline">' +
      '<span class="field"><label for="goal-name">Goal name</label><input id="goal-name" type="text" placeholder="e.g. New laptop" required></span>' +
      '<span class="field"><label for="goal-target">Target ($)</label><input id="goal-target" type="number" min="1" step="1" placeholder="1000" required></span>' +
      '<span class="field"><label for="goal-saved">Already saved ($)</label><input id="goal-saved" type="number" min="0" step="1" value="0"></span>' +
      '<span class="field"><label for="goal-note">Note</label><input id="goal-note" type="text" placeholder="e.g. By next summer"></span>' +
      '<button class="btn" type="submit">Add goal</button></form></div>';
  }

  function mount(data) {
    document.querySelectorAll("[data-contrib-form]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var id = parseInt(form.getAttribute("data-contrib-form"), 10);
        var input = document.querySelector('[data-contrib-amt="' + id + '"]');
        var amt = parseFloat(input.value);
        if (!(amt > 0)) return;
        var d = window.HLApp.getData();
        var g = d.goals.find(function (x) { return x.id === id; });
        if (g) { g.saved = Math.round((g.saved + amt) * 100) / 100; D.save(d); window.HLApp.rerender(); }
      });
    });
    document.querySelectorAll("[data-del-goal]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var d = window.HLApp.getData();
        var id = parseInt(btn.getAttribute("data-del-goal"), 10);
        d.goals = d.goals.filter(function (g) { return g.id !== id; });
        D.save(d); window.HLApp.rerender();
      });
    });
    var form = document.getElementById("goal-add");
    if (form) form.addEventListener("submit", function (e) {
      e.preventDefault();
      var d = window.HLApp.getData();
      var name = document.getElementById("goal-name").value.trim();
      var target = parseFloat(document.getElementById("goal-target").value);
      var saved = parseFloat(document.getElementById("goal-saved").value) || 0;
      if (!name || !(target > 0)) return;
      d.goals.push({
        id: D.nextId(d.goals), name: name, target: target, saved: saved,
        note: document.getElementById("goal-note").value.trim()
      });
      D.save(d); window.HLApp.rerender();
    });
  }

  window.HLViews = window.HLViews || {};
  window.HLViews.goals = { render: render, mount: mount };
})();
