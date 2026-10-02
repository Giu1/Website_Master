/**
 * Nido — a bakery that runs on the clock.
 * The tray sells through the morning (stock falls with time), the bake line
 * marks what has come out of the oven, and pre-orders move from "received" to
 * "in the oven" to "on the shelf" as pick-up approaches. Orders and event
 * sign-ups are kept in this browser (localStorage).
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
  function img(id, w) { return "https://images.unsplash.com/photo-" + id + "?auto=format&fit=crop&w=" + w + "&q=75"; }
  function money(n) { return n.toFixed(2).replace(".", I18N.lang === "pt" ? "," : "."); }
  function hhmm(min) { return String(Math.floor(min / 60)).padStart(2, "0") + ":" + String(Math.round(min % 60)).padStart(2, "0"); }
  function toMin(s) { var p = s.split(":"); return +p[0] * 60 + +p[1]; }
  function nowMin() { var d = new Date(); return d.getHours() * 60 + d.getMinutes(); }
  function iso(offset) { var d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + offset); return d.toISOString().slice(0, 10); }
  function load(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch (e) { return fallback; } }
  function store(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* private mode */ } }

  // weekday 0 = Sunday; null = closed
  var HOURS = [{ open: "08:00", close: "13:00" }, null, { open: "07:00", close: "15:00" }, { open: "07:00", close: "15:00" }, { open: "07:00", close: "15:00" }, { open: "07:00", close: "15:00" }, { open: "07:00", close: "15:00" }];

  // id, photo, price, daily stock, out of the oven at, sold per hour once out
  var PRODUCTS = [
    { id: "sourdough", img: "1549931319-a545dcf3bc73", price: 5.2, stock: 40, from: "06:30", rate: 7 },
    { id: "croissant", img: "1555507036-ab1f4038808a", price: 2.1, stock: 90, from: "07:00", rate: 22 },
    { id: "bun", img: "1568254183919-78a4f43a2877", price: 2.6, stock: 48, from: "08:00", rate: 14 },
    { id: "rye", img: "1509440159596-0249088772ff", price: 4.8, stock: 24, from: "09:30", rate: 4 },
    { id: "cookie", img: "1558961363-fa8fdf82db35", price: 1.9, stock: 60, from: "11:00", rate: 18 },
    { id: "coffee", img: "1509042239860-f550ce710b93", price: 2.4, stock: 999, from: "07:00", rate: 0 }
  ];
  function product(id) { return PRODUCTS.filter(function (p) { return p.id === id; })[0]; }

  /* ───────── header + open status ───────── */

  var toggle = $(".nav-toggle"), nav = $("#nav");
  toggle.addEventListener("click", function () {
    var open = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
  });
  nav.addEventListener("click", function (e) { if (e.target.closest("a")) { toggle.setAttribute("aria-expanded", "false"); nav.classList.remove("is-open"); } });
  addEventListener("scroll", function () { $(".site-header").classList.toggle("is-stuck", scrollY > 30); }, { passive: true });

  function isOpenNow() {
    var h = HOURS[new Date().getDay()], m = nowMin();
    return !!(h && m >= toMin(h.open) && m < toMin(h.close));
  }
  function paintStatus() {
    var el = $("[data-status]"), d = new Date().getDay(), h = HOURS[d], m = nowMin();
    if (isOpenNow()) { el.className = "status open"; el.textContent = t("openNow", { time: h.close }); return; }
    for (var i = 0; i < 8; i++) {
      var day = (d + i) % 7, hh = HOURS[day];
      if (!hh || (i === 0 && m >= toMin(hh.open))) continue;
      el.className = "status";
      el.textContent = t("closedNow", { day: i === 0 ? t("today").toLowerCase() : i === 1 ? t("tomorrow").toLowerCase() : t("D" + day), time: hh.open });
      return;
    }
  }

  /* ───────── stock that sells through the morning ───────── */

  function orderedToday(id) {
    return load("nido-orders", []).filter(function (o) { return o.day === iso(0); })
      .reduce(function (sum, o) { return sum + o.items.filter(function (i) { return i.id === id; }).reduce(function (s, i) { return s + i.qty; }, 0); }, 0);
  }
  /** { state: "soon" | "on" | "out", left, at } for today. */
  function stockNow(p) {
    var h = HOURS[new Date().getDay()];
    if (!h) return { state: "closed" };
    var m = nowMin(), from = toMin(p.from);
    if (p.rate === 0) return { state: isOpenNow() ? "on" : "soon", left: null };
    if (m < from) return { state: "soon", at: p.from };
    var sold = Math.floor(((Math.min(m, toMin(h.close)) - from) / 60) * p.rate) + orderedToday(p.id);
    var left = Math.max(0, p.stock - sold);
    if (left > 0) return { state: "on", left: left };
    var outAt = from + ((p.stock - orderedToday(p.id)) / p.rate) * 60;
    return { state: "out", at: hhmm(Math.min(outAt, toMin(h.close))) };
  }

  function paintBake() {
    var m = nowMin();
    var list = PRODUCTS.filter(function (p) { return p.rate; }).slice().sort(function (a, b) { return toMin(a.from) - toMin(b.from); });
    var nextShown = false;
    $("[data-bake]").innerHTML = list.map(function (p) {
      var done = m >= toMin(p.from);
      var cls = done ? "done" : !nextShown ? "next" : "";
      if (!done && !nextShown) nextShown = true;
      return '<li class="' + cls + '"><span class="b-time">' + p.from + '</span><span class="b-name">' + esc(t("p." + p.id)) + "</span>" +
        (cls ? '<span class="b-tag">' + esc(t(done ? "bakeDone" : "bakeNext")) + "</span>" : "") + "</li>";
    }).join("");
  }

  function paintTray() {
    $("[data-tray]").innerHTML = PRODUCTS.map(function (p) {
      var s = stockNow(p), inBasket = basket[p.id] || 0;
      var badge = s.state === "on" ? (s.left === null ? "" : '<span class="badge">' + esc(t("left", { n: s.left })) + "</span>")
        : s.state === "out" ? '<span class="badge out">' + esc(t("soldOut", { time: s.at })) + "</span>"
        : s.state === "soon" && s.at ? '<span class="badge soon">' + esc(t("notYet", { time: s.at })) + "</span>" : "";
      var meter = s.state === "on" && s.left !== null ? '<span class="meter" aria-hidden="true"><i style="--p:' + Math.round((s.left / p.stock) * 100) + '%"></i></span>' : "";
      var label = s.state === "on" ? t(inBasket ? "added" : "add") : t("preorder");
      return '<article class="item' + (s.state === "out" ? " is-out" : "") + '">' +
        '<figure><img src="' + img(p.img, 700) + '" alt="' + esc(t("p." + p.id)) + '" loading="lazy">' + badge + "</figure>" +
        '<div class="item-body"><h3>' + esc(t("p." + p.id)) + '</h3><p class="muted">' + esc(t("pd." + p.id)) + "</p>" + meter +
        '<div class="item-foot"><span class="price">' + money(p.price) + ' €</span><button type="button" class="add' + (inBasket ? " in" : "") + '" data-add="' + p.id + '">' + esc(label) + (inBasket ? " · " + inBasket : "") + "</button></div></div></article>";
    }).join("");
  }

  /* ───────── basket + pick-up ───────── */

  var basket = {};
  var pickup = { day: 0, time: null };
  var drawer = $("[data-basket]"), scrim = $("[data-scrim]");

  function openBasket(on) {
    drawer.classList.toggle("open", on);
    drawer.setAttribute("aria-hidden", String(!on));
    scrim.hidden = !on;
    document.body.classList.toggle("lock", on);
    if (on) setTimeout(function () { $("[data-close-basket]").focus(); }, 50);
  }
  $("[data-open-basket]").addEventListener("click", function () { openBasket(true); });
  $("[data-close-basket]").addEventListener("click", function () { openBasket(false); });
  scrim.addEventListener("click", function () { openBasket(false); });
  addEventListener("keydown", function (e) { if (e.key === "Escape" && drawer.classList.contains("open")) openBasket(false); });

  $("[data-tray]").addEventListener("click", function (e) {
    var b = e.target.closest("[data-add]");
    if (!b) return;
    var id = b.getAttribute("data-add");
    basket[id] = (basket[id] || 0) + 1;
    if (stockNow(product(id)).state !== "on") pickup.day = 1;   // sold out or not yet: a pre-order for tomorrow
    paintTray();
    paintBasket();
    $("[data-count]").classList.remove("bump"); void $("[data-count]").offsetWidth; $("[data-count]").classList.add("bump");
  });

  function sum() { return Object.keys(basket).reduce(function (s, id) { return s + product(id).price * basket[id]; }, 0); }

  function slotsFor(dayOffset) {
    var d = new Date(); d.setDate(d.getDate() + dayOffset);
    var h = HOURS[d.getDay()];
    if (!h) return [];
    var out = [], start = toMin(h.open) + 30, end = toMin(h.close) - 30;
    for (var m = start; m <= end; m += 30) {
      if (dayOffset === 0 && m < nowMin() + 45) continue;
      out.push(hhmm(m));
    }
    return out;
  }

  function paintBasket() {
    var ids = Object.keys(basket).filter(function (id) { return basket[id] > 0; });
    var count = ids.reduce(function (s, id) { return s + basket[id]; }, 0);
    $("[data-count]").textContent = count;
    $("[data-empty]").hidden = ids.length > 0;
    $("[data-lines]").innerHTML = ids.map(function (id) {
      var p = product(id);
      return '<li><img src="' + img(p.img, 160) + '" alt=""><span class="l-name">' + esc(t("p." + id)) + '<small>' + money(p.price) + " €</small></span>" +
        '<span class="qty"><button type="button" data-qty="-1" data-id="' + id + '" aria-label="−">−</button><output>' + basket[id] + '</output><button type="button" data-qty="1" data-id="' + id + '" aria-label="+">+</button></span></li>';
    }).join("");

    $("[data-days]").innerHTML = [0, 1].map(function (d) {
      var free = slotsFor(d).length > 0;
      return '<button type="button" data-day="' + d + '" aria-pressed="' + (pickup.day === d) + '"' + (free ? "" : " disabled") + ">" + esc(t(d ? "tomorrow" : "today")) + "</button>";
    }).join("");
    if (!slotsFor(pickup.day).length && slotsFor(1).length) pickup.day = 1;
    var slots = slotsFor(pickup.day);
    if (slots.indexOf(pickup.time) === -1) pickup.time = null;
    $("[data-slots]").innerHTML = slots.map(function (s) {
      return '<button type="button" class="slot" data-slot="' + s + '" aria-pressed="' + (pickup.time === s) + '">' + s + "</button>";
    }).join("");
    $$("[data-days] button").forEach(function (b) { b.setAttribute("aria-pressed", String(+b.getAttribute("data-day") === pickup.day)); });
    $("[data-total]").textContent = t("total", { sum: money(sum()) });
    paintOrders();
  }

  drawer.addEventListener("click", function (e) {
    var q = e.target.closest("[data-qty]");
    if (q) {
      var id = q.getAttribute("data-id");
      basket[id] = Math.max(0, (basket[id] || 0) + +q.getAttribute("data-qty"));
      if (!basket[id]) delete basket[id];
      paintBasket(); paintTray(); return;
    }
    var d = e.target.closest("[data-day]");
    if (d) { pickup.day = +d.getAttribute("data-day"); paintBasket(); return; }
    var s = e.target.closest("[data-slot]");
    if (s) { pickup.time = s.getAttribute("data-slot"); paintBasket(); return; }
    var r = e.target.closest("[data-remove-order]");
    if (r) {
      store("nido-orders", load("nido-orders", []).filter(function (o) { return o.code !== r.getAttribute("data-remove-order"); }));
      paintBasket(); paintTray();
    }
  });

  $("[data-pickup]").addEventListener("submit", function (e) {
    e.preventDefault();
    var f = e.target.elements, note = $("[data-order-note]");
    note.className = "form-note";
    var ids = Object.keys(basket);
    if (!ids.length) { note.textContent = t("errEmpty"); return; }
    if (!pickup.time) { note.textContent = t("errSlot"); return; }
    if (!f.name.value.trim()) { note.textContent = t("errName"); f.name.focus(); return; }
    if (f.phone.value.replace(/\D/g, "").length < 9) { note.textContent = t("errPhone"); f.phone.focus(); return; }
    if (pickup.day === 0) {
      for (var i = 0; i < ids.length; i++) {
        var s = stockNow(product(ids[i]));
        if (s.left !== null && s.left !== undefined && s.left < basket[ids[i]]) { note.textContent = t("errStock", { item: t("p." + ids[i]).toLowerCase() }); return; }
      }
    }
    var code = "NI-" + Math.random().toString(36).slice(2, 6).toUpperCase();
    var orders = load("nido-orders", []);
    orders.push({ code: code, day: iso(pickup.day), time: pickup.time, items: ids.map(function (id) { return { id: id, qty: basket[id] }; }), sum: +sum().toFixed(2), name: f.name.value.trim() });
    store("nido-orders", orders);
    note.textContent = t("ordered", { code: code, time: pickup.time });
    note.classList.add("ok");
    basket = {};
    pickup.time = null;
    e.target.reset();
    paintBasket(); paintTray();
  });

  function statusOf(o) {
    var diff = (new Date(o.day + "T" + o.time + ":00") - new Date()) / 60000;   // minutes to pick-up
    if (diff > 90) return "received";
    if (diff > 15) return "oven";
    if (diff > -120) return "ready";
    return "collected";
  }
  function paintOrders() {
    var list = load("nido-orders", []).filter(function (o) { return o.day >= iso(0); });
    var box = $("[data-orders]");
    if (!list.length) { box.innerHTML = ""; return; }
    var steps = ["received", "oven", "ready"];
    box.innerHTML = "<h3>" + esc(t("ordersTitle")) + "</h3>" + list.map(function (o) {
      var st = statusOf(o), at = steps.indexOf(st);
      return '<div class="order"><p class="o-line">' + esc(t("orderLine", { code: o.code, when: o.day === iso(0) ? t("today") : t("tomorrow"), time: o.time, sum: money(o.sum) })) + "</p>" +
        '<ol class="o-steps">' + steps.map(function (s, i) { return '<li class="' + (i <= at || st === "collected" ? "on" : "") + '">' + esc(t("st." + s)) + "</li>"; }).join("") + "</ol>" +
        '<button type="button" class="link" data-remove-order="' + esc(o.code) + '">' + esc(t("remove")) + "</button></div>";
    }).join("");
  }

  /* ───────── weekend events ───────── */

  var EVENTS = [
    { id: "kids", img: "1486427944299-d1955d23e34d", day: 6, time: "10:00", seats: 8, taken: 5 },
    { id: "bread", img: "1608198093002-ad4e005484ec", day: 6, time: "15:00", seats: 10, taken: 9 },
    { id: "cinnamon", img: "1568254183919-78a4f43a2877", day: 0, time: "08:00–12:00", seats: 30, taken: 21 }
  ];
  function paintEvents() {
    var joined = load("nido-events", []);
    $("[data-events]").innerHTML = EVENTS.map(function (ev) {
      var me = joined.indexOf(ev.id) !== -1;
      var left = ev.seats - ev.taken - (me ? 1 : 0);
      var descKey = ev.id === "bread" ? "e.bread.d" : "e." + ev.id + "D";
      return '<article class="event"><figure><img src="' + img(ev.img, 700) + '" alt="" loading="lazy"><span class="when">' + esc(t("D" + ev.day)) + " · " + esc(ev.time) + "</span></figure>" +
        '<div class="event-body"><h3>' + esc(t("e." + ev.id)) + "</h3><p class=\"muted\">" + esc(t(descKey)) + "</p>" +
        '<div class="event-foot"><span class="spots' + (left <= 0 && !me ? " full" : "") + '">' + esc(left > 0 || me ? t("spots", { n: Math.max(0, left) }) : t("full")) + "</span>" +
        (me ? '<span class="joined">✓ ' + esc(t("joined")) + ' <button type="button" class="link" data-leave="' + ev.id + '">' + esc(t("leave")) + "</button></span>"
            : '<button type="button" class="btn btn-small" data-join="' + ev.id + '"' + (left <= 0 ? " disabled" : "") + ">" + esc(t("join")) + "</button>") +
        "</div></div></article>";
    }).join("");
  }
  $("[data-events]").addEventListener("click", function (e) {
    var j = e.target.closest("[data-join]"), l = e.target.closest("[data-leave]");
    var joined = load("nido-events", []);
    if (j) joined.push(j.getAttribute("data-join"));
    else if (l) joined = joined.filter(function (x) { return x !== l.getAttribute("data-leave"); });
    else return;
    store("nido-events", joined);
    paintEvents();
  });

  /* ───────── catering calculator ───────── */

  var boxKind = "full";
  var PER_PERSON = { light: 6.5, full: 9.5 };
  function paintCater() {
    var n = +$("[data-people]").value;
    $("[data-people-out]").textContent = n;
    $("[data-box-kind]").innerHTML = ["light", "full"].map(function (k) {
      return '<button type="button" data-kind="' + k + '" aria-pressed="' + (boxKind === k) + '">' + esc(t("box." + k)) + " · " + money(PER_PERSON[k]) + " €</button>";
    }).join("");
    var pastries = Math.ceil(n * (boxKind === "full" ? 1.5 : 1)), loaves = Math.ceil(n / 6), fruit = boxKind === "full" ? Math.ceil(n / 10) : 0;
    $("[data-cater-sum]").innerHTML =
      "<div><dt>" + esc(t("boxes")) + "</dt><dd>" + Math.ceil(n / 8) + "</dd></div>" +
      "<div><dt>" + esc(t("mix")) + "</dt><dd>" + esc(t("mixLine", { c: pastries, b: loaves, f: fruit })) + "</dd></div>" +
      '<div class="big"><dt>' + esc(t("totalLabel")) + "</dt><dd>" + money(n * PER_PERSON[boxKind]) + " €</dd></div>";
  }
  $("[data-people]").addEventListener("input", paintCater);
  $("[data-box-kind]").addEventListener("click", function (e) {
    var b = e.target.closest("[data-kind]");
    if (b) { boxKind = b.getAttribute("data-kind"); paintCater(); }
  });
  $("[data-cater]").addEventListener("submit", function (e) {
    e.preventDefault();
    var f = e.target.elements, note = $("[data-cater-note]");
    if (!f.company.value.trim()) { note.textContent = t("errCompany"); f.company.focus(); return; }
    if (!f.email.value || !f.email.checkValidity()) { note.textContent = t("errEmail"); f.email.focus(); return; }
    note.textContent = t("caterSent", { n: $("[data-people]").value });
    e.target.reset();
    $("[data-people]").value = 20;
    paintCater();
  });

  /* ───────── hours ───────── */

  function paintHours() {
    var today = new Date().getDay();
    $("[data-hours]").innerHTML = [1, 2, 3, 4, 5, 6, 0].map(function (d) {
      var h = HOURS[d];
      return '<div class="' + (d === today ? "today" : "") + '"><dt>' + esc(t("D" + d)) + "</dt><dd>" + (h ? h.open + "–" + h.close : "—") + "</dd></div>";
    }).join("");
  }

  /* ───────── everything, and keep it live ───────── */

  function paintAll() {
    paintStatus(); paintBake(); paintTray(); paintBasket(); paintEvents(); paintCater(); paintHours();
    $$("[data-i18n-alt]").forEach(function (el) { el.alt = t(el.getAttribute("data-i18n-alt")); });
  }
  paintAll();
  document.addEventListener("langchange", paintAll);
  // the tray and order statuses move with the clock
  setInterval(function () { if (!document.hidden) { paintStatus(); paintBake(); paintTray(); paintOrders(); } }, 60000);

  if ("IntersectionObserver" in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.15 });
    $$(".tray, .weekends, .catering, .visit").forEach(function (el) { el.classList.add("reveal"); io.observe(el); });
  }
})();
