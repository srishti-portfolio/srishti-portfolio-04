/* =========================================================
   Witch sparkles
   1. A silver + burgundy spark trail follows the witch cursor.
   2. Wherever a visitor clicks, golden sparkles swirl out
      of the little witch on the cursor like a magic spell.
   ========================================================= */
(function () {
  "use strict";

  // Where the witch sits relative to the click point (the broom tip),
  // so the sprinkles come out of her and not off the tip.
  var WITCH_OFFSET_X = 20;
  var WITCH_OFFSET_Y = 3;

  // Where the end of the broom (the bristles) is, for the moving spark trail.
  var BROOM_END_X = 46;
  var BROOM_END_Y = 17;
  var TRAIL_COLORS = ["silver", "silver", "burgundy"]; // 2 silver : 1 burgundy
  var TRAIL_LIFETIME = 850;  // milliseconds each spark lasts
  var TRAIL_GAP = 22;        // milliseconds between sparks while moving
  var TRAIL_MAX = 45;        // most sparks on screen at once

  var COLORS = ["#F2C94C", "#FFD966", "#E8B84A", "#FFF1B8", "#D4A017"];
  var LIFETIME = 1100; // milliseconds each swirl sparkle lasts

  // Respect visitors who turned off animations in their system settings.
  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var layer = document.createElement("div");
  layer.setAttribute("aria-hidden", "true");
  layer.style.cssText =
    "position:fixed;inset:0;pointer-events:none;z-index:99999;overflow:hidden;";
  document.addEventListener("DOMContentLoaded", function () {
    document.body.appendChild(layer);
  });
  if (document.body) document.body.appendChild(layer);

  /* ---------- Magic swirl (golden sparkles on click) ---------- */
  var SWIRL_ARMS = 3;        // number of spiral arms
  var SWIRL_PER_ARM = 10;    // sparkles in each arm
  var SWIRL_RADIUS = 70;     // how far the swirl spreads (px)
  var SWIRL_TURNS = 1.1;     // how many times it twirls around
  var SWIRL_STAGGER = 35;    // ms between sparkles leaving along an arm

  function makeSwirlSparkle(i) {
    var el = document.createElement("span");
    var color = COLORS[(Math.random() * COLORS.length) | 0];
    var isStar = i % 3 === 0;
    var size;
    if (isStar) {
      size = 11 + Math.random() * 7;
      el.textContent = "✦";
      el.style.cssText = "font-size:" + size + "px;line-height:1;color:" + color +
        ";text-shadow:0 0 6px rgba(255,215,90,.95);";
    } else {
      size = 4 + Math.random() * 4;
      el.style.cssText = "width:" + size + "px;height:" + size +
        "px;border-radius:50%;background:" + color +
        ";box-shadow:0 0 6px " + color + ",0 0 2px #B8862B;";
    }
    el.style.position = "absolute";
    el.style.left = "0";
    el.style.top = "0";
    el.style.marginLeft = (-size / 2) + "px";
    el.style.marginTop = (-size / 2) + "px";
    el.style.opacity = "0";
    el.style.willChange = "transform,opacity";
    layer.appendChild(el);
    return el;
  }

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function burst(clientX, clientY) {
    if (reduceMotion) return;
    var cx = clientX + WITCH_OFFSET_X;
    var cy = clientY + WITCH_OFFSET_Y;
    var dir = Math.random() < 0.5 ? 1 : -1;   // twirl clockwise or anticlockwise
    var startAngle = Math.random() * Math.PI * 2;
    var parts = [];

    for (var arm = 0; arm < SWIRL_ARMS; arm++) {
      for (var j = 0; j < SWIRL_PER_ARM; j++) {
        parts.push({
          el: makeSwirlSparkle(arm * SWIRL_PER_ARM + j),
          angle0: startAngle + arm * (Math.PI * 2 / SWIRL_ARMS),
          delay: j * SWIRL_STAGGER,
          reach: SWIRL_RADIUS * (0.75 + Math.random() * 0.35),
          twinkle: Math.random() * Math.PI * 2
        });
      }
    }

    var start = performance.now();
    var total = LIFETIME + SWIRL_PER_ARM * SWIRL_STAGGER;

    function frame(now) {
      var elapsed = now - start;
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        var t = (elapsed - p.delay) / LIFETIME;
        if (t <= 0) continue;
        if (t >= 1) { p.el.style.opacity = "0"; continue; }
        var r = p.reach * easeOutCubic(t);
        var ang = p.angle0 + dir * SWIRL_TURNS * Math.PI * 2 * easeOutCubic(t);
        var x = cx + Math.cos(ang) * r;
        var y = cy + Math.sin(ang) * r * 0.85;
        var tw = 0.75 + 0.35 * Math.sin(p.twinkle + elapsed / 60);   // twinkle
        var scale = (t < 0.15 ? t / 0.15 : 1) * tw * (1 - t * 0.4);
        p.el.style.transform = "translate(" + x + "px," + y + "px) rotate(" +
          (ang * 57.3) + "deg) scale(" + scale + ")";
        p.el.style.opacity = String(t < 0.6 ? 1 : 1 - (t - 0.6) / 0.4);
      }
      if (elapsed < total) {
        requestAnimationFrame(frame);
      } else {
        for (var k = 0; k < parts.length; k++) parts[k].el.remove();
      }
    }
    requestAnimationFrame(frame);
  }

  /* ---------- Spark trail that follows the witch ---------- */
  var trail = [];
  var trailRunning = false;
  var lastSpark = 0;

  function makeTrailSpark(x, y) {
    var el = document.createElement("span");
    var isStar = Math.random() < 0.3;
    var color = TRAIL_COLORS[(Math.random() * TRAIL_COLORS.length) | 0];
    var size = isStar ? 11 + Math.random() * 6 : 4 + Math.random() * 3.5;

    if (isStar) {
      el.textContent = "✦";
      el.style.cssText = "font-size:" + size + "px;line-height:1;" + (color === "silver"
        ? "color:#C4C8D2;text-shadow:0 0 1px #6F7480,0 0 4px #fff;"
        : "color:#722F37;text-shadow:0 0 4px rgba(215,167,177,.9);");
    } else {
      el.style.cssText = "width:" + size + "px;height:" + size + "px;border-radius:50%;" +
        (color === "silver"
          ? "background:radial-gradient(circle at 35% 35%,#fff,#A3A8B4);box-shadow:0 0 0 1px rgba(95,100,112,.45),0 0 5px #fff;"
          : "background:#722F37;box-shadow:0 0 4px rgba(215,167,177,.9);");
    }
    el.style.position = "absolute";
    el.style.left = "0";
    el.style.top = "0";
    el.style.willChange = "transform,opacity";
    layer.appendChild(el);

    return {
      el: el,
      x: x + (Math.random() - 0.5) * 8,
      y: y + (Math.random() - 0.5) * 8,
      vx: (Math.random() - 0.5) * 0.6,
      vy: 0.3 + Math.random() * 0.6,   // drift gently downward
      born: performance.now()
    };
  }

  function runTrail(now) {
    for (var i = trail.length - 1; i >= 0; i--) {
      var s = trail[i];
      var t = (now - s.born) / TRAIL_LIFETIME;
      if (t >= 1) {
        s.el.remove();
        trail.splice(i, 1);
        continue;
      }
      s.x += s.vx;
      s.y += s.vy;
      var scale = 1 - t * 0.6;
      s.el.style.transform = "translate(" + s.x + "px," + s.y + "px) scale(" + scale + ")";
      s.el.style.opacity = String(1 - t * t);
    }
    if (trail.length) {
      requestAnimationFrame(runTrail);
    } else {
      trailRunning = false;
    }
  }

  document.addEventListener("pointermove", function (e) {
    if (reduceMotion || e.pointerType === "touch") return;
    var now = performance.now();
    if (now - lastSpark < TRAIL_GAP) return;
    lastSpark = now;
    if (trail.length >= TRAIL_MAX) {
      trail.shift().el.remove();
    }
    trail.push(makeTrailSpark(e.clientX + BROOM_END_X, e.clientY + BROOM_END_Y));
    if (!trailRunning) {
      trailRunning = true;
      requestAnimationFrame(runTrail);
    }
  }, { passive: true });

  /* ---------- Golden sparkles on every click, anywhere on the page ---------- */
  document.addEventListener("click", function (e) {
    // Keyboard "clicks" (Enter on a link) have no mouse position, so skip the sparkles there.
    if (e.detail === 0 && e.clientX === 0 && e.clientY === 0) return;
    burst(e.clientX, e.clientY);

    // Links that leave the page would navigate before anyone sees the
    // sparkles, so wait a moment before following them.
    var target = e.target.closest && e.target.closest("a[href]");
    if (!target) return;
    var href = target.getAttribute("href");
    var leavesPage = target.tagName === "A" && href && href.charAt(0) !== "#" &&
      target.target !== "_blank" && !target.hasAttribute("download") && !target.hasAttribute("data-portal") && !e.ctrlKey && !e.metaKey && !e.shiftKey &&
      e.button === 0 && !e.defaultPrevented && !reduceMotion;
    if (leavesPage) {
      e.preventDefault();
      setTimeout(function () { window.location.href = target.href; }, 450);
    }
  }, true);
})();
