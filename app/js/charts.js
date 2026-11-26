/* HomeLedger charts: canvas donut, bars and trend lines. One job: draw.
 * Widths adapt to the card they sit in so nothing overflows on a phone. */
(function () {
  "use strict";

  // Scale a canvas for crisp rendering. Width is the design width, shrunk
  // to fit the card on narrow screens; returns {ctx, w, h} in CSS pixels.
  function ctx2d(canvas, designW, designH) {
    var avail = designW;
    if (canvas.parentElement) {
      // .card padding is 20px each side.
      avail = canvas.parentElement.clientWidth - 40;
    }
    var cssW = Math.max(220, Math.min(designW, avail));
    var dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(designH * dpr);
    canvas.style.width = cssW + "px";
    canvas.style.height = designH + "px";
    var ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx: ctx, w: cssW, h: designH };
  }

  function drawDonut(canvas, slices) {
    // slices: [{label, value, color}] — values > 0 only
    var data = slices.filter(function (s) { return s.value > 0; });
    var total = data.reduce(function (s, x) { return s + x.value; }, 0);
    var g = ctx2d(canvas, 260, 260);
    var ctx = g.ctx;
    var cx = g.w / 2, cy = g.h / 2;
    var r = Math.min(105, g.w / 2 - 8), inner = Math.round(r * 0.59);
    if (total <= 0) {
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = "#e3dcc9"; ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, inner, 0, Math.PI * 2);
      ctx.fillStyle = "#fffdf7"; ctx.fill();
      return;
    }
    var start = -Math.PI / 2;
    data.forEach(function (s) {
      var sweep = (s.value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, start + sweep);
      ctx.closePath();
      ctx.fillStyle = s.color;
      ctx.fill();
      start += sweep;
    });
    ctx.beginPath(); ctx.arc(cx, cy, inner, 0, Math.PI * 2);
    ctx.fillStyle = "#fffdf7"; ctx.fill();
    ctx.fillStyle = "#14532d";
    ctx.font = "800 22px -apple-system, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("$" + Math.round(total).toLocaleString("en-US"), cx, cy - 8);
    ctx.fillStyle = "#5b6672";
    ctx.font = "13px -apple-system, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText("spent this month", cx, cy + 16);
  }

  function drawBars(canvas, labels, values, color) {
    var g = ctx2d(canvas, 520, 240);
    var ctx = g.ctx, W = g.w, H = g.h;
    var max = Math.max.apply(null, values.concat([1]));
    var padL = 44, padB = 26, padT = 14, padR = 8;
    var w = W - padL - padR, h = H - padT - padB;
    ctx.font = "12px -apple-system, 'Segoe UI', Roboto, sans-serif";
    ctx.fillStyle = "#5b6672"; ctx.textAlign = "right"; ctx.textBaseline = "middle";
    [0, 0.5, 1].forEach(function (f) {
      var y = padT + h - f * h;
      ctx.fillText("$" + Math.round(max * f).toLocaleString("en-US"), padL - 6, y);
      ctx.strokeStyle = "#e3dcc9"; ctx.beginPath();
      ctx.moveTo(padL, y); ctx.lineTo(padL + w, y); ctx.stroke();
    });
    var slot = w / values.length;
    var bw = Math.min(46, slot * 0.6);
    values.forEach(function (v, i) {
      var bh = (v / max) * h;
      var x = padL + i * slot + (slot - bw) / 2;
      var y = padT + h - bh;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, bw, bh);
      ctx.fillStyle = "#1f2937"; ctx.textAlign = "center"; ctx.textBaseline = "top";
      ctx.fillText("$" + Math.round(v).toLocaleString("en-US"), x + bw / 2, y - 15 < padT ? padT : y - 15);
      ctx.fillStyle = "#5b6672";
      ctx.fillText(labels[i], x + bw / 2, padT + h + 6);
    });
  }

  function drawTrend(canvas, labels, income, spending) {
    var g = ctx2d(canvas, 520, 260);
    var ctx = g.ctx, W = g.w, H = g.h;
    var all = income.concat(spending);
    var max = Math.max.apply(null, all.concat([1])) * 1.08;
    var padL = 48, padB = 26, padT = 16, padR = 12;
    var w = W - padL - padR, h = H - padT - padB;
    function X(i) { return padL + (i / (labels.length - 1)) * w; }
    function Y(v) { return padT + h - (v / max) * h; }
    ctx.font = "12px -apple-system, 'Segoe UI', Roboto, sans-serif";
    ctx.fillStyle = "#5b6672"; ctx.textAlign = "right"; ctx.textBaseline = "middle";
    [0, 0.5, 1].forEach(function (f) {
      var y = padT + h - f * h;
      ctx.fillText("$" + Math.round(max * f).toLocaleString("en-US"), padL - 6, y);
      ctx.strokeStyle = "#e3dcc9"; ctx.beginPath();
      ctx.moveTo(padL, y); ctx.lineTo(padL + w, y); ctx.stroke();
    });
    function line(series, color) {
      ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.lineJoin = "round";
      ctx.beginPath();
      series.forEach(function (v, i) { if (i === 0) ctx.moveTo(X(i), Y(v)); else ctx.lineTo(X(i), Y(v)); });
      ctx.stroke();
      ctx.fillStyle = color;
      series.forEach(function (v, i) {
        ctx.beginPath(); ctx.arc(X(i), Y(v), 4.5, 0, Math.PI * 2); ctx.fill();
      });
      ctx.lineWidth = 1;
    }
    line(income, "#1d6b3c");
    line(spending, "#b45309");
    ctx.fillStyle = "#5b6672"; ctx.textAlign = "center"; ctx.textBaseline = "top";
    labels.forEach(function (l, i) { ctx.fillText(l, X(i), padT + h + 6); });
  }

  window.HLCharts = {
    drawDonut: drawDonut, drawBars: drawBars, drawTrend: drawTrend
  };
})();
