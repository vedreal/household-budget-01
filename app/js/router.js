/* HomeLedger router: hash routes, one job: show the right page. */
(function () {
  "use strict";

  var ROUTES = {
    "": "dashboard",
    "transactions": "transactions",
    "budget": "budget",
    "bills": "bills",
    "goals": "goals",
    "reports": "reports"
  };

  function currentRoute() {
    var hash = location.hash.replace(/^#\/?/, "");
    return ROUTES[hash] || "dashboard";
  }

  function render(keepFocus) {
    var data = window.HLApp.getData();
    var route = currentRoute();
    var view = window.HLViews[route];
    var el = document.getElementById("view");
    var focusId = null, focusVal = null, selStart = null;
    if (keepFocus && document.activeElement && document.activeElement.id) {
      focusId = document.activeElement.id;
      focusVal = document.activeElement.value;
      selStart = document.activeElement.selectionStart;
    }
    el.innerHTML = view.render(data);
    if (view.mount) view.mount(data);
    document.querySelectorAll(".mainnav a").forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("data-route") === (route === "dashboard" ? "" : route));
    });
    if (focusId) {
      var back = document.getElementById(focusId);
      if (back) {
        back.focus();
        if (focusVal !== null && back.value !== undefined) {
          back.value = focusVal;
          try { back.setSelectionRange(selStart, selStart); } catch (e) { /* not a text field */ }
        }
      }
    }
    window.scrollTo(0, 0);
  }

  window.HLRouter = { render: render, currentRoute: currentRoute };
  window.addEventListener("hashchange", function () { render(false); });
})();
