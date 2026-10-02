/**
 * Aura — shared page script: header, announcement, and the home page.
 * Every visitor-facing value comes from AuraStore, so edits made in Aura Desk
 * show up here, live, even in another tab.
 */
(function () {
  var S = window.AuraStore;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  function t(key, vars) {
    var out = I18N.t(window.SITE_I18N, key);
    if (vars) Object.keys(vars).forEach(function (k) { out = out.split("{" + k + "}").join(vars[k]); });
    return out;
  }
  function lang() { return I18N.lang; }
  function txt(value) { return S.text(value, lang()); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /** "Today", "Tomorrow" or "Thu 9 Oct". */
  function dayLabel(iso, long) {
    if (iso === S.isoDay(0)) return t("today");
    if (iso === S.isoDay(1)) return t("tomorrow");
    var d = new Date(iso + "T12:00:00");
    var months = t("months").split(",");
    return t((long ? "D" : "d") + d.getDay()) + " " + d.getDate() + " " + months[d.getMonth()];
  }

  // shared with booking.js
  window.Aura = { t: t, txt: txt, esc: esc, dayLabel: dayLabel, lang: lang };

  /* ───────── header ───────── */

  var toggle = $(".nav-toggle");
  var nav = $("#nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) { toggle.setAttribute("aria-expanded", "false"); nav.classList.remove("is-open"); }
    });
  }
  var header = $(".site-header");
  addEventListener("scroll", function () { header.classList.toggle("is-stuck", scrollY > 40); }, { passive: true });

  /* ───────── painting ───────── */

  function paintShared(data) {
    $$("[data-announce]").forEach(function (el) { el.textContent = txt(data.site.announcement); });
  }

  function paintHome(data) {
    if (!$("[data-services]")) return;
    $("[data-hero]").textContent = txt(data.site.hero);
    $("[data-intro]").textContent = txt(data.site.intro);

    // hero images
    $$("[data-gallery-img]").forEach(function (img) {
      var g = data.gallery[+img.getAttribute("data-gallery-img")];
      if (g && img.getAttribute("src") !== g.url) img.src = g.url;
    });

    // live: the next free "Cut & finish" in the coming week
    var nextEl = $("[data-next-slot]");
    var found = null;
    for (var i = 0; i < 10 && !found; i++) {
      var iso = S.isoDay(i);
      var slots = S.availability(data, iso, "cut", "any");
      if (slots.length) found = { iso: iso, slot: slots[0] };
    }
    if (found && S.service(data, "cut") && S.service(data, "cut").visible) {
      var who = S.member(data, found.slot.staff[0]);
      $("[data-next-text]", nextEl).textContent = t("nextFreeText", { day: dayLabel(found.iso), time: found.slot.time, name: who ? who.name.split(" ")[0] : "" });
      nextEl.href = "booking.html?service=cut&date=" + found.iso + "&time=" + found.slot.time + "&staff=" + found.slot.staff[0];
      nextEl.hidden = false;
    } else nextEl.hidden = true;

    // services, grouped by category
    var cats = ["cut", "colour", "care"];
    $("[data-services]").innerHTML = cats.map(function (cat) {
      var items = data.services.filter(function (s) { return s.visible && s.cat === cat; });
      if (!items.length) return "";
      return '<div class="menu-col"><h3>' + esc(t("cat." + cat)) + "</h3><ul>" + items.map(function (s) {
        return '<li><a href="booking.html?service=' + esc(s.id) + '">' +
          '<span class="m-name">' + esc(txt(s.name)) + '<small>' + s.duration + " " + esc(t("min")) + "</small></span>" +
          '<span class="m-dots" aria-hidden="true"></span>' +
          '<span class="m-price">' + s.price + " €</span>" +
          '<span class="m-book">' + esc(t("bookThis")) + " →</span></a></li>";
      }).join("") + "</ul></div>";
    }).join("");

    // team
    $("[data-team]").innerHTML = data.staff.map(function (m) {
      var initials = m.name.split(" ").map(function (p) { return p[0]; }).join("").slice(0, 2);
      var days = [1, 2, 3, 4, 5, 6, 0].map(function (d) {
        return '<span class="' + (m.days.indexOf(d) !== -1 ? "on" : "") + '">' + esc(t("d" + d)).slice(0, 2) + "</span>";
      }).join("");
      return '<article class="person" style="--accent:' + esc(m.color) + '">' +
        '<div class="monogram" aria-hidden="true">' + esc(initials) + "</div>" +
        "<h3>" + esc(m.name) + "</h3><p class=\"role\">" + esc(txt(m.role)) + "</p>" +
        '<p class="days">' + days + "</p>" +
        '<a class="link-arrow" href="booking.html?staff=' + esc(m.id) + '">' + esc(t("bookWith", { name: m.name.split(" ")[0] })) + "</a></article>";
    }).join("");

    // gallery strip
    $("[data-gallery]").innerHTML = data.gallery.map(function (g) {
      return '<figure><img src="' + esc(g.url) + '" alt="' + esc(txt(g.alt)) + '" loading="lazy"><figcaption>' + esc(txt(g.alt)) + "</figcaption></figure>";
    }).join("");

    // visit: hours, open now, address
    var today = new Date().getDay();
    $("[data-hours]").innerHTML = [1, 2, 3, 4, 5, 6, 0].map(function (d) {
      var h = data.hours[d];
      return '<div class="' + (d === today ? "is-today" : "") + '"><dt>' + esc(t("D" + d)) + "</dt><dd>" + (h ? h.open + "–" + h.close : esc(t("closed"))) + "</dd></div>";
    }).join("");
    $("[data-address]").textContent = data.site.address;
    var phone = $("[data-phone]");
    phone.textContent = data.site.phone;
    phone.href = "tel:" + data.site.phone.replace(/\s/g, "");
    $("[data-open-now]").innerHTML = openNow(data);
  }

  function openNow(data) {
    var now = new Date(), d = now.getDay(), min = now.getHours() * 60 + now.getMinutes();
    var h = data.hours[d];
    if (h && min >= S.toMin(h.open) && min < S.toMin(h.close)) {
      return '<span class="dot on"></span>' + esc(t("openNow", { time: h.close }));
    }
    for (var i = 0; i < 8; i++) {
      var day = (d + i) % 7, hh = data.hours[day];
      if (!hh) continue;
      if (i === 0 && min >= S.toMin(hh.open)) continue;
      var label = i === 0 ? t("today").toLowerCase() : i === 1 ? t("tomorrow").toLowerCase() : t("D" + day);
      return '<span class="dot"></span>' + esc(t("closedNow", { day: label, time: hh.open }));
    }
    return "";
  }

  function paint() {
    var data = S.load();
    paintShared(data);
    paintHome(data);
  }

  paint();
  document.addEventListener("langchange", paint);
  S.onChange(paint);
})();
