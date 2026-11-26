/* HomeLedger bootstrap: load data, render, wire the footer. */
(function () {
  "use strict";

  var data = window.HLData.load();

  window.HLApp = {
    getData: function () { return data; },
    rerender: function (keepFocus) {
      data = window.HLData.load();
      window.HLRouter.render(!!keepFocus);
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    window.HLRouter.render(false);
    var reset = document.getElementById("reset-demo");
    if (reset) reset.addEventListener("click", function () {
      if (window.confirm("Reset all demo data back to the seeded November 2026 example?")) {
        data = window.HLData.reset();
        window.HLRouter.render(false);
      }
    });
  });
})();
