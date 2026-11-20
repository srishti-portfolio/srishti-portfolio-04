/* =========================================================
   Site behaviour
   1. Typing animation for "I'm Srishti / Data Analyst"
      — plays once each time the site is opened, then stops.
   2. Skills flip cards — click / tap / Enter to flip.
   3. "Have a question?" popup form.
   ========================================================= */
(function () {
  "use strict";

  /* ---------- 1. Typing animation (plays once each time the site opens) ---------- */
  var TYPE_SPEED = 95;     // ms per letter
  var LINE_PAUSE = 400;    // ms pause between the two lines
  var START_DELAY = 700;   // ms before the first letter appears

  var root = document.documentElement;

  function typeHeroLines() {
    var lines = [document.getElementById("hero-title"), document.getElementById("hero-role")];
    if (!lines[0] || !lines[1]) { root.classList.remove("type-intro"); return; }

    // Keep each line's height so the page doesn't jump while typing.
    lines.forEach(function (el) { el.style.minHeight = el.offsetHeight + "px"; });

    // Collect every piece of text (including the coloured name) and empty it.
    var pieces = [];
    lines.forEach(function (el, lineIndex) {
      var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
      var node;
      while ((node = walker.nextNode())) {
        if (!node.nodeValue) continue;
        pieces.push({ node: node, text: node.nodeValue, line: lineIndex });
        node.nodeValue = "";
      }
    });

    var caret = document.createElement("span");
    caret.className = "typing-caret";
    caret.setAttribute("aria-hidden", "true");
    root.classList.remove("type-intro");

    var p = 0, c = 0;
    function step() {
      if (p >= pieces.length) {
        // Done: let the lines size themselves normally again.
        lines.forEach(function (el) { el.style.minHeight = ""; });
        setTimeout(function () { caret.remove(); }, 1600);
        return;
      }
      var piece = pieces[p];
      piece.node.parentNode.insertBefore(caret, piece.node.nextSibling);
      if (c < piece.text.length) {
        piece.node.nodeValue += piece.text.charAt(c);
        c++;
        setTimeout(step, TYPE_SPEED);
      } else {
        var next = pieces[p + 1];
        var newLine = next && next.line !== piece.line;
        p++; c = 0;
        setTimeout(step, newLine ? LINE_PAUSE : 0);
      }
    }
    setTimeout(step, START_DELAY);
  }

  // This script sits at the end of the page, so the hero is already there.
  if (root.classList.contains("type-intro")) typeHeroLines();

  /* ---------- 2. Flip cards ---------- */
  document.querySelectorAll(".flip-card").forEach(function (card) {
    card.setAttribute("role", "button");
    card.addEventListener("click", function () {
      card.classList.toggle("flipped");
    });
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        card.classList.toggle("flipped");
      }
    });
  });

  /* ---------- 3. "Have a question?" popup form ---------- */
  var modal = document.getElementById("question-modal");
  var openBtn = document.getElementById("open-question");
  var form = document.getElementById("question-form");
  if (!modal || !openBtn || !form) return;

  var status = document.getElementById("q-status");
  var submitBtn = form.querySelector('button[type="submit"]');
  var lastFocus = null;

  function setStatus(text, kind) {
    status.textContent = text;
    status.className = "qmodal-status" + (kind ? " " + kind : "");
  }

  function openModal(e) {
    if (e) e.preventDefault();
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    setTimeout(function () { form.email.focus(); }, 50);
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  openBtn.addEventListener("click", openModal);
  modal.querySelectorAll("[data-close]").forEach(function (el) {
    el.addEventListener("click", closeModal);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modal.hidden) closeModal();
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var email = form.email.value.trim();
    var subject = form.subject.value.trim();
    var message = form.message.value.trim();
    if (!email || !subject || !message) {
      setStatus("Please fill in your email, the subject and your message.", "err");
      (!email ? form.email : !subject ? form.subject : form.message).focus();
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("Please enter a valid email address, like name@example.com.", "err");
      form.email.focus();
      return;
    }
    if (form._honey.value) return; // a bot filled the hidden spam trap

    submitBtn.disabled = true;
    setStatus("Sending…");

    fetch(form.action, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        email: email,          // FormSubmit uses this as the reply-to address
        subject: subject,
        message: message,
        _subject: "Portfolio question: " + subject,
        _template: "table",
        _captcha: "false"
      })
    })
      .then(function (res) { return res.json().catch(function () { return {}; }); })
      .then(function (data) {
        if (data && String(data.success) === "true") {
          setStatus("Thank you! Your message has been sent.", "ok");
          form.reset();
          setTimeout(function () { if (!modal.hidden) closeModal(); setStatus(""); }, 2500);
        } else {
          throw new Error((data && data.message) || "Send failed");
        }
      })
      .catch(function (err) {
        var reason = (err && err.message) || "";
        if (window.console) console.warn("Question form:", reason);
        if (/activat/i.test(reason)) {
          // Only happens before the form is activated (the very first message).
          setStatus("This form is not activated yet. Site owner: open the \"Activate Form\" email from FormSubmit, then send the message again.", "err");
        } else {
          setStatus("Sorry, your message couldn't be sent right now. Please try again in a little while.", "err");
        }
      })
      .then(function () { submitBtn.disabled = false; });
  });
})();

/* ---------- 4. Magic way to the projects page ----------
   Used by the pumpkin in the Projects section and by
   "Data Analytics" in the Projects menu dropdown. */
(function () {
  "use strict";
  var portal = document.querySelector(".pumpkin-portal");
  var menuLinks = document.querySelectorAll(".nav-dropdown a[data-portal]");
  if (!portal && !menuLinks.length) return;

  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var GOLD = ["#F2C94C", "#FFD966", "#E8B84A", "#FFF1B8", "#D4A017"];
  var busy = false;
  var overlay = null;

  // Golden sparkles bursting up and out of the pumpkin.
  function spray(cx, cy) {
    var layer = document.createElement("div");
    layer.setAttribute("aria-hidden", "true");
    layer.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:99999;";
    document.body.appendChild(layer);
    var parts = [];
    for (var i = 0; i < 46; i++) {
      var el = document.createElement("span");
      var star = i % 3 === 0;
      var size = star ? 12 + Math.random() * 10 : 4 + Math.random() * 5;
      var color = GOLD[(Math.random() * GOLD.length) | 0];
      el.style.cssText = "position:absolute;left:0;top:0;will-change:transform,opacity;" + (star
        ? "font-size:" + size + "px;line-height:1;color:" + color + ";text-shadow:0 0 8px rgba(255,215,90,.95);"
        : "width:" + size + "px;height:" + size + "px;border-radius:50%;background:" + color + ";box-shadow:0 0 8px " + color + ";");
      if (star) el.textContent = "✦";
      layer.appendChild(el);
      var angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.3; // mostly upward
      var speed = 4 + Math.random() * 7;
      parts.push({ el: el, x: cx + (Math.random() - 0.5) * 40, y: cy, vx: Math.cos(angle) * speed,
                   vy: Math.sin(angle) * speed, r: Math.random() * 360, vr: (Math.random() - 0.5) * 16,
                   delay: Math.random() * 250 });
    }
    var start = performance.now();
    function frame(now) {
      var t = now - start;
      parts.forEach(function (p) {
        if (t < p.delay) return;
        p.vy += 0.16; p.vx *= 0.985;
        p.x += p.vx; p.y += p.vy; p.r += p.vr;
        var life = (t - p.delay) / 1300;
        p.el.style.transform = "translate(" + p.x + "px," + p.y + "px) rotate(" + p.r + "deg)";
        p.el.style.opacity = String(Math.max(0, 1 - life * life));
      });
      if (t < 1600) requestAnimationFrame(frame); else layer.remove();
    }
    requestAnimationFrame(frame);
  }

  // The spell: golden sparkles at (sx, sy), then a burgundy swirl grows
  // from (cx, cy) to fill the screen, then the projects page opens.
  function castSpell(url, cx, cy, sx, sy, swirlDelay) {
    if (busy) return;
    busy = true;
    if (reduceMotion) { window.location.href = url; return; }

    // 1. Golden sparkles burst out.
    spray(sx, sy);

    // 2. A burgundy swirl of magic grows and fills the screen.
    setTimeout(function () {
      overlay = document.createElement("div");
      overlay.className = "portal-overlay";
      overlay.innerHTML = "<span>✦</span>";
      overlay.style.clipPath = "circle(0px at " + cx + "px " + cy + "px)";
      document.body.appendChild(overlay);
      overlay.getBoundingClientRect(); // start the transition from the small circle
      overlay.style.clipPath = "circle(150vmax at " + cx + "px " + cy + "px)";
    }, swirlDelay);

    // 3. Land on the projects page.
    setTimeout(function () { window.location.href = url; }, swirlDelay + 850);
  }

  function isPlainClick(e) {
    return !(e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0); // let "open in new tab" work
  }

  // The pumpkin: wiggles and glows, sparkles pour out of it, the swirl grows from it.
  if (portal) {
    portal.addEventListener("click", function (e) {
      if (!isPlainClick(e)) return;
      e.preventDefault();
      if (busy) return;
      var box = portal.querySelector(".pumpkin-svg").getBoundingClientRect();
      portal.classList.add("is-casting");
      castSpell(portal.href, box.left + box.width / 2, box.top + box.height * 0.55,
                box.left + box.width / 2, box.top + box.height * 0.3, 550);
    });
  }

  // "Data Analytics" in the Projects menu: the link glows, sparkles burst from it,
  // and the swirl grows from the link.
  menuLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      if (!isPlainClick(e)) return;
      e.preventDefault();
      if (busy) return;
      var box = link.getBoundingClientRect();
      var cx = box.left + box.width / 2, cy = box.top + box.height / 2;
      link.classList.add("is-casting");
      castSpell(link.href, cx, cy, cx, cy, 420);
    });
  });

  // Coming back with the browser's Back button: tidy up so the magic works again.
  window.addEventListener("pageshow", function (e) {
    if (!e.persisted) return;
    busy = false;
    if (portal) portal.classList.remove("is-casting");
    menuLinks.forEach(function (l) { l.classList.remove("is-casting"); });
    if (overlay) { overlay.remove(); overlay = null; }
  });
})();

/* ---------- 5. Projects menu dropdown: close it once "Projects" is clicked ---------- */
(function () {
  "use strict";
  var item = document.querySelector(".has-dropdown");
  if (!item) return;
  var link = item.querySelector(":scope > .nav-link");

  link.addEventListener("click", function () {
    item.classList.add("dd-closed");
    link.blur(); // drop the focus so the menu doesn't stay open
  });
  // Next time the mouse comes back to "Projects", the menu can open again.
  item.addEventListener("mouseleave", function () {
    item.classList.remove("dd-closed");
  });
})();
