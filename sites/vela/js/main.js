/**
 * Vela — drawn bottle with living liquid, note layers, a wear clock and a
 * sample request. The liquid's colour follows the chosen layer.
 */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = matchMedia("(hover: hover) and (pointer: fine)").matches;

  function t(key, vars) {
    var out = I18N.t(window.SITE_I18N, key);
    if (vars) Object.keys(vars).forEach(function (k) { out = out.split("{" + k + "}").join(vars[k]); });
    return out;
  }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  // note layers: colours for the liquid, and how strong each note is
  var LAYERS = {
    top: { colors: ["#f2a65a", "#a2406a"], notes: [["orange", 80], ["pepper", 60], ["match", 35]] },
    heart: { colors: ["#e7b3ff", "#5a1f86"], notes: [["tuberose", 95], ["jasmine", 75], ["plum", 50]] },
    base: { colors: ["#8a6bb8", "#1d0f33"], notes: [["ink", 85], ["suede", 70], ["smoke", 55], ["amber", 45]] }
  };
  // when each note is present on skin, in hours: [appears, peaks, fades out]
  var LIFE = {
    orange: [0, 0, 0.6], pepper: [0, 0.1, 1], match: [0, 0.2, 1.4],
    tuberose: [0.2, 1.5, 6], jasmine: [0.3, 1.2, 5], plum: [0.5, 2, 6.5],
    ink: [1, 4, 12], suede: [1.5, 5, 12], smoke: [2, 6, 11], amber: [2.5, 8, 12]
  };

  /* ───────── header ───────── */

  var toggle = $(".nav-toggle"), nav = $("#nav");
  toggle.addEventListener("click", function () {
    var open = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
  });
  nav.addEventListener("click", function (e) { if (e.target.closest("a")) { toggle.setAttribute("aria-expanded", "false"); nav.classList.remove("is-open"); } });
  addEventListener("scroll", function () { $(".site-header").classList.toggle("is-solid", scrollY > 40); }, { passive: true });

  /* ───────── stars ───────── */

  (function stars() {
    var box = $(".stars"), html = "";
    for (var i = 0; i < 70; i++) {
      html += '<i style="left:' + (Math.random() * 100).toFixed(2) + "%;top:" + (Math.random() * 100).toFixed(2) + "%;animation-delay:" + (Math.random() * 4).toFixed(2) + "s;opacity:" + (0.2 + Math.random() * 0.7).toFixed(2) + '"></i>';
    }
    box.innerHTML = html;
  })();

  /* ───────── the bottle ───────── */

  var liquid = $("[data-liquid]");
  var wrap = $("[data-bottle-wrap]");
  var tilt = 0, tiltTarget = 0, level = 196;
  function wave(time) {
    var amp = 6 + Math.abs(tilt) * 0.6;
    var y = level, a = Math.sin(time / 900) * amp, b = Math.cos(time / 700) * amp;
    var left = y - tilt * 1.6, right = y + tilt * 1.6;
    liquid.setAttribute("d", "M0 " + left + " Q60 " + (left - a) + " 120 " + y + " T240 " + (right + b * 0.3) + " V420 H0 Z");
  }
  (function loop(time) {
    tilt += (tiltTarget - tilt) * 0.06;
    wave(reduced ? 0 : time);
    if (!reduced) requestAnimationFrame(loop);
  })(0);
  if (fine && !reduced) {
    addEventListener("pointermove", function (e) {
      var x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5;
      tiltTarget = x * 14;
      wrap.style.transform = "rotateY(" + x * 14 + "deg) rotateX(" + -y * 8 + "deg) rotateZ(" + x * 3 + "deg)";
    });
  }
  function setJuice(layer) {
    var c = LAYERS[layer].colors;
    document.documentElement.style.setProperty("--juice-top", c[0]);
    document.documentElement.style.setProperty("--juice-bottom", c[1]);
    $("[data-bottle-tag]").textContent = t("l." + layer);
  }

  /* ───────── note layers ───────── */

  var layer = "heart";
  function paintLayers() {
    $("[data-layer-tabs]").innerHTML = Object.keys(LAYERS).map(function (k) {
      return '<button type="button" role="tab" aria-selected="' + (k === layer) + '" data-layer="' + k + '">' + esc(t("l." + k)) + "</button>";
    }).join("");
    var L = LAYERS[layer];
    $("[data-layer-panel]").innerHTML = '<p class="layer-desc">' + esc(t("ld." + layer)) + '</p><ul class="note-list">' + L.notes.map(function (n, i) {
      return '<li style="--i:' + i + '"><span class="note-name">' + esc(t("n." + n[0])) + '</span><span class="bar" role="img" aria-label="' + esc(t("intensity") + " " + n[1] + "%") + '"><i style="--w:' + n[1] + '%"></i></span></li>';
    }).join("") + "</ul>";
    setJuice(layer);
  }
  $("[data-layer-tabs]").addEventListener("click", function (e) {
    var b = e.target.closest("[data-layer]");
    if (!b) return;
    layer = b.getAttribute("data-layer");
    paintLayers();
  });
  $("[data-layer-tabs]").addEventListener("keydown", function (e) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    var keys = Object.keys(LAYERS), i = keys.indexOf(layer);
    layer = keys[(i + (e.key === "ArrowRight" ? 1 : -1) + keys.length) % keys.length];
    paintLayers();
    $('[data-layer="' + layer + '"]').focus();
  });

  /* ───────── wear clock ───────── */

  var wear = $("[data-wear]");
  function presence(note, h) {
    var l = LIFE[note], a = l[0], p = l[1], z = l[2];
    if (h < a || h > z) return 0;
    if (h <= p) return p === a ? 1 : 0.35 + 0.65 * (h - a) / (p - a);
    return 1 - (h - p) / (z - p);
  }
  function paintWear() {
    var h = +wear.value;
    $("[data-wear-label]").textContent = h === 0 ? t("justSprayed") : t("hoursAfter", { h: String(h).replace(".", I18N.lang === "pt" ? "," : ".") });
    var moment = h < 0.6 ? "m.0" : h < 3 ? "m.1" : h < 7 ? "m.4" : "m.8";
    $("[data-wear-moment]").textContent = t(moment);
    $("[data-trail]").innerHTML = Object.keys(LIFE).map(function (n) {
      var v = presence(n, h);
      var group = LAYERS.top.notes.some(function (x) { return x[0] === n; }) ? "top" : LAYERS.heart.notes.some(function (x) { return x[0] === n; }) ? "heart" : "base";
      return '<li class="' + group + (v > 0 ? " on" : "") + '" style="--v:' + v.toFixed(2) + '"><span>' + esc(t("n." + n)) + "</span></li>";
    }).join("");
    // the bottle follows: the dominant layer at this hour colours the juice
    var dominant = h < 0.6 ? "top" : h < 4 ? "heart" : "base";
    if (document.activeElement === wear) { layer = dominant; paintLayers(); }
  }
  wear.addEventListener("input", paintWear);

  /* ───────── formats + sample request ───────── */

  var FORMATS = [
    { id: "sample", price: 0, left: null },
    { id: "travel", price: 38, left: 42 },
    { id: "full", price: 190, left: 17 }
  ];
  var format = "sample";
  function priceText(f) { return f.price ? f.price + " €" : t("free"); }
  function paintFormats() {
    $("[data-formats]").innerHTML = FORMATS.map(function (f) {
      return '<button type="button" role="radio" class="format f-' + f.id + '" aria-checked="' + (f.id === format) + '" data-format="' + f.id + '">' +
        '<span class="f-vial" aria-hidden="true"></span>' +
        '<span class="f-name">' + esc(t("f." + f.id)) + '</span><span class="f-price">' + esc(priceText(f)) + (f.price ? "" : ' <small>' + esc(t("postage")) + "</small>") + "</span>" +
        '<span class="f-desc">' + esc(t("fd." + f.id)) + "</span>" +
        (f.left ? '<span class="f-left">' + esc(t("left", { n: f.left })) + "</span>" : "") + "</button>";
    }).join("");
    var f = FORMATS.filter(function (x) { return x.id === format; })[0];
    $("[data-total]").textContent = t("totalLine", { name: t("f." + f.id), price: priceText(f) + (f.price ? "" : " " + t("postage")) });
  }
  $("[data-formats]").addEventListener("click", function (e) {
    var b = e.target.closest("[data-format]");
    if (b) { format = b.getAttribute("data-format"); paintFormats(); }
  });
  $("[data-sample]").addEventListener("submit", function (e) {
    e.preventDefault();
    var f = e.target.elements, note = $("[data-note]");
    if (!f.name.value.trim()) { note.textContent = t("errName"); f.name.focus(); return; }
    if (!f.email.value || !f.email.checkValidity()) { note.textContent = t("errEmail"); f.email.focus(); return; }
    note.textContent = t("sent", { name: f.name.value.trim().split(" ")[0], format: t("f." + format).toLowerCase() });
    e.target.reset();
  });

  /* ───────── language + reveal ───────── */

  function paintAll() {
    paintLayers();
    paintWear();
    paintFormats();
    $$("[data-i18n-alt]").forEach(function (el) { el.alt = t(el.getAttribute("data-i18n-alt")); });
  }
  paintAll();
  document.addEventListener("langchange", paintAll);

  if ("IntersectionObserver" in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.2 });
    $$(".notes, .wear, .making, .formats").forEach(function (el) { el.classList.add("reveal"); io.observe(el); });
  }
})();
