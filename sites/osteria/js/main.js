/**
 * Osteria Corvo — menu chapters with an optional wine pairing, a filterable
 * cellar, and table reservations. Seats per sitting come from a stable demo
 * calendar minus the reservations made in this browser (localStorage).
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
  function L(v) { return typeof v === "string" ? v : v[I18N.lang] || v.en; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function img(id, w) { return "https://images.unsplash.com/photo-" + id + "?auto=format&fit=crop&w=" + w + "&q=75"; }

  var MENU_PRICE = 58, PAIRING_PRICE = 38;
  var COURSES = [
    { n: "I", img: "1608198093002-ad4e005484ec",
      course: { en: "To begin", pt: "Para começar" },
      dish: { en: "Bread, warm olives, cultured butter", pt: "Pão, azeitonas mornas, manteiga fermentada" },
      text: { en: "Sourdough from the morning bake, olives warmed with orange peel, butter we culture for three days.", pt: "Pão de fermentação da fornada da manhã, azeitonas aquecidas com casca de laranja, manteiga fermentada durante três dias." },
      tags: { en: ["vegetarian"], pt: ["vegetariano"] },
      wine: { en: "Vinho verde, Monção", pt: "Vinho verde, Monção" } },
    { n: "II", img: "1550304943-4f24f54ddde9",
      course: { en: "The garden", pt: "A horta" },
      dish: { en: "Bitter leaves, anchovy, toasted crumbs", pt: "Folhas amargas, anchova, migas tostadas" },
      text: { en: "Whatever the market had that was crisp and a little bitter, dressed with anchovy and lemon, finished with crumbs fried in the bread's own crust.", pt: "O que o mercado tinha de estaladiço e um pouco amargo, temperado com anchova e limão, com migas fritas na côdea do próprio pão." },
      tags: { en: ["fish"], pt: ["peixe"] },
      wine: { en: "Arinto, Bucelas", pt: "Arinto, Bucelas" } },
    { n: "III", img: "1473093295043-cdd812d0e601",
      course: { en: "The pasta", pt: "A massa" },
      dish: { en: "Farfalle, late tomatoes, basil oil", pt: "Farfalle, tomates tardios, azeite de manjericão" },
      text: { en: "Pasta rolled in the afternoon, tomatoes from the last warm week, basil pounded into oil just before service.", pt: "Massa estendida à tarde, tomates da última semana quente, manjericão pisado em azeite mesmo antes do serviço." },
      tags: { en: ["vegetarian", "gluten"], pt: ["vegetariano", "glúten"] },
      wine: { en: "Orange Encruzado, Dão", pt: "Encruzado de curtimenta, Dão" } },
    { n: "IV", img: "1600891964092-4316c288032e",
      course: { en: "From the fire", pt: "Da brasa" },
      dish: { en: "Picanha over oak, crisp potatoes", pt: "Picanha na brasa de carvalho, batatas estaladiças" },
      text: { en: "Cooked slowly over oak embers and rested as long as it cooked. Potatoes in beef fat, salted twice.", pt: "Cozinhada devagar sobre brasas de carvalho e deixada a repousar o mesmo tempo. Batatas em gordura de vaca, salgadas duas vezes." },
      tags: { en: ["beef"], pt: ["vaca"] },
      wine: { en: "Baga, Bairrada", pt: "Baga, Bairrada" } },
    { n: "V", img: "1551024506-0bccd828d307",
      course: { en: "Something sweet", pt: "Algo doce" },
      dish: { en: "Fior di latte, burnt caramel", pt: "Fior di latte, caramelo queimado" },
      text: { en: "Milk ice cream churned that day, caramel taken almost too far, a crisp biscuit for the spoon.", pt: "Gelado de leite feito no próprio dia, caramelo levado quase longe demais, uma bolacha estaladiça para a colher." },
      tags: { en: ["vegetarian", "dairy"], pt: ["vegetariano", "lacticínios"] },
      wine: { en: "Moscatel, Setúbal", pt: "Moscatel, Setúbal" } }
  ];

  var WINES = [
    { type: "sparkling", name: "Quinta das Lebres, Bruto", region: "Bairrada", glass: 8, bottle: 36 },
    { type: "white", name: "Casa do Rio Ermo, Alvarinho", region: "Monção e Melgaço", glass: 7, bottle: 32 },
    { type: "white", name: "Vale de Corça, Arinto", region: "Bucelas", glass: 6, bottle: 27 },
    { type: "orange", name: "Pedra Mole, Encruzado em curtimenta", region: "Dão", glass: 9, bottle: 41 },
    { type: "red", name: "Monte Baixo, Baga", region: "Bairrada", glass: 8, bottle: 38 },
    { type: "red", name: "Serra Lenta, Touriga Nacional", region: "Douro", glass: 9, bottle: 44 },
    { type: "red", name: "Herdade do Corvo, Tinta Grossa", region: "Alentejo", glass: 7, bottle: 31 },
    { type: "orange", name: "Areia Fina, Fernão Pires", region: "Tejo", glass: 7, bottle: 33 }
  ];

  /* ───────── header ───────── */

  var toggle = $(".nav-toggle"), nav = $("#nav");
  toggle.addEventListener("click", function () {
    var open = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
  });
  nav.addEventListener("click", function (e) { if (e.target.closest("a")) { toggle.setAttribute("aria-expanded", "false"); nav.classList.remove("is-open"); } });
  addEventListener("scroll", function () { $(".site-header").classList.toggle("is-stuck", scrollY > 30); }, { passive: true });

  /* ───────── menu chapters ───────── */

  var pairingOn = false;
  function paintCourses() {
    $("[data-courses]").innerHTML = COURSES.map(function (c, i) {
      return '<li class="course' + (i % 2 ? " flip" : "") + '">' +
        '<div class="c-copy"><span class="c-num">' + c.n + '</span><p class="c-label">' + esc(L(c.course)) + "</p>" +
        "<h3>" + esc(L(c.dish)) + "</h3><p>" + esc(L(c.text)) + "</p>" +
        '<p class="tags">' + L(c.tags).map(function (tg) { return "<span>" + esc(tg) + "</span>"; }).join("") + "</p>" +
        '<p class="pair' + (pairingOn ? " on" : "") + '"><span>' + esc(t("glass")) + "</span> " + esc(L(c.wine)) + "</p></div>" +
        '<figure class="c-img"><img src="' + img(c.img, 1000) + '" alt="' + esc(L(c.dish)) + '" loading="lazy"></figure></li>';
    }).join("");
    paintPrice();
  }
  function paintPrice() {
    $("[data-price-line]").textContent = pairingOn
      ? t("priceBoth", { menu: MENU_PRICE, pair: PAIRING_PRICE, total: MENU_PRICE + PAIRING_PRICE })
      : t("priceMenu", { menu: MENU_PRICE });
  }
  $("[data-pairing]").addEventListener("change", function (e) {
    pairingOn = e.target.checked;
    $$(".pair").forEach(function (p) { p.classList.toggle("on", pairingOn); });
    paintPrice();
  });

  /* ───────── cellar ───────── */

  var wineFilter = "all";
  function paintWines() {
    $("[data-wine-filters]").innerHTML = ["all", "sparkling", "white", "orange", "red"].map(function (k) {
      return '<button type="button" data-wf="' + k + '" aria-pressed="' + (wineFilter === k) + '">' + esc(k === "all" ? t("all") : t("w." + k)) + "</button>";
    }).join("");
    $("[data-wines]").innerHTML = WINES.filter(function (w) { return wineFilter === "all" || w.type === wineFilter; }).map(function (w) {
      return '<div class="wine"><span class="w-type ' + w.type + '">' + esc(t("w." + w.type)) + '</span><span class="w-name">' + esc(w.name) + '<small>' + esc(w.region) + '</small></span>' +
        '<span class="w-price">' + w.glass + ' €<small>' + esc(t("perGlass")) + '</small></span><span class="w-price">' + w.bottle + ' €<small>' + esc(t("perBottle")) + "</small></span></div>";
    }).join("");
  }
  $("[data-wine-filters]").addEventListener("click", function (e) {
    var b = e.target.closest("[data-wf]");
    if (b) { wineFilter = b.getAttribute("data-wf"); paintWines(); }
  });

  /* ───────── seats + reservations ───────── */

  var KEY = "corvo-reservations";
  var SEATS = 34;
  var SITTINGS = ["19:00", "21:30"];
  var DIET = ["veg", "gluten", "shellfish", "nuts", "dairy", "celebrate"];

  function iso(d) { return d.toISOString().slice(0, 10); }
  function dayAt(offset) { var d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + offset); return d; }
  function isOpen(d) { var w = d.getDay(); return w >= 2 && w <= 6; }
  function mine() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
  function saveMine(list) { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) { /* private mode */ } }

  // seats already taken by "other guests": stable for a given night and sitting
  function booked(isoDate, sitting) {
    var h = 7, s = isoDate + sitting;
    for (var i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) >>> 0;
    var weekend = [5, 6].indexOf(new Date(isoDate + "T12:00:00").getDay()) !== -1;
    var base = weekend ? 24 : 14;
    return Math.min(SEATS, base + (h % 11));
  }
  function seatsLeft(isoDate, sitting) {
    var taken = booked(isoDate, sitting) + mine().filter(function (r) { return r.date === isoDate && r.time === sitting; })
      .reduce(function (sum, r) { return sum + r.guests; }, 0);
    // tonight's first sitting is gone once it has started
    if (isoDate === iso(dayAt(0))) {
      var now = new Date(), parts = sitting.split(":");
      if (now.getHours() * 60 + now.getMinutes() >= +parts[0] * 60 + +parts[1] - 30) return 0;
    }
    return Math.max(0, SEATS - taken);
  }
  function label(isoDate) {
    var d = new Date(isoDate + "T12:00:00");
    if (isoDate === iso(dayAt(0))) return t("today");
    return t("d" + d.getDay()) + " " + d.getDate() + " " + t("months").split(",")[d.getMonth()];
  }

  var state = { guests: 2, date: null, time: null, diet: [] };

  function paintLive() {
    var link = $("[data-live]");
    for (var i = 0; i < 14; i++) {
      var d = dayAt(i);
      if (!isOpen(d)) continue;
      for (var j = 0; j < SITTINGS.length; j++) {
        var left = seatsLeft(iso(d), SITTINGS[j]);
        if (left >= 2) {
          var text = i === 0 ? t("liveSeats", { day: t("today"), seats: left, time: SITTINGS[j] }) : t("liveFull", { day: label(iso(d)), time: SITTINGS[j] });
          link.innerHTML = '<span class="dot" aria-hidden="true"></span>' + esc(text);
          link.setAttribute("data-date", iso(d));
          link.setAttribute("data-time", SITTINGS[j]);
          return;
        }
      }
    }
  }
  $("[data-live]").addEventListener("click", function (e) {
    state.date = e.currentTarget.getAttribute("data-date");
    state.time = e.currentTarget.getAttribute("data-time");
    paintReserve();
  });

  function paintReserve() {
    $("[data-guests-out]").textContent = state.guests;
    var nights = "";
    for (var i = 0; i < 21; i++) {
      var d = dayAt(i), id = iso(d), open = isOpen(d);
      var anyFree = open && SITTINGS.some(function (s) { return seatsLeft(id, s) >= state.guests; });
      nights += '<button type="button" class="night' + (state.date === id ? " is-on" : "") + '" data-night="' + id + '"' + (anyFree ? "" : " disabled") + ">" +
        '<span class="nw">' + esc(i === 0 ? t("today") : t("d" + d.getDay())) + '</span><span class="nd">' + d.getDate() + '</span><span class="nm">' + esc(open ? (anyFree ? t("months").split(",")[d.getMonth()] : t("full")) : t("closedShort")) + "</span></button>";
    }
    $("[data-nights]").innerHTML = nights;
    if (state.date && !SITTINGS.some(function (s) { return seatsLeft(state.date, s) >= state.guests; })) { state.date = null; state.time = null; }

    $("[data-sittings]").innerHTML = SITTINGS.map(function (s) {
      var left = state.date ? seatsLeft(state.date, s) : null;
      var ok = left !== null && left >= state.guests;
      if (!ok && state.time === s) state.time = null;
      return '<button type="button" class="sitting' + (state.time === s ? " is-on" : "") + '" data-sit="' + s + '"' + (ok ? "" : " disabled") + ">" +
        '<span class="st-time">' + s + '</span><span class="st-left">' + (left === null ? "—" : left >= state.guests ? esc(t("seatsLeft", { n: left })) : esc(t("full"))) + "</span></button>";
    }).join("");

    $("[data-diet]").innerHTML = DIET.map(function (k) {
      return '<button type="button" class="chip" data-diet-k="' + k + '" aria-pressed="' + (state.diet.indexOf(k) !== -1) + '">' + esc(t("diet." + k)) + "</button>";
    }).join("");

    var ready = state.date && state.time;
    var submit = $("[data-submit]");
    submit.disabled = !ready;
    submit.textContent = ready ? t("submit", { n: state.guests, day: label(state.date), time: state.time }) : t("submitPick");
    paintMine();
    paintLive();
  }

  function paintMine() {
    var list = mine().filter(function (r) { return r.date >= iso(dayAt(0)); });
    var box = $("[data-mine]");
    if (!list.length) { box.innerHTML = ""; return; }
    box.innerHTML = "<h3>" + esc(t("mineTitle")) + "</h3><ul>" + list.map(function (r) {
      return "<li><span>" + esc(t("mineLine", { ref: r.ref, n: r.guests, day: label(r.date), time: r.time })) + '</span><button type="button" class="link" data-cancel="' + esc(r.ref) + '">' + esc(t("cancel")) + "</button></li>";
    }).join("") + "</ul>";
  }

  var form = $("[data-reserve]");
  form.addEventListener("click", function (e) {
    var g = e.target.closest("[data-guests]");
    if (g) { state.guests = Math.max(1, Math.min(8, state.guests + +g.getAttribute("data-guests"))); paintReserve(); return; }
    var n = e.target.closest("[data-night]");
    if (n) { state.date = n.getAttribute("data-night"); paintReserve(); return; }
    var s = e.target.closest("[data-sit]");
    if (s) { state.time = s.getAttribute("data-sit"); paintReserve(); return; }
    var dk = e.target.closest("[data-diet-k]");
    if (dk) {
      var k = dk.getAttribute("data-diet-k"), at = state.diet.indexOf(k);
      if (at === -1) state.diet.push(k); else state.diet.splice(at, 1);
      dk.setAttribute("aria-pressed", String(at === -1));
    }
  });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var err = $("[data-error]"), f = form.elements;
    err.className = "form-error";
    if (!f.name.value.trim()) { err.textContent = t("errName"); f.name.focus(); return; }
    if (f.phone.value.replace(/\D/g, "").length < 9) { err.textContent = t("errPhone"); f.phone.focus(); return; }
    if (seatsLeft(state.date, state.time) < state.guests) { err.textContent = t("errSeats"); paintReserve(); return; }
    var ref = "OC-" + Math.random().toString(36).slice(2, 6).toUpperCase();
    var list = mine();
    list.push({ ref: ref, guests: state.guests, date: state.date, time: state.time, name: f.name.value.trim(), diet: state.diet.slice() });
    saveMine(list);
    err.textContent = t("confirmed", { ref: ref });
    err.classList.add("ok");
    f.name.value = ""; f.phone.value = "";
    state.diet = []; state.time = null;
    paintReserve();
  });
  $("[data-mine]").addEventListener("click", function (e) {
    var c = e.target.closest("[data-cancel]");
    if (!c) return;
    var ref = c.getAttribute("data-cancel");
    saveMine(mine().filter(function (r) { return r.ref !== ref; }));
    var err = $("[data-error]");
    err.className = "form-error ok";
    err.textContent = t("cancelled", { ref: ref });
    paintReserve();
  });

  /* ───────── language, alts, reveal ───────── */

  function paintAll() {
    paintCourses();
    paintWines();
    paintReserve();
    $$("[data-i18n-alt]").forEach(function (el) { el.alt = t(el.getAttribute("data-i18n-alt")); });
  }
  paintAll();
  document.addEventListener("langchange", paintAll);

  if ("IntersectionObserver" in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.2 });
    var watch = function () { $$(".course:not(.in), .kitchen, .cellar, .reserve, .visit").forEach(function (el) { el.classList.add("reveal"); io.observe(el); }); };
    watch();
    document.addEventListener("langchange", watch);
  }
})();
