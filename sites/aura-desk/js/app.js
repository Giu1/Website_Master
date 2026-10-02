/**
 * Aura Desk — the salon's backoffice (demo).
 * Sign in with demo / demo. Every change writes to AuraStore, which the Aura
 * site reads, so edits and decisions show up there immediately (also across
 * tabs). Requests made on the site arrive here live, with a notification.
 */
(function () {
  var S = window.AuraStore;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var AUTH = "aura-desk-auth";
  var GUIDE = "aura-desk-guide";

  function t(key, vars) {
    var out = I18N.t(window.SITE_I18N, key);
    if (vars) Object.keys(vars).forEach(function (k) { out = out.split("{" + k + "}").join(vars[k]); });
    return out;
  }
  function txt(v) { return S.text(v, I18N.lang); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function dayLabel(iso) {
    if (iso === S.isoDay(0)) return t("today");
    if (iso === S.isoDay(1)) return t("tomorrow");
    var d = new Date(iso + "T12:00:00");
    return t("d" + d.getDay()) + " " + d.getDate() + " " + t("months").split(",")[d.getMonth()];
  }
  function when(b) { return dayLabel(b.date) + ", " + b.time; }
  function svcName(data, id) { var s = S.service(data, id); return s ? txt(s.name) : id; }
  function staffName(data, id) { var m = S.member(data, id); return m ? m.name : "—"; }

  /* ───────── toasts ───────── */

  function toast(message, tone) {
    var box = $("[data-toasts]");
    var el = document.createElement("div");
    el.className = "toast" + (tone ? " " + tone : "");
    el.textContent = message;
    box.appendChild(el);
    requestAnimationFrame(function () { el.classList.add("in"); });
    setTimeout(function () { el.classList.remove("in"); setTimeout(function () { el.remove(); }, 400); }, 3800);
  }

  /* ───────── demo checklist ───────── */

  function guide() { try { return JSON.parse(localStorage.getItem(GUIDE)) || {}; } catch (e) { return {}; } }
  function tick(step) {
    var g = guide();
    if (g[step]) return;
    g[step] = true;
    try { localStorage.setItem(GUIDE, JSON.stringify(g)); } catch (e) { /* ignore */ }
    paintGuide();
  }
  function paintGuide() {
    var g = guide();
    $("[data-guide]").innerHTML = ["g1", "g2", "g3", "g4", "g5"].map(function (k) {
      return '<li class="' + (g[k] ? "is-done" : "") + '"><span class="tick" aria-hidden="true"></span><span>' + t(k) + "</span></li>";
    }).join("");
  }

  /* ───────── sign in ───────── */

  var login = $("#login"), app = $("#app");
  function signedIn() { try { return sessionStorage.getItem(AUTH) === "1"; } catch (e) { return false; } }
  function showApp(on) { login.hidden = on; app.hidden = !on; if (on) paintAll(); }

  $("#login-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var f = e.target.elements;
    if (f.user.value.trim() === "demo" && f.pass.value === "demo") {
      try { sessionStorage.setItem(AUTH, "1"); } catch (err) { /* ignore */ }
      $(".form-status", e.target).textContent = "";
      showApp(true);
    } else {
      $(".form-status", e.target).textContent = t("loginFail");
    }
  });
  $("#logout").addEventListener("click", function () {
    try { sessionStorage.removeItem(AUTH); } catch (e) { /* ignore */ }
    showApp(false);
  });
  $("#reset").addEventListener("click", function () {
    if (!confirm(t("resetAsk"))) return;
    S.reset();
    try { localStorage.removeItem(GUIDE); } catch (e) { /* ignore */ }
    known = ids(S.load());
    paintAll();
    toast(t("resetDone"));
  });

  /* ───────── views ───────── */

  var VIEWS = ["today", "requests", "bookings", "services", "team", "hours", "site"];
  var view = VIEWS.indexOf(location.hash.slice(1)) !== -1 ? location.hash.slice(1) : "today";

  function show(name) {
    view = name;
    $$("[data-panel]").forEach(function (p) { p.hidden = p.getAttribute("data-panel") !== name; });
    $$("[data-view]").forEach(function (b) { b.setAttribute("aria-current", b.getAttribute("data-view") === name ? "page" : "false"); });
    history.replaceState(null, "", "#" + name);
    paintView();
    $("#main").scrollTop = 0;
  }
  $$("[data-view]").forEach(function (b) { b.addEventListener("click", function () { show(b.getAttribute("data-view")); }); });

  /* ───────── Today ───────── */

  var dayOffset = 0;
  $$("[data-day-step]").forEach(function (b) {
    b.addEventListener("click", function () { dayOffset += +b.getAttribute("data-day-step"); paintToday(S.load()); });
  });
  $("[data-day-today]").addEventListener("click", function () { dayOffset = 0; paintToday(S.load()); });

  function paintToday(data) {
    var today = S.isoDay(0);
    var d = new Date();
    $("[data-today-date]").textContent = t("D" + d.getDay()) + " " + d.getDate() + " " + t("months").split(",")[d.getMonth()];

    var todays = data.bookings.filter(function (b) { return b.date === today && b.status !== "cancelled"; });
    var pending = data.bookings.filter(function (b) { return b.status === "pending"; }).length;
    var revenue = todays.reduce(function (sum, b) { var s = S.service(data, b.service); return sum + (s ? s.price : 0); }, 0);
    var free = S.availability(data, today, "cut", "any").length;
    $("[data-kpis]").innerHTML =
      kpi(t("kToday"), todays.length) +
      kpi(t("kPending"), pending, pending ? "warn" : "", "requests") +
      kpi(t("kRevenue"), revenue + " €") +
      kpi(t("kFree"), free, "", "", t("kFreeNote"));

    // timeline for the chosen day
    var iso = S.isoDay(dayOffset);
    var dd = new Date(iso + "T12:00:00");
    $("[data-day-label]").textContent = t("d" + dd.getDay()) + " " + dd.getDate() + " " + t("months").split(",")[dd.getMonth()];
    var box = $("[data-timeline]");
    var hours = data.hours[S.weekday(iso)];
    if (!hours) { box.innerHTML = '<p class="empty">' + esc(t("closedDay")) + "</p>"; return; }
    var open = S.toMin(hours.open), close = S.toMin(hours.close), span = close - open;
    var people = data.staff.filter(function (m) { return m.days.indexOf(S.weekday(iso)) !== -1; });
    var rows = "";
    for (var h = Math.ceil(open / 60) * 60; h < close; h += 60) {
      rows += '<span class="tl-hour" style="top:' + ((h - open) / span * 100) + '%">' + S.toHHMM(h) + "</span>";
    }
    var dayBookings = data.bookings.filter(function (b) { return b.date === iso && b.status !== "cancelled"; });
    var cols = people.map(function (m) {
      var blocks = dayBookings.filter(function (b) { return b.staff === m.id; }).map(function (b) {
        var s = S.service(data, b.service), dur = s ? s.duration : 30;
        var top = (S.toMin(b.time) - open) / span * 100, h = dur / span * 100;
        return '<button type="button" class="tl-block st-' + b.status + '" data-open-ref="' + esc(b.id) + '" style="top:' + top + "%;height:" + h + '%">' +
          "<b>" + esc(b.time) + " " + esc(b.client) + "</b><span>" + esc(svcName(data, b.service)) + "</span></button>";
      }).join("");
      return '<div class="tl-col" style="--accent:' + esc(m.color) + '"><p class="tl-name">' + esc(m.name.split(" ")[0]) + '</p><div class="tl-track">' + blocks + "</div></div>";
    }).join("");
    // the hour axis gets the same header row as the stylist columns, so times line up with blocks
    box.innerHTML = '<div class="tl" style="--rows:' + Math.max(1, span / 60) + '"><div class="tl-col"><p class="tl-name blank" aria-hidden="true">&nbsp;</p><div class="tl-axis">' + rows + "</div></div>" + cols + "</div>" +
      (dayBookings.length ? "" : '<p class="empty small">' + esc(t("noBookingsDay")) + "</p>");
  }

  function kpi(label, value, tone, link, note) {
    return '<div class="kpi' + (tone ? " " + tone : "") + '"' + (link ? ' role="button" tabindex="0" data-goto="' + link + '"' : "") + ">" +
      '<span class="kpi-label">' + esc(label) + '</span><span class="kpi-value">' + esc(value) + "</span>" +
      (note ? '<span class="kpi-note">' + esc(note) + "</span>" : "") + "</div>";
  }

  document.addEventListener("click", function (e) {
    var go = e.target.closest("[data-goto]");
    if (go) { show(go.getAttribute("data-goto")); return; }
    var ref = e.target.closest("[data-open-ref]");
    if (ref) { filters.search = ref.getAttribute("data-open-ref"); filters.when = "all"; filters.status = ""; show("bookings"); }
  });

  /* ───────── Requests ───────── */

  function paintRequests(data) {
    var list = data.bookings.filter(function (b) { return b.status === "pending"; })
      .sort(function (a, b) { return (a.date + a.time).localeCompare(b.date + b.time); });
    var badge = $("[data-badge]");
    badge.hidden = !list.length;
    badge.textContent = list.length;
    if (view !== "requests") return;
    var box = $("[data-requests]");
    if (!list.length) { box.innerHTML = '<div class="card empty-card"><p>' + esc(t("noRequests")) + "</p></div>"; return; }
    box.innerHTML = list.map(function (b) {
      var s = S.service(data, b.service);
      var m = S.member(data, b.staff);
      return '<article class="card request" style="--accent:' + esc(m ? m.color : "#999") + '">' +
        '<div class="req-when"><span class="req-day">' + esc(dayLabel(b.date)) + '</span><span class="req-time">' + esc(b.time) + "</span></div>" +
        '<div class="req-body"><h3>' + esc(b.client) + ' <span class="ref">' + esc(b.id) + "</span></h3>" +
        "<p>" + esc(svcName(data, b.service)) + (s ? " · " + s.duration + " min · " + s.price + " €" : "") + " · " + esc(staffName(data, b.staff)) + "</p>" +
        '<p class="muted small">' + esc(b.phone || "") + " · " + esc(t(b.source === "site" ? "fromSite" : "fromDesk")) + "</p>" +
        (b.note ? '<p class="req-note">“' + esc(b.note) + "”</p>" : "") + "</div>" +
        '<div class="req-actions"><button class="btn btn-ok" type="button" data-act="confirmed" data-id="' + esc(b.id) + '">' + esc(t("accept")) + "</button>" +
        '<button class="btn btn-ghost" type="button" data-act="cancelled" data-id="' + esc(b.id) + '">' + esc(t("decline")) + "</button></div></article>";
    }).join("");
  }

  function setStatus(id, status) {
    var booking;
    S.update(function (d) {
      booking = d.bookings.filter(function (b) { return b.id === id; })[0];
      if (booking) booking.status = status;
    });
    if (!booking) return;
    if (status === "confirmed") toast(t("accepted", { client: booking.client, when: when(booking) }), "ok");
    if (status === "cancelled") toast(t("declined", { client: booking.client }));
    tick("g2");
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-act]");
    if (b) setStatus(b.getAttribute("data-id"), b.getAttribute("data-act"));
  });

  /* ───────── Bookings ───────── */

  var filters = { when: "upcoming", status: "", search: "" };
  $$("[data-when]").forEach(function (b) {
    b.addEventListener("click", function () { filters.when = b.getAttribute("data-when"); paintBookings(S.load()); });
  });
  $("[data-status-filter]").addEventListener("change", function (e) { filters.status = e.target.value; paintBookings(S.load()); });
  $("[data-search]").addEventListener("input", function (e) { filters.search = e.target.value; paintBookings(S.load()); });

  function paintBookings(data) {
    if (view !== "bookings") return;
    $$("[data-when]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-when") === filters.when)); });
    $("[data-status-filter]").value = filters.status;
    if ($("[data-search]").value !== filters.search) $("[data-search]").value = filters.search;
    var today = S.isoDay(0), q = filters.search.trim().toLowerCase();
    var list = data.bookings.filter(function (b) {
      if (filters.when === "upcoming" && b.date < today) return false;
      if (filters.when === "past" && b.date >= today) return false;
      if (filters.status && b.status !== filters.status) return false;
      if (q && (b.client + " " + b.id + " " + (b.phone || "")).toLowerCase().indexOf(q) === -1) return false;
      return true;
    }).sort(function (a, b) {
      var k = (a.date + a.time).localeCompare(b.date + b.time);
      return filters.when === "past" ? -k : k;
    });
    var box = $("[data-bookings]");
    if (!list.length) { box.innerHTML = '<p class="empty">' + esc(t("noMatches")) + "</p>"; return; }
    box.innerHTML = '<table class="table"><thead><tr><th>' + [t("when"), t("client"), t("service"), t("stylist"), t("status"), t("actions")].map(esc).join("</th><th>") + "</th></tr></thead><tbody>" +
      list.map(function (b) {
        var acts = [];
        if (b.status === "pending") acts.push(btnAct("confirmed", b.id, t("confirm")));
        if (b.status === "confirmed") acts.push(btnAct("done", b.id, t("markDone")));
        if (b.status === "pending" || b.status === "confirmed") acts.push(btnAct("cancelled", b.id, t("cancelBooking"), "ghost"));
        return "<tr><td><b>" + esc(dayLabel(b.date)) + "</b> " + esc(b.time) + '</td><td>' + esc(b.client) + '<span class="sub">' + esc(b.id) + (b.phone ? " · " + esc(b.phone) : "") + "</span></td><td>" +
          esc(svcName(data, b.service)) + "</td><td>" + esc(staffName(data, b.staff)) + '</td><td><span class="pill st-' + b.status + '">' + esc(t("st." + b.status)) + '</span></td><td class="row-acts">' + acts.join("") + "</td></tr>";
      }).join("") + "</tbody></table>";
  }
  function btnAct(status, id, label, kind) {
    return '<button class="btn btn-mini' + (kind ? " btn-" + kind : "") + '" type="button" data-act="' + status + '" data-id="' + esc(id) + '">' + esc(label) + "</button>";
  }

  /* ───────── Services ───────── */

  function paintServices(data) {
    if (view !== "services") return;
    var cats = ["cut", "colour", "care"];
    $("[data-services]").innerHTML = '<table class="table edit"><thead><tr><th>' +
      [t("nameEn"), t("namePt"), t("category"), t("price"), t("duration"), t("visible"), ""].map(esc).join("</th><th>") + "</th></tr></thead><tbody>" +
      data.services.map(function (s) {
        return '<tr data-svc="' + esc(s.id) + '">' +
          '<td><input data-f="name.en" value="' + esc(s.name.en) + '" aria-label="' + esc(t("nameEn")) + '"></td>' +
          '<td><input data-f="name.pt" value="' + esc(s.name.pt) + '" aria-label="' + esc(t("namePt")) + '"></td>' +
          '<td><select data-f="cat" aria-label="' + esc(t("category")) + '">' + cats.map(function (c) {
            return '<option value="' + c + '"' + (s.cat === c ? " selected" : "") + ">" + esc(t("cat." + c)) + "</option>";
          }).join("") + "</select></td>" +
          '<td><input data-f="price" type="number" min="0" step="1" value="' + s.price + '" class="num" aria-label="' + esc(t("price")) + '"></td>' +
          '<td><input data-f="duration" type="number" min="15" step="15" value="' + s.duration + '" class="num" aria-label="' + esc(t("duration")) + '"></td>' +
          '<td><label class="switch"><input type="checkbox" data-f="visible"' + (s.visible ? " checked" : "") + '><span aria-hidden="true"></span><span class="sr-only">' + esc(t("visible")) + "</span></label></td>" +
          '<td><button class="icon-btn danger" type="button" data-del-svc="' + esc(s.id) + '" aria-label="' + esc(t("remove")) + '">✕</button></td></tr>';
      }).join("") + "</tbody></table>";
  }

  function setPath(obj, path, value) {
    var parts = path.split(".");
    var last = parts.pop();
    parts.forEach(function (p) { obj = obj[p]; });
    obj[last] = value;
  }

  var saveTimer = 0;
  $("[data-services]").addEventListener("input", function (e) {
    var row = e.target.closest("[data-svc]"), f = e.target.getAttribute("data-f");
    if (!row || !f) return;
    var id = row.getAttribute("data-svc");
    var value = e.target.type === "checkbox" ? e.target.checked : e.target.type === "number" ? Math.max(0, +e.target.value || 0) : e.target.value;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      editing = true;
      S.update(function (d) { var s = S.service(d, id); if (s) setPath(s, f, value); });
      editing = false;
      if (f === "price" || f === "visible") tick("g3");
    }, e.target.type === "checkbox" || e.target.tagName === "SELECT" ? 0 : 350);
  });
  $("[data-services]").addEventListener("change", function (e) {
    if (e.target.type === "checkbox" || e.target.tagName === "SELECT") e.target.dispatchEvent(new Event("input", { bubbles: true }));
  });
  $("[data-add-service]").addEventListener("click", function () {
    S.update(function (d) {
      d.services.push({ id: "svc-" + Date.now().toString(36), cat: "cut", name: { en: t("newService"), pt: "Novo serviço" }, price: 30, duration: 30, visible: false });
    });
    paintServices(S.load());
    var inputs = $$("[data-services] tbody tr:last-child input");
    if (inputs[0]) { inputs[0].focus(); inputs[0].select(); }
  });
  $("[data-services]").addEventListener("click", function (e) {
    var del = e.target.closest("[data-del-svc]");
    if (!del) return;
    var data = S.load(), s = S.service(data, del.getAttribute("data-del-svc"));
    if (!s || !confirm(t("removeServiceAsk", { name: txt(s.name) }))) return;
    S.update(function (d) {
      d.services = d.services.filter(function (x) { return x.id !== s.id; });
      d.staff.forEach(function (m) { m.services = m.services.filter(function (x) { return x !== s.id; }); });
    });
  });

  /* ───────── Team ───────── */

  function paintTeam(data) {
    if (view !== "team") return;
    $("[data-team]").innerHTML = data.staff.map(function (m) {
      var days = [1, 2, 3, 4, 5, 6, 0].map(function (d) {
        return '<label class="day-chip"><input type="checkbox" data-day="' + d + '"' + (m.days.indexOf(d) !== -1 ? " checked" : "") + "><span>" + esc(t("d" + d)) + "</span></label>";
      }).join("");
      var svcs = data.services.map(function (s) {
        return '<label class="svc-chip"><input type="checkbox" data-does="' + esc(s.id) + '"' + (m.services.indexOf(s.id) !== -1 ? " checked" : "") + "><span>" + esc(txt(s.name)) + "</span></label>";
      }).join("");
      return '<article class="card person-edit" data-staff="' + esc(m.id) + '" style="--accent:' + esc(m.color) + '">' +
        '<div class="pe-head"><span class="avatar">' + esc(m.name.split(" ").map(function (w) { return w[0]; }).join("").slice(0, 2)) + "</span>" +
        '<input class="pe-name" data-f="name" value="' + esc(m.name) + '" aria-label="' + esc(t("name")) + '">' +
        '<label class="colour"><span class="sr-only">' + esc(t("colour")) + '</span><input type="color" data-f="color" value="' + esc(m.color) + '"></label>' +
        '<button class="icon-btn danger" type="button" data-del-staff="' + esc(m.id) + '" aria-label="' + esc(t("remove")) + '">✕</button></div>' +
        '<div class="pe-roles"><label><span>' + esc(t("roleEn")) + '</span><input data-f="role.en" value="' + esc(m.role.en) + '"></label>' +
        '<label><span>' + esc(t("rolePt")) + '</span><input data-f="role.pt" value="' + esc(m.role.pt) + '"></label></div>' +
        '<p class="pe-label">' + esc(t("worksOn")) + '</p><div class="chips">' + days + "</div>" +
        '<p class="pe-label">' + esc(t("does")) + '</p><div class="chips">' + svcs + "</div></article>";
    }).join("");
  }

  $("[data-team]").addEventListener("input", function (e) {
    var card = e.target.closest("[data-staff]");
    if (!card) return;
    var id = card.getAttribute("data-staff");
    var el = e.target;
    var apply = function (d) {
      var m = S.member(d, id);
      if (!m) return;
      if (el.hasAttribute("data-day")) {
        var day = +el.getAttribute("data-day");
        m.days = el.checked ? m.days.concat(day) : m.days.filter(function (x) { return x !== day; });
      } else if (el.hasAttribute("data-does")) {
        var sid = el.getAttribute("data-does");
        m.services = el.checked ? m.services.concat(sid) : m.services.filter(function (x) { return x !== sid; });
      } else if (el.getAttribute("data-f")) {
        setPath(m, el.getAttribute("data-f"), el.value);
      }
    };
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      editing = true;
      S.update(apply);
      editing = false;
      if (el.type === "checkbox" || el.type === "color") paintTeam(S.load());
    }, el.type === "checkbox" || el.type === "color" ? 0 : 350);
  });
  $("[data-add-staff]").addEventListener("click", function () {
    S.update(function (d) {
      d.staff.push({ id: "st-" + Date.now().toString(36), name: t("newStylist"), role: { en: "Stylist", pt: "Cabeleireiro/a" }, days: [2, 3, 4, 5, 6], services: ["cut", "blow"], color: "#6f7f8f" });
    });
    paintTeam(S.load());
    var cards = $$("[data-staff]");
    var name = cards.length && $(".pe-name", cards[cards.length - 1]);
    if (name) { name.focus(); name.select(); }
  });
  $("[data-team]").addEventListener("click", function (e) {
    var del = e.target.closest("[data-del-staff]");
    if (!del) return;
    var m = S.member(S.load(), del.getAttribute("data-del-staff"));
    if (!m || !confirm(t("removeStaffAsk", { name: m.name }))) return;
    S.update(function (d) { d.staff = d.staff.filter(function (x) { return x.id !== m.id; }); });
  });

  /* ───────── Hours ───────── */

  function paintHours(data) {
    if (view !== "hours") return;
    $("[data-hours]").innerHTML = [1, 2, 3, 4, 5, 6, 0].map(function (d) {
      var h = data.hours[d];
      return '<div class="hours-row' + (h ? "" : " is-closed") + '" data-weekday="' + d + '">' +
        '<span class="hr-day">' + esc(t("D" + d)) + "</span>" +
        '<label class="switch"><input type="checkbox" data-open' + (h ? " checked" : "") + '><span aria-hidden="true"></span><span class="hr-state">' + esc(t(h ? "open" : "closed")) + "</span></label>" +
        '<span class="hr-times">' + esc(t("from")) + ' <input type="time" step="900" data-t="open" value="' + (h ? h.open : "10:00") + '"' + (h ? "" : " disabled") + "> " +
        esc(t("to")) + ' <input type="time" step="900" data-t="close" value="' + (h ? h.close : "19:00") + '"' + (h ? "" : " disabled") + "></span></div>";
    }).join("");
  }
  $("[data-hours]").addEventListener("change", function (e) {
    var row = e.target.closest("[data-weekday]");
    if (!row) return;
    var d = +row.getAttribute("data-weekday");
    var openEl = $("[data-open]", row), o = $('[data-t="open"]', row).value, c = $('[data-t="close"]', row).value;
    if (o && c && o >= c) c = S.toHHMM(Math.min(23 * 60 + 45, S.toMin(o) + 60));
    S.update(function (data) { data.hours[d] = openEl.checked ? { open: o, close: c } : null; });
    if (!openEl.checked) tick("g5");
    paintHours(S.load());
  });

  /* ───────── Site copy ───────── */

  function paintSite(data) {
    if (view !== "site") return;
    var form = $("[data-site-form]");
    if (form.contains(document.activeElement)) return;   // don't repaint under the cursor
    var pair = function (key, label, area) {
      var tag = area ? "textarea" : "input";
      var v = data.site[key];
      return '<fieldset class="pair"><legend>' + esc(t(label)) + "</legend>" +
        "<label><span>" + esc(t("english")) + "</span><" + tag + ' data-copy="' + key + '.en"' + (area ? ' rows="3">' + esc(v.en) + "</textarea>" : ' value="' + esc(v.en) + '">') + "</label>" +
        "<label><span>" + esc(t("portuguese")) + "</span><" + tag + ' data-copy="' + key + '.pt"' + (area ? ' rows="3">' + esc(v.pt) + "</textarea>" : ' value="' + esc(v.pt) + '">') + "</label></fieldset>";
    };
    form.innerHTML = pair("announcement", "announcement") + pair("hero", "hero") + pair("intro", "intro", true) +
      '<fieldset class="pair"><legend>' + esc(t("address")) + "</legend>" +
      "<label><span>" + esc(t("address")) + '</span><input data-copy="address" value="' + esc(data.site.address) + '"></label>' +
      "<label><span>" + esc(t("phone")) + '</span><input data-copy="phone" value="' + esc(data.site.phone) + '"></label></fieldset>' +
      '<p class="saved" data-saved role="status"></p>';
  }
  $("[data-site-form]").addEventListener("input", function (e) {
    var path = e.target.getAttribute("data-copy");
    if (!path) return;
    var value = e.target.value;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      S.update(function (d) { setPath(d.site, path, value); });
      var s = $("[data-saved]");
      if (s) s.textContent = t("saved");
      if (path.indexOf("announcement") === 0) tick("g4");
    }, 400);
  });

  /* ───────── new booking dialog ───────── */

  var dlg = $("#booking-dialog");
  var dform = $("[data-booking-form]");

  function fillDialog() {
    var data = S.load();
    var svcSel = $("[data-dlg-service]"), staffSel = $("[data-dlg-staff]"), dateIn = $("[data-dlg-date]"), timeSel = $("[data-dlg-time]");
    if (!svcSel.options.length) {
      svcSel.innerHTML = data.services.map(function (s) { return '<option value="' + esc(s.id) + '">' + esc(txt(s.name)) + " · " + s.duration + " min</option>"; }).join("");
    }
    if (!dateIn.value) dateIn.value = S.isoDay(dayOffset > 0 ? dayOffset : 0);
    dateIn.min = S.isoDay(0);
    var people = S.stylistsFor(data, svcSel.value, dateIn.value);
    var prev = staffSel.value;
    staffSel.innerHTML = '<option value="any">—</option>' + people.map(function (m) { return '<option value="' + esc(m.id) + '">' + esc(m.name) + "</option>"; }).join("");
    if (people.some(function (m) { return m.id === prev; })) staffSel.value = prev;
    var slots = S.availability(data, dateIn.value, svcSel.value, staffSel.value);
    timeSel.innerHTML = slots.length
      ? slots.map(function (s) { return '<option value="' + s.time + '" data-staff="' + s.staff[0] + '">' + s.time + "</option>"; }).join("")
      : '<option value="">' + esc(t("noFreeTimes")) + "</option>";
  }

  $$("[data-new-booking]").forEach(function (b) {
    b.addEventListener("click", function () {
      dform.reset();
      $("[data-dlg-service]").innerHTML = "";
      $("[data-dlg-date]").value = "";
      $("[data-dlg-status]").textContent = "";
      fillDialog();
      dlg.showModal();
      dform.elements.client.focus();
    });
  });
  dform.addEventListener("change", function (e) { if (e.target.name !== "time" && e.target.name !== "client") fillDialog(); });
  $("[data-dlg-cancel]").addEventListener("click", function () { dlg.close(); });
  dform.addEventListener("submit", function (e) {
    e.preventDefault();
    var f = dform.elements, status = $("[data-dlg-status]");
    if (!f.client.value.trim()) { status.textContent = t("errClient"); f.client.focus(); return; }
    var opt = f.time.selectedOptions[0];
    if (!f.time.value || !opt) { status.textContent = t("errTime"); return; }
    var booking = {
      id: S.uid("AU"),
      client: f.client.value.trim(),
      phone: f.phone.value.trim(),
      email: "",
      service: f.service.value,
      staff: f.staff.value === "any" ? opt.getAttribute("data-staff") : f.staff.value,
      date: f.date.value,
      time: f.time.value,
      status: "confirmed",
      source: "desk",
      note: f.note.value.trim(),
      created: new Date().toISOString()
    };
    S.update(function (d) { d.bookings.push(booking); });
    dlg.close();
    toast(t("bookingSaved", { client: booking.client, when: when(booking) }), "ok");
  });

  /* ───────── painting + live updates ───────── */

  var editing = false;
  function paintView() {
    var data = S.load();
    paintRequests(data);
    if (view === "today") { paintToday(data); paintGuide(); }
    paintBookings(data);
    paintServices(data);
    paintTeam(data);
    paintHours(data);
    paintSite(data);
  }
  function paintAll() { show(view); }

  function ids(data) { var o = {}; data.bookings.forEach(function (b) { o[b.id] = true; }); return o; }
  var known = ids(S.load());

  S.onChange(function (data) {
    // something new from the website (another tab): announce it
    data.bookings.forEach(function (b) {
      if (!known[b.id] && b.source === "site") {
        toast(t("newRequest", { client: b.client, service: svcName(data, b.service) }), "new");
        tick("g1");
      }
    });
    known = ids(data);
    if (app.hidden || editing) return;
    // keep inputs the user is typing in untouched
    if (document.activeElement && document.activeElement.closest("[data-services], [data-team], [data-site-form]")) { paintRequests(data); if (view === "today") paintToday(data); return; }
    paintView();
  });

  document.addEventListener("langchange", function () { if (!app.hidden) paintView(); });

  showApp(signedIn());
})();
