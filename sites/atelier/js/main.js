/**
 * Atelier Moura — a tailor's site where you draw the jacket.
 * The designer redraws an SVG jacket from your choices (cloth, lapel, front,
 * pockets, lining, monogram) with a live price and lead time. The bunch book
 * feeds the same cloth list, and fittings are booked against a made-up but
 * stable diary. Design and visits are kept in this browser (localStorage).
 */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function t(key, vars) {
    var out = I18N.t(window.SITE_I18N, key);
    if (vars) Object.keys(vars).forEach(function (k) { out = out.split("{" + k + "}").join(vars[k]); });
    return out;
  }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function L(o) { return o[I18N.lang] || o.en; }
  function eur(n) { return t("eur", { n: n.toLocaleString(I18N.lang === "pt" ? "pt-PT" : "en-GB") }); }
  function load(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch (e) { return fallback; } }
  function store(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* private mode */ } }
  function img(id, w) { return "https://images.unsplash.com/photo-" + id + "?auto=format&fit=crop&w=" + w + "&q=72"; }
  function isoOf(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function dayAt(offset) { var d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + offset); return d; }
  function parseIso(s) { var p = s.split("-"); return new Date(+p[0], +p[1] - 1, +p[2], 12); }
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

  /* ───────── the cloth ───────── */

  // kind decides the weave drawn in the pattern; a / b are the yarn colours
  var CLOTHS = [
    { id: "navy", kind: "twill", base: "#1f2a44", a: "#3a4a70", season: "year", g: 280, price: 1450,
      name: { en: "Navy twill", pt: "Sarja azul-marinho" }, note: { en: "The one to start with. Holds a crease, forgives a train ride.", pt: "Aquele por onde começar. Mantém o vinco e perdoa uma viagem de comboio." } },
    { id: "chalk", kind: "pinstripe", base: "#2c2e33", a: "#cfcfcf", season: "year", g: 300, price: 1550,
      name: { en: "Charcoal chalk stripe", pt: "Cinza-carvão com risca de giz" }, note: { en: "A soft stripe a finger apart. Formal without trying.", pt: "Uma risca suave a um dedo de distância. Formal sem esforço." } },
    { id: "herring", kind: "herringbone", base: "#66655f", a: "#8f8d86", season: "winter", g: 340, price: 1600,
      name: { en: "Grey herringbone flannel", pt: "Flanela cinzenta espinha" }, note: { en: "Brushed, warm, and the herringbone only shows up close.", pt: "Escovada, quente, e a espinha só se vê de perto." } },
    { id: "pow", kind: "check", base: "#8a8273", a: "#5a5146", b: "#9c4a40", season: "year", g: 290, price: 1700,
      name: { en: "Prince of Wales check", pt: "Xadrez Príncipe de Gales" }, note: { en: "Grey-brown check with a thin red over-check.", pt: "Xadrez cinza-acastanhado com um fio vermelho por cima." } },
    { id: "linen", kind: "linen", base: "#7b7850", a: "#9d9a70", season: "summer", g: 260, price: 1350,
      name: { en: "Olive linen", pt: "Linho azeitona" }, note: { en: "It will crease. That's the point in August.", pt: "Vai amarrotar. É essa a ideia em agosto." } },
    { id: "bottle", kind: "flannel", base: "#24402f", a: "#3b5e47", season: "winter", g: 330, price: 1600,
      name: { en: "Bottle-green flannel", pt: "Flanela verde-garrafa" }, note: { en: "Deep green that reads almost black at night.", pt: "Verde profundo que à noite parece quase preto." } },
    { id: "sand", kind: "twill", base: "#c4ad86", a: "#ad9570", season: "summer", g: 250, price: 1300,
      name: { en: "Sand cotton drill", pt: "Algodão areia" }, note: { en: "Washable, honest, good with white shirts and no tie.", pt: "Lavável, honesto, fica bem com camisa branca e sem gravata." } },
    { id: "tweed", kind: "tweed", base: "#5f4430", a: "#a07a52", b: "#2f2117", season: "winter", g: 420, price: 1650,
      name: { en: "Brown Donegal-style tweed", pt: "Tweed castanho salpicado" }, note: { en: "Flecks of rust and cream. Heavy, and lasts decades.", pt: "Salpicos de ferrugem e creme. Pesado, e dura décadas." } }
  ];
  function cloth(id) { return CLOTHS.filter(function (c) { return c.id === id; })[0] || CLOTHS[0]; }

  /** The inside of an SVG <pattern> for a cloth (or a lining). */
  function weave(c) {
    var r = '<rect width="16" height="16" fill="' + c.base + '"/>';
    switch (c.kind) {
      case "twill": return r + '<path d="M0 16 L16 0 M-4 4 L4 -4 M12 20 L20 12 M0 8 L8 0 M8 16 L16 8" stroke="' + c.a + '" stroke-width="1.2" opacity="0.55"/>';
      case "pinstripe": return r + '<path d="M0 16 L16 0 M8 16 L16 8 M0 8 L8 0" stroke="#000" stroke-width="1" opacity="0.15"/><path d="M8 0 V16" stroke="' + c.a + '" stroke-width="0.7" opacity="0.75"/>';
      case "herringbone": return r + '<path d="M0 0 L8 8 M0 8 L8 16 M8 8 L16 0 M8 16 L16 8" stroke="' + c.a + '" stroke-width="1.6" opacity="0.7"/>';
      case "check": return r + '<path d="M0 3 H16 M0 5 H16 M3 0 V16 M5 0 V16" stroke="' + c.a + '" stroke-width="0.9" opacity="0.8"/><path d="M0 11 H16 M11 0 V16" stroke="' + c.b + '" stroke-width="0.6" opacity="0.8"/><rect x="8" y="8" width="8" height="8" fill="' + c.a + '" opacity="0.18"/>';
      case "linen": return r + '<path d="M0 2 H11 M3 6 H16 M0 10 H7 M9 10 H16 M2 14 H13" stroke="' + c.a + '" stroke-width="1" opacity="0.6"/><path d="M4 0 V16 M12 0 V16" stroke="#000" stroke-width="0.5" opacity="0.1"/>';
      case "flannel": return r + '<circle cx="3" cy="4" r="0.8" fill="' + c.a + '"/><circle cx="11" cy="9" r="0.8" fill="' + c.a + '"/><circle cx="6" cy="13" r="0.7" fill="' + c.a + '"/><circle cx="14" cy="2" r="0.6" fill="' + c.a + '"/>';
      case "tweed": return r + '<path d="M0 16 L16 0 M8 16 L16 8 M0 8 L8 0" stroke="' + c.a + '" stroke-width="1" opacity="0.4"/><circle cx="4" cy="3" r="1" fill="#c0603a"/><circle cx="12" cy="11" r="0.9" fill="#efe2c8"/><circle cx="9" cy="5" r="0.7" fill="' + c.b + '"/><circle cx="2" cy="12" r="0.8" fill="#9a8a5a"/>';
      case "paisley": return r + '<path d="M4 4 q4 -3 5 2 q-1 4 -5 2 z" fill="' + c.a + '" opacity="0.8"/><circle cx="12" cy="12" r="1.6" fill="' + c.b + '"/><circle cx="12" cy="3" r="0.8" fill="' + c.a + '"/>';
      default: return r;
    }
  }
  function swatch(c, id) {
    return '<svg viewBox="0 0 48 48" aria-hidden="true"><defs><pattern id="' + id + '" patternUnits="userSpaceOnUse" width="16" height="16">' + weave(c) + '</pattern></defs><rect width="48" height="48" fill="url(#' + id + ')"/></svg>';
  }

  var LININGS = [
    { id: "bordeaux", kind: "twill", base: "#5e1b26", a: "#7a2a36", price: 0 },
    { id: "ochre", kind: "twill", base: "#b98a2e", a: "#cfa24a", price: 0 },
    { id: "teal", kind: "twill", base: "#1e5257", a: "#2f6b70", price: 0 },
    { id: "paisley", kind: "paisley", base: "#3a2246", a: "#d0a24c", b: "#b5544a", price: 120 }
  ];
  function lining(id) { return LININGS.filter(function (l) { return l.id === id; })[0] || LININGS[0]; }

  var OPTIONS = {
    lapel: [{ id: "notch", price: 0 }, { id: "peak", price: 60 }, { id: "shawl", price: 90 }],
    front: [{ id: "sb2", price: 0 }, { id: "sb1", price: 0 }, { id: "db", price: 180 }],
    pockets: [{ id: "flap", price: 0 }, { id: "jetted", price: 40 }, { id: "patch", price: 0 }]
  };
  function opt(group, id) { return OPTIONS[group].filter(function (o) { return o.id === id; })[0] || OPTIONS[group][0]; }

  var design = load("moura-design-draft", null) || { cloth: "navy", lapel: "notch", front: "sb2", pockets: "flap", lining: "bordeaux", mono: "" };

  function quote(d) {
    var c = cloth(d.cloth), db = d.front === "db";
    var price = c.price + opt("lapel", d.lapel).price + opt("front", d.front).price + opt("pockets", d.pockets).price + lining(d.lining).price + (d.mono ? 25 : 0);
    return { price: price, weeks: (db ? 8 : 7) + (c.g >= 400 ? 1 : 0), fittings: db ? 3 : 2, hours: 55 + (db ? 8 : 0) + (d.pockets === "patch" ? 3 : 0) + (d.lapel === "shawl" ? 2 : 0) };
  }

  /* ───────── drawing the jacket ───────── */

  function jacketArt(d) {
    var vy = d.front === "sb1" ? 176 : d.front === "db" ? 132 : 152;
    var edge = 'stroke="rgba(0,0,0,0.38)" stroke-width="1.2" stroke-linejoin="round"';
    var lapelPath = {
      notch: "M126 22 L118 26 L104 60 L115 64 L97 74 Q118 " + (vy - 34) + " 148 " + vy + " Z",
      peak: "M126 22 L118 26 L106 57 L90 47 L95 77 Q118 " + (vy - 34) + " 148 " + vy + " Z",
      shawl: "M126 22 Q96 34 96 82 Q104 " + (vy - 26) + " 148 " + vy + " Z"
    }[d.lapel];
    if (d.front === "db") lapelPath = lapelPath.replace(/148 (\d+) Z$/, "150 $1 Z").replace("L97 74", "L92 78").replace("L95 77", "L88 82");

    // one half of the jacket, drawn for the left side and mirrored for the right
    function half(right) {
      var s = "";
      // chest dart
      s += '<path d="M98 112 L104 226" stroke="rgba(0,0,0,0.16)" fill="none"/>';
      // hip pocket
      if (d.pockets === "flap") s += '<rect x="64" y="236" width="56" height="17" rx="2" fill="url(#cloth)" ' + edge + '/><rect x="64" y="236" width="56" height="17" rx="2" fill="rgba(0,0,0,0.12)"/>';
      else if (d.pockets === "jetted") s += '<rect x="66" y="242" width="52" height="3.4" rx="1.7" fill="rgba(0,0,0,0.55)"/>';
      else s += '<rect x="62" y="224" width="60" height="60" rx="9" fill="url(#cloth)" ' + edge + '/><rect x="66" y="228" width="52" height="52" rx="6" fill="none" stroke="rgba(255,255,255,0.32)" stroke-dasharray="3 3"/>';
      // breast pocket only on the wearer's left (the viewer's right)
      if (right) {
        if (d.pockets === "patch") s += '<rect x="78" y="96" width="34" height="34" rx="6" fill="url(#cloth)" ' + edge + '/><rect x="81" y="99" width="28" height="28" rx="4" fill="none" stroke="rgba(255,255,255,0.32)" stroke-dasharray="3 3"/>';
        else s += '<rect x="80" y="104" width="32" height="7" rx="1.5" transform="rotate(6 96 107)" fill="url(#cloth)" ' + edge + '/>';
      }
      // lapel
      s += '<path d="' + lapelPath + '" fill="url(#cloth)" ' + edge + '/><path d="' + lapelPath + '" fill="rgba(0,0,0,0.14)"/>';
      if (d.lapel !== "shawl") s += '<path d="M118 26 L104 60" stroke="rgba(0,0,0,0.3)"/>';
      // front edge
      if (d.front !== "db") s += '<path d="M150 ' + vy + ' L150 292 Q148 314 124 330" fill="none" ' + edge + '/>';
      return s;
    }

    var buttons = "";
    function button(x, y) { return '<circle cx="' + x + '" cy="' + y + '" r="5.2" fill="#2b211b" stroke="rgba(255,255,255,0.25)" stroke-width="1"/><circle cx="' + (x - 1.4) + '" cy="' + (y - 1.4) + '" r="1.1" fill="rgba(255,255,255,0.35)"/>'; }
    if (d.front === "sb1") buttons = button(150, vy + 20);
    else if (d.front === "sb2") buttons = button(150, vy + 18) + button(150, vy + 62);
    else [vy + 20, vy + 58, vy + 96].forEach(function (y) { buttons += button(131, y) + button(169, y); });

    var sleeve = "M76 38 Q44 44 42 92 L26 300 Q44 310 64 304 L74 140 Z";
    var cuff = '<circle cx="35" cy="288" r="2.4" fill="#2b211b"/><circle cx="37" cy="280" r="2.4" fill="#2b211b"/><circle cx="39" cy="272" r="2.4" fill="#2b211b"/>';
    var body = "M118 22 L182 22 L226 36 Q248 44 250 72 Q236 196 246 326 Q150 342 54 326 Q64 196 50 72 Q52 44 74 36 Z";
    var mirror = 'transform="translate(300 0) scale(-1 1)"';

    return '<ellipse cx="150" cy="342" rx="110" ry="6" fill="rgba(0,0,0,0.12)"/>' +
      '<g><path d="' + sleeve + '" fill="url(#cloth)" ' + edge + '/><path d="' + sleeve + '" fill="rgba(0,0,0,0.12)"/>' + cuff + "</g>" +
      "<g " + mirror + '><path d="' + sleeve + '" fill="url(#cloth)" ' + edge + '/><path d="' + sleeve + '" fill="rgba(0,0,0,0.12)"/>' + cuff + "</g>" +
      '<path d="' + body + '" fill="url(#cloth)" ' + edge + '/><path d="' + body + '" fill="url(#shade)"/>' +
      // shirt, collar and tie in the opening
      '<path d="M124 22 L176 22 L150 ' + (vy + 2) + ' Z" fill="#f3efe6"/>' +
      '<path d="M146 38 L154 38 L157 ' + vy + ' L143 ' + vy + ' Z" fill="#4a1c22"/><path d="M144 28 L156 28 L154 39 L146 39 Z" fill="#5c242b"/>' +
      '<path d="M124 22 L141 42 L150 28 Z M176 22 L159 42 L150 28 Z" fill="#fbf8f1" stroke="rgba(0,0,0,0.12)"/>' +
      (d.front === "sb1" || d.front === "sb2" ? '<path d="M150 292 Q148 314 124 330 L176 330 Q152 314 150 292 Z" fill="#262523"/>' : "") +
      "<g>" + half(false) + "</g><g " + mirror + ">" + half(true) + "</g>" +
      (d.front === "db" ? '<path d="M150 ' + vy + ' Q166 ' + (vy + 6) + ' 172 ' + (vy + 18) + ' L174 330" fill="none" ' + edge + "/>" : "") +
      buttons;
  }

  function paintJacket() {
    var c = cloth(design.cloth), l = lining(design.lining);
    $("[data-cloth-pattern]").innerHTML = weave(c);
    $("[data-lining-pattern]").innerHTML = weave(l);
    $("[data-jacket-art]").innerHTML = jacketArt(design);
    var inside = $("[data-inside-lining]");
    inside.innerHTML = swatch(l, "lin-inside");
    $("[data-inside-mono]").textContent = design.mono || "";
  }

  /* ───────── controls ───────── */

  function paintControls() {
    $('[data-opt="cloth"]').innerHTML = CLOTHS.map(function (c) {
      return '<button type="button" class="sw" data-set="cloth" data-val="' + c.id + '" aria-pressed="' + (c.id === design.cloth) + '" title="' + esc(L(c.name)) + '">' +
        swatch(c, "sw-" + c.id) + '<span class="sr-only">' + esc(L(c.name)) + "</span></button>";
    }).join("");
    var c = cloth(design.cloth);
    $("[data-cloth-note]").innerHTML = "<b>" + esc(L(c.name)) + "</b> · " + esc(t("weight", { g: c.g })) + " · " + esc(L(c.note));
    ["lapel", "front", "pockets"].forEach(function (g) {
      $('[data-opt="' + g + '"]').innerHTML = OPTIONS[g].map(function (o) {
        return '<button type="button" data-set="' + g + '" data-val="' + o.id + '" aria-pressed="' + (o.id === design[g]) + '">' + esc(t(g + "." + o.id)) +
          (o.price ? "<small>" + esc(t("plus", { n: o.price })) + "</small>" : "") + "</button>";
      }).join("");
    });
    $('[data-opt="lining"]').innerHTML = LININGS.map(function (l) {
      return '<button type="button" class="sw" data-set="lining" data-val="' + l.id + '" aria-pressed="' + (l.id === design.lining) + '" title="' + esc(t("lining." + l.id)) + '">' +
        swatch(l, "ln-" + l.id) + '<span class="sw-name">' + esc(t("lining." + l.id)) + (l.price ? " " + esc(t("plus", { n: l.price })) : "") + "</span></button>";
    }).join("");
    var mono = $("[data-mono]");
    if (document.activeElement !== mono) mono.value = design.mono;
    paintQuote();
  }

  var shown = null, tween = 0;
  function paintQuote() {
    var q = quote(design), el = $("[data-price]"), from = shown == null ? q.price : shown;
    cancelAnimationFrame(tween);
    if (reduced || from === q.price) { shown = q.price; el.textContent = eur(q.price); }
    else {
      var start = performance.now(), target = q.price;
      (function step(now) {
        var k = Math.min(1, (now - start) / 420), e = 1 - Math.pow(1 - k, 3);
        shown = Math.round(from + (target - from) * e);
        el.textContent = eur(shown);
        if (k < 1) tween = requestAnimationFrame(step);
      })(start);
      // rAF stalls in background tabs; make sure the final number lands
      setTimeout(function () { if (quote(design).price === target) { cancelAnimationFrame(tween); shown = target; el.textContent = eur(target); } }, 500);
    }
    $("[data-meta]").textContent = t("meta", q);
  }

  function set(group, val) {
    design[group] = val;
    store("moura-design-draft", design);
    $("[data-saved]").textContent = "";
    paintJacket(); paintControls(); paintClothGrid();
  }

  $("[data-designer]").addEventListener("click", function (e) {
    var b = e.target.closest("[data-set]");
    if (b) set(b.getAttribute("data-set"), b.getAttribute("data-val"));
  });
  $("[data-mono]").addEventListener("input", function (e) {
    var v = e.target.value.toUpperCase().replace(/[^A-ZÀ-Ý.]/g, "").slice(0, 3);
    e.target.value = v;
    set("mono", v);
  });
  $("[data-random]").addEventListener("click", function () {
    function pick(list) { return list[Math.floor(Math.random() * list.length)].id; }
    design = { cloth: pick(CLOTHS), lapel: pick(OPTIONS.lapel), front: pick(OPTIONS.front), pockets: pick(OPTIONS.pockets), lining: pick(LININGS), mono: design.mono };
    set("cloth", design.cloth);
  });
  $("[data-save-design]").addEventListener("click", function () {
    store("moura-design", design);
    $("[data-saved]").textContent = t("savedDesign");
    paintCarry();
  });

  /* ───────── process ───────── */

  var STEPS = [
    { week: 0, img: "1598808503746-f34c53b9323e", title: { en: "Measure and talk", pt: "Medir e conversar" },
      text: { en: "Twenty-odd measurements, how you stand, what you'll wear it for. You choose the cloth from the bunch books on the table.", pt: "Mais de vinte medidas, como se põe de pé, para que o vai usar. Escolhe o tecido nos mostruários em cima da mesa." } },
    { week: 1, img: "1584184924103-e310d9dc82fc", title: { en: "Pattern and cut", pt: "Molde e corte" },
      text: { en: "Your pattern is drawn on brown paper, chalked onto the cloth and cut with shears. The pattern stays here, filed under your name.", pt: "O seu molde é desenhado em papel pardo, marcado a giz no tecido e cortado à tesoura. O molde fica cá, arquivado com o seu nome." } },
    { week: 3, img: "1580657018950-c7f7d6a6d990", title: { en: "Basted fitting", pt: "Prova alinhavada" },
      text: { en: "The jacket is held together with white tacking thread. We pin, chalk and pull it apart again — this is where it becomes yours.", pt: "O casaco está unido com linha branca de alinhavo. Prendemos, marcamos e voltamos a desmanchar — é aqui que passa a ser seu." } },
    { week: 6, img: "1592878904946-b3cd8ae243d0", title: { en: "Forward fitting", pt: "Segunda prova" },
      text: { en: "Lapels rolled, sleeves set, buttons marked. Small things now: a sleeve a few millimetres shorter, a collar that sits closer.", pt: "Lapelas enroladas, mangas montadas, botões marcados. Agora são pormenores: uma manga uns milímetros mais curta, uma gola mais junta." } },
    { week: 9, img: "1593032465175-481ac7f401a0", title: { en: "Finish and collect", pt: "Acabar e levantar" },
      text: { en: "Hand-sewn buttonholes, a last press, your label inside. Bring it back any time to be pressed or adjusted, for free, for life.", pt: "Casas dos botões à mão, um último passar a ferro, a sua etiqueta por dentro. Traga-o quando quiser para passar ou ajustar, sem custo, para sempre." } }
  ];
  var step = 0;
  function paintSteps() {
    $("[data-steps]").innerHTML = STEPS.map(function (s, i) {
      return '<li><button type="button" role="tab" data-step="' + i + '" aria-selected="' + (i === step) + '"><span class="s-week">' + esc(t("week", { n: s.week })) + '</span><span class="s-title">' + esc(L(s.title)) + "</span></button></li>";
    }).join("");
    var s = STEPS[step];
    $("[data-step-detail]").innerHTML = '<figure><img src="' + img(s.img, 900) + '" alt=""></figure><div><p class="s-num">0' + (step + 1) + " / 05</p><h3>" + esc(L(s.title)) + "</h3><p>" + esc(L(s.text)) + "</p></div>";
  }
  $("[data-steps]").addEventListener("click", function (e) {
    var b = e.target.closest("[data-step]");
    if (b) { step = +b.getAttribute("data-step"); paintSteps(); }
  });

  /* ───────── bunch book ───────── */

  var season = "all";
  function paintClothGrid() {
    $("[data-season]").innerHTML = ["all", "year", "summer", "winter"].map(function (s) {
      return '<button type="button" data-s="' + s + '" aria-pressed="' + (s === season) + '">' + esc(t("season." + s)) + "</button>";
    }).join("");
    $("[data-cloth-grid]").innerHTML = CLOTHS.filter(function (c) { return season === "all" || c.season === season; }).map(function (c) {
      var on = c.id === design.cloth;
      return '<article class="bolt' + (on ? " on" : "") + '"><div class="bolt-cloth">' + swatch(c, "bk-" + c.id) + "</div>" +
        '<div class="bolt-body"><h3>' + esc(L(c.name)) + '</h3><p class="muted small">' + esc(t("season." + c.season)) + " · " + esc(t("weight", { g: c.g })) + " · " + esc(eur(c.price)) + "</p>" +
        "<p>" + esc(L(c.note)) + "</p>" +
        (on ? '<span class="in-use">' + esc(t("inUse")) + "</span>" : '<button type="button" class="link" data-use="' + c.id + '">' + esc(t("useCloth")) + "</button>") + "</div></article>";
    }).join("");
  }
  $("[data-season]").addEventListener("click", function (e) {
    var b = e.target.closest("[data-s]");
    if (b) { season = b.getAttribute("data-s"); paintClothGrid(); }
  });
  $("[data-cloth-grid]").addEventListener("click", function (e) {
    var b = e.target.closest("[data-use]");
    if (!b) return;
    set("cloth", b.getAttribute("data-use"));
    $("#design").scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  });

  /* ───────── fittings ───────── */

  var VISITS = [{ id: "consult", min: 60 }, { id: "fitting", min: 45 }, { id: "collect", min: 20 }];
  var visit = "consult";
  var DAYS = [];
  for (var i = 1; DAYS.length < 15; i++) { var d = dayAt(i), wd = d.getDay(); if (wd >= 2 && wd <= 6) DAYS.push(isoOf(d)); }
  var pickDay = DAYS[0], pickTime = null;
  function closeAt(iso) { return parseIso(iso).getDay() === 6 ? 14 * 60 : 19 * 60; }
  function mm(min) { return String(Math.floor(min / 60)).padStart(2, "0") + ":" + String(min % 60).padStart(2, "0"); }
  function visits() { return load("moura-visits", []); }

  /** Free start times for a day: every 30 minutes, lunch kept free, the diary's made-up bookings and yours taken out. */
  function slots(iso, length) {
    var mine = visits().filter(function (v) { return v.date === iso; }).map(function (v) { var s = toMin(v.time); return [s, s + v.min]; });
    var out = [];
    for (var m = 10 * 60; m + length <= closeAt(iso); m += 30) {
      if (m < 14 * 60 && m + length > 13 * 60) continue;
      if (hash(iso + mm(m)) % 10 < 3) continue;
      if (mine.some(function (r) { return m < r[1] && m + length > r[0]; })) continue;
      out.push(mm(m));
    }
    return out;
  }
  function toMin(s) { var p = s.split(":"); return +p[0] * 60 + +p[1]; }
  function visitLen() { return VISITS.filter(function (v) { return v.id === visit; })[0].min; }

  function paintFitting() {
    $("[data-visit]").innerHTML = VISITS.map(function (v) {
      return '<button type="button" data-v="' + v.id + '" aria-pressed="' + (v.id === visit) + '">' + esc(t("visit." + v.id)) + "<small>" + esc(t("visitMin", { n: v.min })) + "</small></button>";
    }).join("");
    $("[data-days]").innerHTML = DAYS.map(function (iso) {
      var dd = parseIso(iso), free = slots(iso, visitLen()).length;
      return '<button type="button" data-day="' + iso + '" aria-pressed="' + (iso === pickDay) + '"' + (free ? "" : ' class="full"') + "><small>" + esc(t("d" + dd.getDay())) + "</small><strong>" + dd.getDate() + "</strong><small>" + esc(t("m" + dd.getMonth())) + "</small></button>";
    }).join("");
    var list = slots(pickDay, visitLen());
    if (list.indexOf(pickTime) === -1) pickTime = null;
    $("[data-slots]").innerHTML = list.length ? list.map(function (s) {
      return '<button type="button" data-time="' + s + '" aria-pressed="' + (s === pickTime) + '">' + s + "</button>";
    }).join("") : '<p class="muted">' + esc(t("noSlots")) + "</p>";
  }
  $("[data-fit]").addEventListener("click", function (e) {
    var b = e.target.closest("[data-v], [data-day], [data-time]");
    if (!b) return;
    if (b.hasAttribute("data-v")) visit = b.getAttribute("data-v");
    if (b.hasAttribute("data-day")) pickDay = b.getAttribute("data-day");
    if (b.hasAttribute("data-time")) pickTime = b.getAttribute("data-time");
    paintFitting();
  });

  function designLine(dz) {
    return L(cloth(dz.cloth).name) + " · " + t("lapel." + dz.lapel) + " · " + t("front." + dz.front) + " · " + t("pockets." + dz.pockets) + (dz.mono ? " · " + dz.mono : "");
  }
  function paintCarry() {
    var kept = load("moura-design", null), box = $("[data-carry]");
    if (!kept) { box.innerHTML = '<p class="muted small">' + t("carryNone") + "</p>"; return; }
    box.innerHTML = '<div class="carry-card"><svg viewBox="0 0 300 350" aria-hidden="true"><defs><pattern id="carry-cloth" patternUnits="userSpaceOnUse" width="16" height="16">' + weave(cloth(kept.cloth)) + "</pattern></defs>" +
      jacketArt(kept).replace(/url\(#cloth\)/g, "url(#carry-cloth)").replace(/url\(#shade\)/g, "rgba(0,0,0,0.08)") + "</svg>" +
      '<div><p class="f-label">' + esc(t("carryTitle")) + "</p><p>" + esc(designLine(kept)) + '</p><p class="carry-price">' + esc(eur(quote(kept).price)) + "</p></div></div>";
  }

  function whenText(v) { var dd = parseIso(v.date); return t("d" + dd.getDay()) + " " + dd.getDate() + " " + t("m" + dd.getMonth()) + ", " + v.time; }
  function paintMine() {
    var today = isoOf(dayAt(0));
    var list = visits().filter(function (v) { return v.date >= today; }), box = $("[data-mine]");
    box.innerHTML = list.length ? "<h3>" + esc(t("mineTitle")) + "</h3><ul>" + list.map(function (v) {
      return "<li><div><strong>" + esc(t("visit." + v.type)) + "</strong> · " + esc(whenText(v)) + '<span class="muted small">' + esc(v.code) + "</span></div>" +
        '<button type="button" class="link" data-cancel="' + esc(v.code) + '">' + esc(t("cancel")) + "</button></li>";
    }).join("") + "</ul>" : "";
  }
  $("[data-mine]").addEventListener("click", function (e) {
    var b = e.target.closest("[data-cancel]");
    if (!b) return;
    store("moura-visits", visits().filter(function (v) { return v.code !== b.getAttribute("data-cancel"); }));
    paintMine(); paintFitting();
  });

  $("[data-fit]").addEventListener("submit", function (e) {
    e.preventDefault();
    var f = e.target.elements, note = $("[data-fit-note]");
    note.className = "form-note";
    function fail(key, el) { note.textContent = t(key); if (el) el.focus(); }
    if (!pickTime || slots(pickDay, visitLen()).indexOf(pickTime) === -1) return fail("errSlot");
    if (!f.name.value.trim()) return fail("errName", f.name);
    if (f.phone.value.replace(/\D/g, "").length < 9) return fail("errPhone", f.phone);
    if (f.email.value && !f.email.checkValidity()) return fail("errEmail", f.email);
    var v = {
      code: "AM-" + Math.random().toString(36).slice(2, 6).toUpperCase(), type: visit, min: visitLen(), date: pickDay, time: pickTime,
      name: f.name.value.trim(), phone: f.phone.value.trim(), email: f.email.value.trim(), design: load("moura-design", null), created: Date.now()
    };
    var list = visits().concat(v).sort(function (a, b) { return (a.date + a.time).localeCompare(b.date + b.time); });
    store("moura-visits", list);
    note.className = "form-note ok";
    note.textContent = t("booked", { when: whenText(v), code: v.code });
    pickTime = null;
    paintFitting(); paintMine();
  });

  /* ───────── header + tape ───────── */

  var toggle = $(".nav-toggle"), nav = $("#nav");
  toggle.addEventListener("click", function () {
    var open = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
  });
  nav.addEventListener("click", function (e) { if (e.target.closest("a")) { toggle.setAttribute("aria-expanded", "false"); nav.classList.remove("is-open"); } });

  // the tape runs 0–150 cm over the length of the page
  var tape = $("[data-tape]"), read = $("[data-tape-read]"), ticking = false;
  function paintTape() {
    ticking = false;
    var max = document.documentElement.scrollHeight - innerHeight, p = max > 0 ? Math.min(1, scrollY / max) : 0, cm = Math.round(p * 150);
    tape.style.transform = "translateX(" + (-p * 150 * 12) + "px)";   // 12px per cm
    read.textContent = cm + " cm";
    $(".site-header").classList.toggle("is-stuck", scrollY > 30);
  }
  addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(paintTape); } }, { passive: true });
  paintTape();

  /* ───────── everything ───────── */

  function paintAll() {
    paintJacket(); paintControls(); paintSteps(); paintClothGrid(); paintFitting(); paintCarry(); paintMine();
    $$("[data-i18n-alt]").forEach(function (el) { el.alt = t(el.getAttribute("data-i18n-alt")); });
  }
  paintAll();
  document.addEventListener("langchange", paintAll);

  if ("IntersectionObserver" in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    $$(".design .section-head, .designer, .process, .cloth, .gallery figure, .fitting").forEach(function (el) { el.classList.add("reveal"); io.observe(el); });
  }
})();
