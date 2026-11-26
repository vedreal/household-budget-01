/* HomeLedger formatting: money and dates. One job: make numbers readable. */
(function () {
  "use strict";

  var usd = new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2
  });
  var usd0 = new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0
  });
  var pct = new Intl.NumberFormat("en-US", {
    style: "percent", minimumFractionDigits: 0, maximumFractionDigits: 1
  });

  function money(n) { return usd.format(n); }
  function money0(n) { return usd0.format(n); }
  function percent(ratio) { return pct.format(ratio); }

  var MONTHS = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  var MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // "2026-11" -> "November 2026"
  function monthName(ym) {
    var parts = ym.split("-");
    return MONTHS[parseInt(parts[1], 10) - 1] + " " + parts[0];
  }
  // "2026-11" -> "Nov"
  function monthShort(ym) {
    return MONTHS_SHORT[parseInt(ym.split("-")[1], 10) - 1];
  }
  // "2026-11-24" -> "Nov 24"
  function shortDate(iso) {
    var parts = iso.split("-");
    return MONTHS_SHORT[parseInt(parts[1], 10) - 1] + " " + parseInt(parts[2], 10);
  }
  // shift a "YYYY-MM" by n months
  function shiftMonth(ym, n) {
    var parts = ym.split("-");
    var d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1 + n, 1);
    var m = d.getMonth() + 1;
    return d.getFullYear() + "-" + (m < 10 ? "0" + m : "" + m);
  }

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  window.HLFmt = {
    money: money, money0: money0, percent: percent,
    monthName: monthName, monthShort: monthShort, shortDate: shortDate,
    shiftMonth: shiftMonth, esc: esc
  };
})();
