/**
 * Lumen — viewfinder hero, series index, light table, lightbox with loupe,
 * sessions and a date check. Content lives in PHOTOS / SESSIONS below.
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
  function L(v) { return typeof v === "string" ? v : v[I18N.lang] || v.en; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function img(id, w) { return "https://images.unsplash.com/photo-" + id + "?auto=format&fit=crop&w=" + w + "&q=75"; }

  var SERIES = ["portraits", "weddings", "spaces", "table", "away"];

  // id, series, caption, exposure (fictional), lens
  var PHOTOS = [
    { id: "1534528741775-53994a69daeb", s: "portraits", c: { en: "Marta, blue hour", pt: "Marta, hora azul" }, x: "f/1.8 · 1/160 · ISO 400", l: "85 mm" },
    { id: "1494790108377-be9c29b29330", s: "portraits", c: { en: "Joana, laughing at the second take", pt: "Joana, a rir no segundo take" }, x: "f/2.2 · 1/250 · ISO 200", l: "50 mm" },
    { id: "1507003211169-0a1dd7228f2d", s: "portraits", c: { en: "Diogo against the courtyard wall", pt: "Diogo contra o muro do pátio" }, x: "f/2 · 1/320 · ISO 100", l: "85 mm" },
    { id: "1438761681033-6461ffad8d80", s: "portraits", c: { en: "Lake light, late afternoon", pt: "Luz do lago, fim de tarde" }, x: "f/1.4 · 1/500 · ISO 100", l: "50 mm" },
    { id: "1517841905240-472988babdf9", s: "portraits", c: { en: "Teal door, Alfama", pt: "Porta azul, Alfama" }, x: "f/2.8 · 1/200 · ISO 200", l: "35 mm" },
    { id: "1529626455594-4ff0802cfb7e", s: "portraits", c: { en: "Inês, between frames", pt: "Inês, entre fotogramas" }, x: "f/2 · 1/250 · ISO 160", l: "85 mm" },
    { id: "1519741497674-611481863552", s: "weddings", c: { en: "Bouquet in the last light", pt: "O ramo na última luz" }, x: "f/1.8 · 1/400 · ISO 320", l: "50 mm" },
    { id: "1511285560929-80b456fea0bc", s: "weddings", c: { en: "Balloons over the garden", pt: "Balões sobre o jardim" }, x: "f/4 · 1/640 · ISO 100", l: "24 mm" },
    { id: "1465495976277-4387d4b0b4c6", s: "weddings", c: { en: "Hands, after the vows", pt: "Mãos, depois dos votos" }, x: "f/2.8 · 1/320 · ISO 200", l: "85 mm" },
    { id: "1583939003579-730e3918a45a", s: "weddings", c: { en: "The walk back through the guests", pt: "O regresso por entre os convidados" }, x: "f/2.8 · 1/500 · ISO 200", l: "35 mm" },
    { id: "1600607687939-ce8a6c25118c", s: "spaces", c: { en: "Living room, morning", pt: "Sala, de manhã" }, x: "f/8 · 1/30 · ISO 200", l: "16 mm" },
    { id: "1600585154340-be6161a56a0c", s: "spaces", c: { en: "House under the oak, dusk", pt: "Casa sob o carvalho, ao anoitecer" }, x: "f/8 · 1/15 · ISO 400", l: "24 mm" },
    { id: "1600566753190-17f0baa2a6c3", s: "spaces", c: { en: "Timber and concrete", pt: "Madeira e betão" }, x: "f/11 · 1/125 · ISO 100", l: "24 mm" },
    { id: "1513694203232-719a280e022f", s: "spaces", c: { en: "A quiet corner", pt: "Um canto calmo" }, x: "f/5.6 · 1/60 · ISO 200", l: "35 mm" },
    { id: "1414235077428-338989a2e8c0", s: "table", c: { en: "Second course, candlelight", pt: "Segundo prato, à luz das velas" }, x: "f/2 · 1/60 · ISO 1600", l: "35 mm" },
    { id: "1504674900247-0877df9cc836", s: "table", c: { en: "Sharing plates from above", pt: "Pratos para partilhar, vistos de cima" }, x: "f/4 · 1/125 · ISO 400", l: "50 mm" },
    { id: "1540189549336-e6e99c3679fe", s: "table", c: { en: "Green bowl, orange morning", pt: "Taça verde, manhã laranja" }, x: "f/3.5 · 1/160 · ISO 200", l: "50 mm" },
    { id: "1500530855697-b586d89ba3ee", s: "away", c: { en: "The road in", pt: "A estrada de entrada" }, x: "f/8 · 1/250 · ISO 100", l: "35 mm" },
    { id: "1506744038136-46273834b3fb", s: "away", c: { en: "Valley, first light", pt: "Vale, primeira luz" }, x: "f/11 · 1/60 · ISO 100", l: "24 mm" },
    { id: "1470071459604-3b5ec3a7fe05", s: "away", c: { en: "Cloud over the ridge", pt: "Nuvem sobre a serra" }, x: "f/9 · 1/200 · ISO 100", l: "24 mm" },
    { id: "1501785888041-af3ef285b470", s: "away", c: { en: "One boat, green water", pt: "Um barco, água verde" }, x: "f/8 · 1/320 · ISO 100", l: "35 mm" },
    { id: "1469474968028-56623f02e42e", s: "away", c: { en: "Hills after rain", pt: "Colinas depois da chuva" }, x: "f/8 · 1/400 · ISO 100", l: "70 mm" }
  ];

  var SESSIONS = [
    { id: "portrait", name: { en: "Portrait", pt: "Retrato" }, price: 220, items: { en: ["90 minutes, one location", "25 edited photographs", "Online gallery for a year"], pt: ["90 minutos, um local", "25 fotografias editadas", "Galeria online durante um ano"] } },
    { id: "wedding", name: { en: "Wedding day", pt: "Dia de casamento" }, price: 1600, items: { en: ["From getting ready to first dance", "500+ edited photographs", "A printed book of 40 pages"], pt: ["Da preparação à primeira dança", "Mais de 500 fotografias editadas", "Um livro impresso de 40 páginas"] } },
    { id: "spaces", name: { en: "Spaces", pt: "Espaços" }, price: 480, items: { en: ["Half a day, interiors and outside", "20 corrected architectural frames", "Licence for web and print"], pt: ["Meio dia, interior e exterior", "20 fotogramas de arquitetura corrigidos", "Licença para web e impressão"] } },
    { id: "table", name: { en: "Table", pt: "Mesa" }, price: 350, items: { en: ["Up to 12 dishes", "Natural light set in your kitchen", "Menu-ready crops"], pt: ["Até 12 pratos", "Luz natural montada na sua cozinha", "Recortes prontos para o menu"] } }
  ];

  /* ───────── header ───────── */

  var toggle = $(".nav-toggle"), nav = $("#nav");
  toggle.addEventListener("click", function () {
    var open = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
  });
  nav.addEventListener("click", function (e) { if (e.target.closest("a")) { toggle.setAttribute("aria-expanded", "false"); nav.classList.remove("is-open"); } });
  var header = $(".site-header");
  addEventListener("scroll", function () { header.classList.toggle("is-solid", scrollY > innerHeight * 0.6); }, { passive: true });

  /* ───────── viewfinder hero ───────── */

  var heroPicks = [0, 6, 10, 14, 18].map(function (i) { return PHOTOS[i]; });
  var finder = $("[data-finder]");
  finder.innerHTML = heroPicks.map(function (p, i) {
    return '<img src="' + img(p.id, 1800) + '" alt="" class="' + (i === 0 ? "is-on" : "") + '"' + (i ? ' loading="lazy"' : "") + ">";
  }).join("");
  var heroIndex = 0;
  function paintHud() {
    var p = heroPicks[heroIndex];
    $("[data-hud-series]").textContent = t("s." + p.s);
    $("[data-hud-frame]").textContent = String(PHOTOS.indexOf(p) + 1).padStart(2, "0") + " / " + PHOTOS.length;
    $("[data-hud-exif]").textContent = p.x + " · " + p.l;
  }
  function nextHero() {
    var imgs = $$("img", finder);
    imgs[heroIndex].classList.remove("is-on");
    heroIndex = (heroIndex + 1) % imgs.length;
    imgs[heroIndex].classList.add("is-on");
    paintHud();
    restartMeter();
  }
  var meter = $("[data-hud-meter]");
  function restartMeter() { meter.style.animation = "none"; void meter.offsetWidth; meter.style.animation = ""; }
  if (!reduced) setInterval(function () { if (!document.hidden) nextHero(); }, 5200);
  // the image drifts slightly with the pointer, like a handheld frame
  if (fine && !reduced) {
    $(".finder").addEventListener("pointermove", function (e) {
      var x = (e.clientX / innerWidth - 0.5) * -14, y = (e.clientY / innerHeight - 0.5) * -10;
      finder.style.transform = "translate3d(" + x + "px," + y + "px,0) scale(1.04)";
    });
  }

  /* ───────── series index with a peek that follows the pointer ───────── */

  var peek = $("[data-peek]"), peekImg = $("img", peek);
  function paintSeries() {
    $("[data-series]").innerHTML = SERIES.map(function (s, i) {
      var n = PHOTOS.filter(function (p) { return p.s === s; }).length;
      return '<li><a href="#work" data-series-link="' + s + '"><span class="num">0' + (i + 1) + '</span><span class="sname">' + esc(t("s." + s)) + '</span><span class="sdesc">' + esc(t("sd." + s)) + '</span><span class="scount">' + esc(t("frames", { n: n })) + "</span></a></li>";
    }).join("");
  }
  var peekPos = { x: 0, y: 0, tx: 0, ty: 0, on: false };
  if (fine && !reduced) {
    $("[data-series]").addEventListener("pointerover", function (e) {
      var a = e.target.closest("[data-series-link]");
      if (!a) return;
      var first = PHOTOS.filter(function (p) { return p.s === a.getAttribute("data-series-link"); })[0];
      peekImg.src = img(first.id, 600);
      peek.classList.add("on");
      if (!peekPos.on) { peekPos.x = peekPos.tx; peekPos.y = peekPos.ty; }
      peekPos.on = true;
    });
    $("[data-series]").addEventListener("pointerleave", function () { peek.classList.remove("on"); peekPos.on = false; });
    addEventListener("pointermove", function (e) { peekPos.tx = e.clientX; peekPos.ty = e.clientY; }, { passive: true });
    (function loop() {
      peekPos.x += (peekPos.tx - peekPos.x) * 0.14;
      peekPos.y += (peekPos.ty - peekPos.y) * 0.14;
      peek.style.transform = "translate3d(" + peekPos.x + "px," + peekPos.y + "px,0) translate(-50%,-50%) rotate(" + (peekPos.tx - peekPos.x) * 0.04 + "deg)";
      requestAnimationFrame(loop);
    })();
  }
  $("[data-series]").addEventListener("click", function (e) {
    var a = e.target.closest("[data-series-link]");
    if (!a) return;
    e.preventDefault();
    filter = a.getAttribute("data-series-link");
    paintTable();
    $(".table").scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  });

  /* ───────── light table ───────── */

  var filter = "all";
  function visible() { return PHOTOS.filter(function (p) { return filter === "all" || p.s === filter; }); }
  function paintTable() {
    $("[data-filters]").innerHTML = ["all"].concat(SERIES).map(function (s) {
      return '<button type="button" data-filter="' + s + '" aria-pressed="' + (filter === s) + '">' + esc(s === "all" ? t("all") : t("s." + s)) + "</button>";
    }).join("");
    $("[data-frames]").innerHTML = visible().map(function (p, i) {
      return '<li class="frame" style="--d:' + (i * 40) + 'ms"><button type="button" data-open="' + PHOTOS.indexOf(p) + '" aria-label="' + esc(t("open") + ": " + L(p.c)) + '">' +
        '<img src="' + img(p.id, 700) + '" alt="' + esc(L(p.c)) + '" loading="lazy">' +
        '<span class="fnum">' + String(PHOTOS.indexOf(p) + 1).padStart(2, "0") + "</span>" +
        '<span class="fcap">' + esc(L(p.c)) + "</span></button></li>";
    }).join("");
  }
  $("[data-filters]").addEventListener("click", function (e) {
    var b = e.target.closest("[data-filter]");
    if (!b) return;
    filter = b.getAttribute("data-filter");
    paintTable();
  });

  /* ───────── lightbox with loupe ───────── */

  var lb = $("[data-lightbox]"), lbImg = $("[data-lb-img]"), stage = $("[data-lb-stage]"), loupe = $("[data-loupe]");
  var current = 0;
  function openAt(i) {
    current = i;
    var p = PHOTOS[i];
    lbImg.src = img(p.id, 1800);
    lbImg.alt = L(p.c);
    loupe.style.backgroundImage = "url(" + img(p.id, 2600) + ")";
    $("[data-lb-caption]").textContent = String(i + 1).padStart(2, "0") + " — " + L(p.c);
    $("[data-lb-meta]").textContent = t("s." + p.s) + " · " + p.x + " · " + p.l + (fine ? " · " + t("loupeHint") : "");
    if (!lb.open) lb.showModal();
  }
  function step(dir) {
    var list = visible().map(function (p) { return PHOTOS.indexOf(p); });
    var at = list.indexOf(current);
    if (at === -1) at = 0;
    openAt(list[(at + dir + list.length) % list.length]);
  }
  $("[data-frames]").addEventListener("click", function (e) {
    var b = e.target.closest("[data-open]");
    if (b) openAt(+b.getAttribute("data-open"));
  });
  $("[data-lb-close]").addEventListener("click", function () { lb.close(); });
  $$("[data-lb-step]").forEach(function (b) { b.addEventListener("click", function () { step(+b.getAttribute("data-lb-step")); }); });
  lb.addEventListener("click", function (e) { if (e.target === lb) lb.close(); });
  addEventListener("keydown", function (e) {
    if (!lb.open) return;
    if (e.key === "ArrowRight") step(1);
    if (e.key === "ArrowLeft") step(-1);
  });
  var touchX = null;
  lb.addEventListener("touchstart", function (e) { touchX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", function (e) {
    if (touchX == null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
    touchX = null;
  });
  // loupe: a 2.5× circle under the pointer
  if (fine) {
    stage.addEventListener("pointermove", function (e) {
      var r = lbImg.getBoundingClientRect();
      var x = e.clientX - r.left, y = e.clientY - r.top;
      if (x < 0 || y < 0 || x > r.width || y > r.height) { loupe.classList.remove("on"); return; }
      loupe.classList.add("on");
      loupe.style.left = x + (r.left - stage.getBoundingClientRect().left) + "px";
      loupe.style.top = y + (r.top - stage.getBoundingClientRect().top) + "px";
      var z = 2.5;
      loupe.style.backgroundSize = r.width * z + "px " + r.height * z + "px";
      loupe.style.backgroundPosition = -(x * z - 80) + "px " + -(y * z - 80) + "px";
    });
    stage.addEventListener("pointerleave", function () { loupe.classList.remove("on"); });
  }

  /* ───────── sessions + enquiry ───────── */

  function paintSessions() {
    $("[data-sessions]").innerHTML = SESSIONS.map(function (s) {
      return '<article class="session"><h3>' + esc(L(s.name)) + '</h3><p class="price"><span>' + esc(t("from")) + "</span> " + s.price.toLocaleString(I18N.lang === "pt" ? "pt-PT" : "en-GB") + " €</p><ul>" +
        L(s.items).map(function (it) { return "<li>" + esc(it) + "</li>"; }).join("") +
        '</ul><a class="btn btn-line" href="#enquire" data-pick-session="' + s.id + '">' + esc(t("choose")) + "</a></article>";
    }).join("");
    var sel = $("[data-session-select]"), keep = sel.value;
    sel.innerHTML = SESSIONS.map(function (s) { return '<option value="' + s.id + '">' + esc(L(s.name)) + "</option>"; }).join("");
    if (keep) sel.value = keep;
  }
  $("[data-sessions]").addEventListener("click", function (e) {
    var a = e.target.closest("[data-pick-session]");
    if (a) $("[data-session-select]").value = a.getAttribute("data-pick-session");
  });

  function iso(d) { return d.toISOString().slice(0, 10); }
  function pretty(isoDate) {
    var d = new Date(isoDate + "T12:00:00");
    return d.getDate() + " " + t("months").split(",")[d.getMonth()];
  }
  // a stable, made-up calendar: some days are taken
  function taken(isoDate, session) {
    var h = 0, s = isoDate + session;
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h % 3 === 0;
  }
  var dateIn = $("[data-date]");
  var todayIso = iso(new Date());
  dateIn.min = todayIso;
  function checkDate() {
    var out = $("[data-date-check]");
    var v = dateIn.value, session = $("[data-session-select]").value;
    out.className = "date-check";
    if (!v) { out.textContent = ""; return; }
    if (v < todayIso) { out.textContent = t("datePast"); out.classList.add("bad"); return; }
    if (!taken(v, session)) { out.textContent = t("dateFree", { date: pretty(v) }); out.classList.add("good"); return; }
    var d = new Date(v + "T12:00:00");
    for (var i = 1; i < 60; i++) {
      d.setDate(d.getDate() + 1);
      if (!taken(iso(d), session)) break;
    }
    out.textContent = t("dateTaken", { date: pretty(v), next: pretty(iso(d)) });
    out.classList.add("bad");
  }
  dateIn.addEventListener("change", checkDate);
  $("[data-session-select]").addEventListener("change", checkDate);

  $("[data-enquire]").addEventListener("submit", function (e) {
    e.preventDefault();
    var f = e.target.elements, note = $("[data-form-note]");
    if (!f.name.value.trim()) { note.textContent = t("errName"); f.name.focus(); return; }
    if (!f.email.checkValidity() || !f.email.value) { note.textContent = t("errEmail"); f.email.focus(); return; }
    note.textContent = t("sent", { name: f.name.value.trim().split(" ")[0], date: f.date.value ? pretty(f.date.value) : "—" });
    e.target.reset();
    checkDate();
  });

  /* ───────── language + reveal ───────── */

  function paintAll() {
    paintHud();
    paintSeries();
    paintTable();
    paintSessions();
    checkDate();
    $$("[data-i18n-alt]").forEach(function (el) { el.alt = t(el.getAttribute("data-i18n-alt")); });
    if (lb.open) openAt(current);
  }
  paintAll();
  document.addEventListener("langchange", paintAll);

  if ("IntersectionObserver" in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.15 });
    $$(".series, .table, .studio, .sessions, .enquire").forEach(function (el) { el.classList.add("reveal"); io.observe(el); });
  }
})();
