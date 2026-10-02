/**
 * Brightline — a cleaning company you can price and book on one page.
 * The quote (service, size, bathrooms, frequency, extras) drives everything:
 * the live price, the crew size, which arrival windows still fit, the room
 * checklist column and the booking summary. Quote, area check and bookings
 * are kept in this browser (localStorage).
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
  function eur(n) { return t("eur", { n: Math.round(n) }); }
  function num(n) { return String(n).replace(".", I18N.lang === "pt" ? "," : "."); }
  function load(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch (e) { return fallback; } }
  function store(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* private mode */ } }
  function isoOf(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function dayAt(offset) { var d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + offset); return d; }
  function parseIso(s) { var p = s.split("-"); return new Date(+p[0], +p[1] - 1, +p[2], 12); }
  function shortDate(s) { var d = parseIso(s); return t("d" + d.getDay()) + " " + d.getDate() + " " + t("m" + d.getMonth()); }
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

  /* ───────── pricing ───────── */

  var RATE = 21;      // € per cleaner-hour
  var MINIMUM = 49;   // smallest visit we price
  var SERVICES = { standard: 1, deep: 1.6, moveout: 1.9, office: 1 };
  var HOMES = { t0: 2, t1: 2.5, t2: 3, t3: 3.5, t4: 4.5 };
  var OFFICES = { o1: 2.5, o2: 3.5, o3: 5.5 };
  var FREQ = [{ id: "once", off: 0, every: 0 }, { id: "weekly", off: 20, every: 7 }, { id: "fortnight", off: 15, every: 14 }, { id: "monthly", off: 10, every: 28 }];
  var EXTRAS = [{ id: "oven", h: 1 }, { id: "fridge", h: 0.75 }, { id: "windows", h: 1.5 }, { id: "balcony", h: 0.5 }, { id: "ironing", h: 1, homeOnly: true }];

  var quote = load("brightline-quote", null) || { service: "standard", home: "t2", baths: 1, freq: "fortnight", extras: [] };
  function freq(id) { return FREQ.filter(function (f) { return f.id === id; })[0] || FREQ[0]; }
  function extra(id) { return EXTRAS.filter(function (x) { return x.id === id; })[0]; }
  function sizes() { return quote.service === "office" ? OFFICES : HOMES; }
  function normalise() {
    if (!(quote.home in sizes())) quote.home = quote.service === "office" ? "o1" : "t2";
    if (quote.service === "moveout") quote.freq = "once";
    if (quote.service === "office") quote.extras = quote.extras.filter(function (id) { return !extra(id).homeOnly; });
    quote.baths = Math.max(1, Math.min(5, quote.baths | 0));
  }

  /** { hours, crew, duration, price } for the current quote. */
  function price(q) {
    var base = (q.service === "office" ? OFFICES : HOMES)[q.home] + (q.baths - 1) * 0.75;
    var hours = base * SERVICES[q.service] + q.extras.reduce(function (s, id) { return s + extra(id).h; }, 0);
    hours = Math.ceil(hours * 2) / 2;
    var crew = hours <= 4 ? 1 : hours <= 8 ? 2 : 3;
    var duration = Math.ceil((hours / crew) * 2) / 2;
    var total = Math.max(MINIMUM, hours * RATE * (1 - freq(q.freq).off / 100));
    return { hours: hours, crew: crew, duration: duration, price: Math.round(total) };
  }

  /* ───────── header ───────── */

  var toggle = $(".nav-toggle"), nav = $("#nav");
  toggle.addEventListener("click", function () {
    var open = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
  });
  nav.addEventListener("click", function (e) { if (e.target.closest("a")) { toggle.setAttribute("aria-expanded", "false"); nav.classList.remove("is-open"); } });
  addEventListener("scroll", function () { $(".site-header").classList.toggle("is-stuck", scrollY > 40); }, { passive: true });

  /* ───────── the quote card ───────── */

  function segButtons(items, current, attr) {
    return items.map(function (it) {
      return '<button type="button" ' + attr + '="' + it.id + '" aria-pressed="' + (it.id === current) + '"' + (it.disabled ? " disabled" : "") + ">" + it.label + "</button>";
    }).join("");
  }

  function paintQuote() {
    normalise();
    $('[data-q="service"]').innerHTML = segButtons(Object.keys(SERVICES).map(function (id) { return { id: id, label: esc(t("sv." + id)) }; }), quote.service, "data-service");
    $('[data-q="freq"]').innerHTML = segButtons(FREQ.map(function (f) {
      return { id: f.id, label: esc(t("f." + f.id)) + (f.off ? ' <em>' + esc(t("off", { n: f.off })) + "</em>" : ""), disabled: quote.service === "moveout" && f.off };
    }), quote.freq, "data-freq");
    $('[data-q="freq"]').title = quote.service === "moveout" ? t("onlyOnce") : "";

    var sel = $("[data-q-home]");
    sel.innerHTML = Object.keys(sizes()).map(function (id) { return '<option value="' + id + '"' + (id === quote.home ? " selected" : "") + ">" + esc(t("h." + id)) + "</option>"; }).join("");
    sel.previousElementSibling.textContent = t(quote.service === "office" ? "qOffice" : "qHome");
    $("[data-baths-out]").textContent = quote.baths;

    $('[data-q="extras"]').innerHTML = EXTRAS.filter(function (x) { return !(x.homeOnly && quote.service === "office"); }).map(function (x) {
      var on = quote.extras.indexOf(x.id) > -1;
      return '<button type="button" class="chip" data-extra="' + x.id + '" aria-pressed="' + on + '">' + esc(t("x." + x.id)) + " <small>+" + esc(eur(x.h * RATE)) + "</small></button>";
    }).join("");
    paintPrice();
  }

  var shown = null, tween = 0;
  function paintPrice() {
    var p = price(quote), el = $("[data-price]");
    var target = p.price, from = shown == null ? target : shown;
    cancelAnimationFrame(tween);
    if (reduced || from === target) { el.textContent = eur(target); shown = target; }
    else {
      var start = performance.now();
      // rAF stalls in background tabs; make sure the final number always lands
      setTimeout(function () { if (shown !== target && price(quote).price === target) { cancelAnimationFrame(tween); shown = target; el.textContent = eur(target); } }, 450);
      (function step(now) {
        var k = Math.min(1, (now - start) / 380), e = 1 - Math.pow(1 - k, 3);
        shown = Math.round(from + (target - from) * e);
        el.textContent = eur(shown);
        if (k < 1) tween = requestAnimationFrame(step);
      })(start);
    }
    $("[data-price-note]").textContent = quote.freq === "once" ? t("oneOff") : t("perVisit");
    $("[data-meta]").textContent = t("meta", {
      h: num(p.hours), crew: p.crew === 1 ? t("crew1") : t("crewN", { n: p.crew }), d: t("dur", { n: num(p.duration) })
    });
    store("brightline-quote", quote);
    paintCompare(); paintSummary(); paintWindows(); paintSticky();
  }

  $("[data-quote]").addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b || b.disabled) return;
    if (b.hasAttribute("data-service")) { quote.service = b.getAttribute("data-service"); paintQuote(); return; }
    if (b.hasAttribute("data-freq")) { quote.freq = b.getAttribute("data-freq"); $$("[data-freq]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); }); paintPrice(); return; }
    if (b.hasAttribute("data-baths")) { quote.baths += +b.getAttribute("data-baths"); normalise(); $("[data-baths-out]").textContent = quote.baths; paintPrice(); return; }
    if (b.hasAttribute("data-extra")) {
      var id = b.getAttribute("data-extra"), i = quote.extras.indexOf(id);
      if (i > -1) quote.extras.splice(i, 1); else quote.extras.push(id);
      b.setAttribute("aria-pressed", String(i < 0));
      paintPrice();
    }
  });
  $("[data-q-home]").addEventListener("change", function (e) { quote.home = e.target.value; paintPrice(); });

  /* ───────── room checklist, compared across services ───────── */

  // each task: which of regular / deep / move-out include it
  var ROOMS = {
    kitchen: [
      [{ en: "Counters, hob and splashback wiped and degreased", pt: "Bancadas, placa e frontão limpos e desengordurados" }, 1, 1, 1],
      [{ en: "Sink and taps descaled until they shine", pt: "Lava-loiça e torneiras sem calcário, a brilhar" }, 1, 1, 1],
      [{ en: "Cupboard fronts and handles", pt: "Frentes e puxadores dos armários" }, 1, 1, 1],
      [{ en: "Inside cupboards and drawers", pt: "Interior de armários e gavetas" }, 0, 1, 1],
      [{ en: "Extractor hood and filter", pt: "Exaustor e filtro" }, 0, 1, 1],
      [{ en: "Floor vacuumed and mopped, edges too", pt: "Chão aspirado e lavado, cantos incluídos" }, 1, 1, 1]
    ],
    bathroom: [
      [{ en: "Toilet, inside and out, and the base", pt: "Sanita por dentro e por fora, e a base" }, 1, 1, 1],
      [{ en: "Shower screen and tiles de-scaled", pt: "Resguardo e azulejos sem calcário" }, 1, 1, 1],
      [{ en: "Mirror, basin and taps polished", pt: "Espelho, lavatório e torneiras polidos" }, 1, 1, 1],
      [{ en: "Grout scrubbed", pt: "Juntas esfregadas" }, 0, 1, 1],
      [{ en: "Inside the bathroom cabinet", pt: "Interior do armário da casa de banho" }, 0, 1, 1],
      [{ en: "Towels folded, bin emptied", pt: "Toalhas dobradas, lixo despejado" }, 1, 1, 0]
    ],
    bedroom: [
      [{ en: "Beds made, or fresh sheets if you leave them out", pt: "Camas feitas, ou lençóis mudados se os deixar à vista" }, 1, 1, 0],
      [{ en: "Surfaces dusted, lamps and frames too", pt: "Superfícies sem pó, candeeiros e molduras incluídos" }, 1, 1, 1],
      [{ en: "Under the bed and behind furniture", pt: "Debaixo da cama e atrás dos móveis" }, 0, 1, 1],
      [{ en: "Inside wardrobes", pt: "Interior dos roupeiros" }, 0, 0, 1],
      [{ en: "Skirting boards and door frames", pt: "Rodapés e aros das portas" }, 0, 1, 1]
    ],
    living: [
      [{ en: "Dusting, from shelves to switches", pt: "Pó, das prateleiras aos interruptores" }, 1, 1, 1],
      [{ en: "Sofa vacuumed, cushions plumped", pt: "Sofá aspirado, almofadas ajeitadas" }, 1, 1, 0],
      [{ en: "Floors vacuumed and mopped", pt: "Chão aspirado e lavado" }, 1, 1, 1],
      [{ en: "Radiators and window sills", pt: "Radiadores e parapeitos" }, 0, 1, 1],
      [{ en: "Walls spot-cleaned of marks", pt: "Marcas nas paredes limpas" }, 0, 1, 1],
      [{ en: "Light fittings wiped", pt: "Candeeiros de teto limpos" }, 0, 1, 1]
    ]
  };
  var COLS = ["standard", "deep", "moveout"];
  var room = "kitchen";

  function paintCompare() {
    $("[data-rooms]").innerHTML = Object.keys(ROOMS).map(function (id) {
      return '<button type="button" role="tab" data-room="' + id + '" aria-selected="' + (id === room) + '">' + esc(t("r." + id)) + "</button>";
    }).join("");
    var pick = quote.service === "office" ? "standard" : quote.service;
    var head = "<tr><th scope=\"col\">" + esc(t("task")) + "</th>" + COLS.map(function (c) {
      return '<th scope="col" class="' + (c === pick ? "pick" : "") + '">' + esc(t("sv." + c)) + (c === pick ? "<small>" + esc(t("yourPick")) + "</small>" : "") + "</th>";
    }).join("") + "</tr>";
    var rows = ROOMS[room].map(function (r) {
      return "<tr><th scope=\"row\">" + esc(L(r[0])) + "</th>" + COLS.map(function (c, i) {
        return '<td class="' + (c === pick ? "pick" : "") + '">' + (r[i + 1] ? '<span class="yes" aria-label="✓">✓</span>' : '<span class="no" aria-label="–">–</span>') + "</td>";
      }).join("") + "</tr>";
    }).join("");
    $("[data-compare]").innerHTML = "<table><thead>" + head + "</thead><tbody>" + rows + "</tbody></table>";
  }
  $("[data-rooms]").addEventListener("click", function (e) {
    var b = e.target.closest("[data-room]");
    if (b) { room = b.getAttribute("data-room"); paintCompare(); }
  });

  /* ───────── areas ───────── */

  var ZONES = [
    { name: "Lisboa", ranges: [[1000, 1999]], fee: 0 },
    { name: "Oeiras", ranges: [[2760, 2799]], fee: 0 },
    { name: "Cascais", ranges: [[2645, 2649], [2750, 2759]], fee: 6 },
    { name: "Almada", ranges: [[2800, 2829]], fee: 8 },
    { name: "Amadora", ranges: [[2610, 2724]], soon: true }
  ];
  var PLACES = {
    Lisboa: ["alvalade", "arroios", "avenidas novas", "belem", "benfica", "campo de ourique", "campolide", "estrela", "graca", "lumiar", "marvila", "misericordia", "olivais", "parque das nacoes", "penha de franca", "principe real", "santa maria maior", "santo antonio", "sao vicente", "alcantara", "ajuda", "areeiro", "carnide", "chiado", "baixa", "alfama", "lapa", "saldanha", "telheiras"],
    Oeiras: ["oeiras", "paco de arcos", "carcavelos", "algés", "alges", "linda-a-velha", "miraflores", "cruz quebrada"],
    Cascais: ["cascais", "estoril", "parede", "sao joao do estoril"],
    Almada: ["almada", "cacilhas", "costa da caparica", "pragal", "feijo"],
    Amadora: ["amadora", "reboleira", "alfragide"]
  };
  function plain(s) { return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim(); }
  function findZone(text) {
    var digits = text.replace(/\D/g, "");
    if (digits.length >= 4) {
      var code = +digits.slice(0, 4);
      return ZONES.filter(function (z) { return z.ranges.some(function (r) { return code >= r[0] && code <= r[1]; }); })[0] || "none";
    }
    var q = plain(text);
    if (q.length < 3) return null;
    for (var name in PLACES) {
      if (PLACES[name].some(function (p) { return plain(p) === q || (q.length > 4 && plain(p).indexOf(q) === 0); })) {
        return ZONES.filter(function (z) { return z.name === name; })[0];
      }
    }
    return "none";
  }
  var area = load("brightline-area", null); // { zone, fee, ok, input }

  function paintZones() {
    $("[data-zones]").innerHTML = ZONES.map(function (z) {
      var tag = z.soon ? t("feeSoon") : z.fee ? "+" + eur(z.fee) : t("feeFree");
      return '<li class="' + (z.soon ? "soon" : "") + (area && area.zone === z.name ? " hit" : "") + '"><strong>' + esc(z.name) + "</strong><span>" + esc(tag) + "</span></li>";
    }).join("");
    var out = $("[data-area-result]");
    if (!area) { out.textContent = ""; out.className = "area-result"; return; }
    var z = ZONES.filter(function (x) { return x.name === area.zone; })[0];
    out.className = "area-result " + (area.ok ? "ok" : "bad");
    out.textContent = !z ? t("areaNo") : z.soon ? t("areaSoon", { zone: z.name }) : z.fee ? t("areaFee", { zone: z.name, fee: eur(z.fee) }) : t("areaYes", { zone: z.name });
  }
  $("[data-area]").addEventListener("submit", function (e) {
    e.preventDefault();
    var input = e.target.elements.postcode, z = findZone(input.value);
    if (z === null) { area = null; $("[data-area-result]").className = "area-result bad"; $("[data-area-result]").textContent = t("areaBad"); store("brightline-area", null); paintSummary(); return; }
    area = z === "none" ? { zone: null, fee: 0, ok: false, input: input.value } : { zone: z.name, fee: z.fee || 0, ok: !z.soon, input: input.value };
    store("brightline-area", area);
    paintZones(); paintSummary();
  });
  if (area && area.input) $("#postcode").value = area.input;

  /* ───────── booking ───────── */

  var WINDOWS = [{ id: "am", from: "08:30", to: "09:30" }, { id: "mid", from: "11:30", to: "12:30" }, { id: "pm", from: "14:30", to: "15:30" }];
  var DAYS = [];
  for (var i = 1; DAYS.length < 12; i++) { var d = dayAt(i); if (d.getDay() !== 0) DAYS.push(isoOf(d)); }
  var pickDay = DAYS[0], pickWin = null;

  function bookings() { return load("brightline-bookings", []); }
  /** Cleaners still free for a day and window: a stable made-up number minus your own bookings. */
  function freeCleaners(date, win) {
    var base = [0, 2, 3, 4, 5, 6][hash(date + win) % 6];
    var mine = bookings().filter(function (b) { return b.date === date && b.window === win; }).reduce(function (s, b) { return s + b.crew; }, 0);
    return Math.max(0, base - mine);
  }

  function paintDays() {
    $("[data-days]").innerHTML = DAYS.map(function (iso) {
      var d = parseIso(iso), free = WINDOWS.some(function (w) { return freeCleaners(iso, w.id) >= price(quote).crew; });
      return '<button type="button" data-day="' + iso + '" aria-pressed="' + (iso === pickDay) + '"' + (free ? "" : ' class="busy"') + ">" +
        "<small>" + esc(t("d" + d.getDay())) + "</small><strong>" + d.getDate() + "</strong><small>" + esc(t("m" + d.getMonth())) + "</small></button>";
    }).join("");
  }
  function paintWindows() {
    var crew = price(quote).crew;
    if (pickWin && freeCleaners(pickDay, pickWin) < crew) pickWin = null;
    $("[data-windows]").innerHTML = WINDOWS.map(function (w) {
      var free = freeCleaners(pickDay, w.id), fits = free >= crew;
      var label = free === 0 ? t("wFull") : !fits ? t("wSmall", { n: crew }) : free === crew ? t("wLast") : t("wFree", { n: free });
      return '<button type="button" data-win="' + w.id + '" aria-pressed="' + (w.id === pickWin) + '"' + (fits ? "" : " disabled") + ">" +
        "<strong>" + esc(t("w." + w.id)) + "</strong><span>" + w.from + "–" + w.to + "</span><small class=\"" + (fits ? (free === crew ? "last" : "") : "full") + "\">" + esc(label) + "</small></button>";
    }).join("");
    paintDays();
    paintSubmit();
  }
  $("[data-days]").addEventListener("click", function (e) {
    var b = e.target.closest("[data-day]");
    if (b) { pickDay = b.getAttribute("data-day"); paintWindows(); }
  });
  $("[data-windows]").addEventListener("click", function (e) {
    var b = e.target.closest("[data-win]");
    if (b && !b.disabled) { pickWin = b.getAttribute("data-win"); $$("[data-win]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); }); paintSubmit(); }
  });

  function totalNow() { return price(quote).price + (area && area.ok ? area.fee : 0); }
  function paintSubmit() { $("[data-book-submit]").textContent = t("bookFor", { price: eur(totalNow()) }); }

  function paintSummary() {
    var rows = [
      [t("sumService"), t("sv." + quote.service)],
      [t("sumHome"), t("h." + quote.home) + (quote.service === "office" ? "" : " · " + quote.baths + " WC")],
      [t("sumFreq"), t("f." + quote.freq)],
      [t("sumExtras"), quote.extras.length ? quote.extras.map(function (id) { return t("x." + id); }).join(", ") : t("sumNone")]
    ];
    if (area && area.ok && area.fee) rows.push([t("sumFee"), eur(area.fee)]);
    $("[data-summary]").innerHTML = "<dl>" + rows.map(function (r) { return "<div><dt>" + esc(r[0]) + "</dt><dd>" + esc(r[1]) + "</dd></div>"; }).join("") +
      '<div class="total"><dt>' + esc(t("sumTotal")) + "</dt><dd>" + esc(eur(totalNow())) + "</dd></div></dl>" +
      '<a class="link" href="#top">' + esc(t("editQuote")) + "</a>";
    paintSubmit();
  }

  function paintMine() {
    var list = bookings(), today = isoOf(dayAt(0)), box = $("[data-mine]");
    if (!list.length) { box.innerHTML = ""; return; }
    box.innerHTML = "<h3>" + esc(t("mineTitle")) + "</h3><ul>" + list.map(function (b) {
      var st = b.date < today ? "done" : b.date === today ? "today" : "booked";
      var every = freq(b.freq).every, next = "";
      if (every) {
        var dates = [1, 2, 3].map(function (k) { var d = parseIso(b.date); d.setDate(d.getDate() + every * k); return shortDate(isoOf(d)); });
        next = '<span class="next">' + esc(t("nextVisits", { list: dates.join(" · ") })) + "</span>";
      }
      return '<li><div><strong>' + esc(b.code) + "</strong> · " + esc(t("sv." + b.service)) + " · " + esc(eur(b.total)) +
        '<span class="when">' + esc(shortDate(b.date)) + " · " + esc(t("w." + b.window)) + " " + b.from + "</span>" + next + "</div>" +
        '<span class="st st-' + st + '">' + esc(t("st." + st)) + "</span>" +
        (st === "booked" ? '<button type="button" class="link" data-cancel="' + esc(b.code) + '">' + esc(t("cancel")) + "</button>" : "") + "</li>";
    }).join("") + "</ul>";
  }
  $("[data-mine]").addEventListener("click", function (e) {
    var b = e.target.closest("[data-cancel]");
    if (!b) return;
    store("brightline-bookings", bookings().filter(function (x) { return x.code !== b.getAttribute("data-cancel"); }));
    paintMine(); paintWindows();
  });

  $("[data-book]").addEventListener("submit", function (e) {
    e.preventDefault();
    var f = e.target.elements, note = $("[data-book-note]"), p = price(quote);
    note.className = "form-note";
    function fail(key, el) { note.textContent = t(key); if (el) el.focus(); }
    if (area && !area.ok) return fail("errArea", $("#postcode"));
    if (!pickWin) return fail("errWindow");
    if (freeCleaners(pickDay, pickWin) < p.crew) { pickWin = null; paintWindows(); return fail("errFull"); }
    if (!f.name.value.trim()) return fail("errName", f.name);
    if (f.phone.value.replace(/\D/g, "").length < 9) return fail("errPhone", f.phone);
    if (!f.address.value.trim()) return fail("errAddress", f.address);
    var code = "BL-" + Math.random().toString(36).slice(2, 6).toUpperCase();
    var w = WINDOWS.filter(function (x) { return x.id === pickWin; })[0];
    var list = bookings();
    list.push({
      code: code, date: pickDay, window: pickWin, from: w.from, service: quote.service, home: quote.home, baths: quote.baths,
      freq: quote.freq, extras: quote.extras.slice(), crew: p.crew, total: totalNow(), zone: area && area.zone,
      name: f.name.value.trim(), phone: f.phone.value.trim(), address: f.address.value.trim(), created: Date.now()
    });
    list.sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
    store("brightline-bookings", list);
    note.className = "form-note ok";
    note.textContent = t("booked", { code: code });
    f.address.value = "";
    pickWin = null;
    paintWindows(); paintMine();
  });

  /* ───────── reviews + FAQ ───────── */

  var REVIEWS = [
    { who: "Marta S.", where: "Alvalade", sv: "standard", text: { en: "Same two people every other Friday for a year. They know where the good glasses go and they never move my plants.", pt: "As mesmas duas pessoas de quinze em quinze dias há um ano. Sabem onde ficam os copos bons e nunca mudam as plantas de sítio." } },
    { who: "Tiago R.", where: "Oeiras", sv: "moveout", text: { en: "Landlord walked in, opened the oven, closed it and handed back the whole deposit. Worth every euro.", pt: "O senhorio entrou, abriu o forno, fechou-o e devolveu a caução inteira. Valeu cada euro." } },
    { who: "Inês & Paulo", where: "Campo de Ourique", sv: "deep", text: { en: "Booked a deep clean after the builders left. Found a grout colour we didn't know we had.", pt: "Marcámos uma limpeza profunda depois das obras. Descobrimos uma cor de juntas que não sabíamos que tínhamos." } },
    { who: "Studio Faro", where: "Cais do Sodré", sv: "office", text: { en: "Before nine on Mondays, quietly, and the kitchen sink is empty when we arrive. That's all we wanted.", pt: "Antes das nove às segundas, sem barulho, e o lava-loiça está vazio quando chegamos. Era só isso que queríamos." } }
  ];
  var FAQ = [
    [{ en: "Do I need to be home?", pt: "Tenho de estar em casa?" }, { en: "No. Most customers leave a key with the porter or in a lockbox. We text when we arrive and when we leave, with a photo.", pt: "Não. A maioria deixa a chave com o porteiro ou num cofre. Enviamos mensagem quando chegamos e quando saímos, com uma fotografia." }],
    [{ en: "What do you bring?", pt: "O que levam?" }, { en: "Everything: vacuum, mops, cloths and plant-based products. Tell us if you'd rather we used yours.", pt: "Tudo: aspirador, esfregonas, panos e produtos de origem vegetal. Diga-nos se prefere que usemos os seus." }],
    [{ en: "Can I change or skip a visit?", pt: "Posso mudar ou saltar uma visita?" }, { en: "Yes, free up to 24 hours before. Inside 24 hours we charge half, because the crew has already turned down other work.", pt: "Sim, sem custo até 24 horas antes. Com menos de 24 horas cobramos metade, porque a equipa já recusou outro trabalho." }],
    [{ en: "Are the cleaners employed and insured?", pt: "Os profissionais têm contrato e seguro?" }, { en: "Every cleaner is on a contract with paid holidays, and every visit is covered by liability insurance.", pt: "Todos têm contrato com férias pagas, e cada visita está coberta por seguro de responsabilidade civil." }],
    [{ en: "How do I pay?", pt: "Como pago?" }, { en: "By MB WAY or card after the visit. Regular customers get one invoice a month with their NIF.", pt: "Por MB WAY ou cartão depois da visita. Clientes regulares recebem uma fatura por mês com o NIF." }],
    [{ en: "Why is a deep clean so much longer?", pt: "Porque é que a limpeza profunda demora tanto mais?" }, { en: "Because it goes inside, under and behind: cupboards, grout, skirting, radiators. Compare the columns in What's included.", pt: "Porque vai por dentro, por baixo e por trás: armários, juntas, rodapés, radiadores. Compare as colunas em O que inclui." }]
  ];
  function paintReviews() {
    $("[data-reviews]").innerHTML = REVIEWS.map(function (r) {
      return '<figure class="review"><span class="stars" aria-hidden="true">★★★★★</span><blockquote>' + esc(L(r.text)) + "</blockquote>" +
        "<figcaption><strong>" + esc(r.who) + "</strong> · " + esc(r.where) + ' <span class="tag">' + esc(t("sv." + r.sv)) + "</span></figcaption></figure>";
    }).join("");
  }
  function paintFaq() {
    var open = $$("[data-faq] details").map(function (d) { return d.open; });
    $("[data-faq]").innerHTML = FAQ.map(function (f, i) {
      return "<details" + (open[i] ? " open" : "") + "><summary>" + esc(L(f[0])) + "</summary><p>" + esc(L(f[1])) + "</p></details>";
    }).join("");
  }

  /* ───────── sticky call-to-action on small screens ───────── */

  var stickyHidden = { quote: true, book: false };
  function paintSticky() {
    var s = $("[data-sticky]");
    s.textContent = t("stickyCta", { price: eur(totalNow()) });
    s.classList.toggle("show", !stickyHidden.quote && !stickyHidden.book);
  }
  if ("IntersectionObserver" in window) {
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { stickyHidden[en.target.matches(".quote") ? "quote" : "book"] = en.isIntersecting; });
      paintSticky();
    });
    so.observe($(".quote")); so.observe($(".book"));
  }

  /* ───────── everything ───────── */

  function paintAll() {
    paintQuote(); paintZones(); paintMine(); paintReviews(); paintFaq();
    $$("[data-i18n-alt]").forEach(function (el) { el.alt = t(el.getAttribute("data-i18n-alt")); });
  }
  paintAll();
  document.addEventListener("langchange", paintAll);

  if ("IntersectionObserver" in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    $$(".strip figure, .included, .how li, .areas, .book, .review, .guarantee, .faq").forEach(function (el) { el.classList.add("reveal"); io.observe(el); });
  }
})();
