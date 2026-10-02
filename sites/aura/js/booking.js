/**
 * Aura — booking flow: service → stylist → day → time → details.
 * Times come from AuraStore.availability, so they respect opening hours,
 * stylists' days and existing bookings. A request is saved as "pending";
 * Aura Desk accepts or declines it, and the status here updates live.
 */
(function () {
  var S = window.AuraStore, A = window.Aura;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var form = $("#book-form");
  if (!form) return;

  var params = new URLSearchParams(location.search);
  var state = {
    service: params.get("service"),
    staff: params.get("staff"),
    date: params.get("date"),
    time: params.get("time"),
    slotStaff: null
  };
  var DAYS_AHEAD = 21;
  var lastRef = null;

  function step(name) { return $('[data-step="' + name + '"]'); }
  function enable(name, on) {
    var el = step(name);
    el.disabled = !on;
    el.classList.toggle("is-locked", !on);
  }

  /* ───────── steps ───────── */

  function renderServices(data) {
    $("[data-choose-service]").innerHTML = data.services.filter(function (s) { return s.visible; }).map(function (s) {
      var on = s.id === state.service;
      return '<label class="choice' + (on ? " is-on" : "") + '"><input type="radio" name="service" value="' + A.esc(s.id) + '"' + (on ? " checked" : "") + ">" +
        '<span class="c-name">' + A.esc(A.txt(s.name)) + "</span>" +
        '<span class="c-meta">' + s.duration + " " + A.esc(A.t("min")) + " · " + s.price + " €</span></label>";
    }).join("");
  }

  function renderStaff(data) {
    var box = $("[data-choose-staff]");
    if (!state.service) { box.innerHTML = ""; return; }
    var people = S.stylistsFor(data, state.service);
    if (state.staff && state.staff !== "any" && !people.some(function (p) { return p.id === state.staff; })) state.staff = null;
    var opts = [{ id: "any", name: A.t("anyone"), sub: A.t("anyoneSub") }].concat(people.map(function (p) {
      return { id: p.id, name: p.name, sub: A.txt(p.role), color: p.color };
    }));
    box.innerHTML = opts.map(function (o) {
      var on = (state.staff || "any") === o.id;
      return '<label class="choice person-choice' + (on ? " is-on" : "") + '"' + (o.color ? ' style="--accent:' + A.esc(o.color) + '"' : "") + '>' +
        '<input type="radio" name="staff" value="' + A.esc(o.id) + '"' + (on ? " checked" : "") + ">" +
        '<span class="avatar" aria-hidden="true">' + (o.id === "any" ? "✶" : A.esc(o.name.split(" ").map(function (w) { return w[0]; }).join(""))) + "</span>" +
        '<span><span class="c-name">' + A.esc(o.name) + '</span><span class="c-meta">' + A.esc(o.sub) + "</span></span></label>";
    }).join("");
  }

  function renderDays(data) {
    var box = $("[data-choose-date]");
    if (!state.service) { box.innerHTML = ""; return; }
    var html = "";
    var firstFree = null;
    for (var i = 0; i < DAYS_AHEAD; i++) {
      var iso = S.isoDay(i);
      var free = S.availability(data, iso, state.service, state.staff || "any").length;
      if (free && !firstFree) firstFree = iso;
      var d = new Date(iso + "T12:00:00");
      var on = iso === state.date;
      html += '<label class="day' + (on ? " is-on" : "") + (free ? "" : " is-full") + '">' +
        '<input type="radio" name="date" value="' + iso + '"' + (on ? " checked" : "") + (free ? "" : " disabled") + ">" +
        '<span class="dw">' + A.esc(i === 0 ? A.t("today") : A.t("d" + d.getDay())) + "</span>" +
        '<span class="dn">' + d.getDate() + "</span>" +
        '<span class="dm">' + (free ? A.esc(A.t("months").split(",")[d.getMonth()]) : A.esc(A.t("noSlots"))) + "</span></label>";
    }
    box.innerHTML = html;
    // a pre-chosen day that is no longer bookable falls back to nothing chosen
    if (state.date && !S.availability(data, state.date, state.service, state.staff || "any").length) { state.date = null; state.time = null; }
  }

  function renderTimes(data) {
    var box = $("[data-choose-time]");
    if (!state.service || !state.date) { box.innerHTML = ""; return; }
    var slots = S.availability(data, state.date, state.service, state.staff || "any");
    if (state.time && !slots.some(function (s) { return s.time === state.time; })) state.time = null;
    if (!slots.length) { box.innerHTML = '<p class="muted">' + A.esc(A.t("noTimes")) + "</p>"; return; }
    var groups = { morning: [], afternoon: [], evening: [] };
    slots.forEach(function (s) {
      var m = S.toMin(s.time);
      (m < 12 * 60 ? groups.morning : m < 17 * 60 ? groups.afternoon : groups.evening).push(s);
    });
    box.innerHTML = Object.keys(groups).filter(function (g) { return groups[g].length; }).map(function (g) {
      return '<div class="time-group"><h3>' + A.esc(A.t(g)) + '</h3><div class="times">' + groups[g].map(function (s) {
        var on = s.time === state.time;
        return '<label class="time' + (on ? " is-on" : "") + '"><input type="radio" name="time" value="' + s.time + '"' + (on ? " checked" : "") + ">" + s.time + "</label>";
      }).join("") + "</div></div>";
    }).join("");
  }

  function renderSummary(data) {
    var svc = state.service && S.service(data, state.service);
    var dl = $("[data-summary]");
    if (!svc) {
      dl.innerHTML = '<p class="muted">' + A.esc(A.t("sumEmpty")) + "</p>";
      $("[data-total]").textContent = "";
      return;
    }
    var who = state.staff && state.staff !== "any" ? S.member(data, state.staff).name : A.t("anyone");
    var when = state.date ? A.dayLabel(state.date, true) + (state.time ? ", " + state.time : "") : "—";
    dl.innerHTML =
      "<div><dt>" + A.esc(A.t("sumService")) + "</dt><dd>" + A.esc(A.txt(svc.name)) + "</dd></div>" +
      "<div><dt>" + A.esc(A.t("sumStaff")) + "</dt><dd>" + A.esc(who) + "</dd></div>" +
      "<div><dt>" + A.esc(A.t("sumWhen")) + "</dt><dd>" + A.esc(when) + "</dd></div>";
    $("[data-total]").textContent = A.t("total", { price: svc.price, min: svc.duration });
  }

  function render() {
    var data = S.load();
    renderServices(data);
    renderStaff(data);
    renderDays(data);
    renderTimes(data);
    renderSummary(data);
    enable("staff", !!state.service);
    enable("date", !!state.service);
    enable("time", !!(state.service && state.date));
    enable("details", !!(state.service && state.date && state.time));
  }

  form.addEventListener("change", function (e) {
    var name = e.target.name;
    if (name === "service") { state.service = e.target.value; state.date = null; state.time = null; }
    else if (name === "staff") { state.staff = e.target.value; state.time = null; }
    else if (name === "date") { state.date = e.target.value; state.time = null; }
    else if (name === "time") { state.time = e.target.value; }
    else return;
    render();
    // bring the next step into view on small screens
    var next = { service: "staff", staff: "date", date: "time", time: "details" }[name];
    if (next && innerWidth < 900) step(next).scrollIntoView({ behavior: "smooth", block: "start" });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var err = $("[data-form-error]");
    var f = form.elements;
    if (!f.client.value.trim()) { err.textContent = A.t("errName"); f.client.focus(); return; }
    if (f.phone.value.replace(/\D/g, "").length < 9) { err.textContent = A.t("errPhone"); f.phone.focus(); return; }
    var data = S.load();
    var slot = S.availability(data, state.date, state.service, state.staff || "any").filter(function (s) { return s.time === state.time; })[0];
    if (!slot) { err.textContent = A.t("slotGone"); state.time = null; render(); return; }
    err.textContent = "";
    var ref = S.uid("AU");
    S.update(function (d) {
      d.bookings.push({
        id: ref,
        client: f.client.value.trim(),
        phone: f.phone.value.trim(),
        email: f.email.value.trim(),
        service: state.service,
        staff: state.staff && state.staff !== "any" ? state.staff : slot.staff[0],
        date: state.date,
        time: state.time,
        status: "pending",
        source: "site",
        note: f.note.value.trim(),
        created: new Date().toISOString()
      });
    });
    try { localStorage.setItem("aura-last-ref", ref); } catch (error) { /* ignore */ }
    lastRef = ref;
    form.hidden = true;
    var done = $("[data-done]");
    done.hidden = false;
    $("[data-done-ref]").textContent = ref;
    paintStatus();
    done.focus();
    done.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  /* ───────── status: on the thank-you screen and in the lookup ───────── */

  function describe(b, data) {
    var svc = S.service(data, b.service);
    return A.t("lookupFound", {
      service: svc ? A.txt(svc.name) : b.service,
      when: A.dayLabel(b.date, true) + ", " + b.time,
      status: A.t("st." + b.status)
    });
  }

  function paintStatus() {
    if (!lastRef) return;
    var b = S.load().bookings.filter(function (x) { return x.id === lastRef; })[0];
    var pill = $("[data-done-status]");
    if (!b || !pill) return;
    pill.textContent = A.t("st." + b.status);
    pill.className = "pill st-" + b.status;
  }

  var lookupRef = null;
  function paintLookup() {
    if (!lookupRef) return;
    var data = S.load();
    var b = data.bookings.filter(function (x) { return x.id === lookupRef; })[0];
    var out = $("[data-lookup-result]");
    out.innerHTML = b ? '<span class="pill st-' + b.status + '">' + A.esc(A.t("st." + b.status)) + "</span> " + A.esc(describe(b, data)) : A.esc(A.t("lookupNone"));
  }

  $("[data-lookup]").addEventListener("submit", function (e) {
    e.preventDefault();
    lookupRef = e.target.elements.ref.value.trim().toUpperCase();
    paintLookup();
  });
  try {
    var saved = localStorage.getItem("aura-last-ref");
    if (saved) $("[data-lookup]").elements.ref.value = saved;
  } catch (error) { /* ignore */ }

  render();
  document.addEventListener("langchange", function () { render(); paintStatus(); paintLookup(); });
  // the desk accepted, declined or booked something: refresh times and statuses
  S.onChange(function () { render(); paintStatus(); paintLookup(); });
})();
