/**
 * Aura demo store — shared by the salon site (../aura) and the backoffice (../aura-desk).
 * Keep this file identical in both folders.
 *
 * Everything lives in localStorage under one key, so the two sites share data
 * when served from the same origin. Text a visitor reads is stored in both
 * languages ({ en, pt }). Changes made in one tab reach the other through the
 * browser's storage event (AuraStore.onChange).
 */
(function (global) {
  var KEY = "aura-demo-store-v2";
  var DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

  function isoDay(offset) {
    var d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() + offset);
    return d.toISOString().slice(0, 10);
  }

  // the next open day at or after `offset` days from today (Tue–Sat)
  function openDay(offset) {
    for (var i = offset; i < offset + 7; i++) {
      var day = new Date(isoDay(i) + "T12:00:00").getDay();
      if (day >= 2 && day <= 6) return isoDay(i);
    }
    return isoDay(offset);
  }

  function defaults() {
    var d0 = openDay(0), d1 = openDay(1), d2 = openDay(3);
    return {
      version: 2,
      site: {
        announcement: { en: "New guests: your first cut includes a 15-minute consult.", pt: "Novos clientes: o primeiro corte inclui uma consulta de 15 minutos." },
        hero: { en: "Hair with a point of view.", pt: "Cabelo com ponto de vista." },
        intro: {
          en: "A small salon in Chiado. Three chairs, unhurried appointments and colour that grows out well.",
          pt: "Um pequeno salão no Chiado. Três cadeiras, marcações sem pressa e cor que cresce bem."
        },
        phone: "+351 21 000 0000",
        address: "Rua Garrett 00, 1200-000 Lisboa"
      },
      // weekday 0 = Sunday; null = closed
      hours: [
        null,
        null,
        { open: "10:00", close: "19:00" },
        { open: "10:00", close: "19:00" },
        { open: "10:00", close: "20:00" },
        { open: "10:00", close: "20:00" },
        { open: "09:00", close: "17:00" }
      ],
      services: [
        { id: "cut", cat: "cut", name: { en: "Cut & finish", pt: "Corte e acabamento" }, price: 38, duration: 45, visible: true },
        { id: "blow", cat: "cut", name: { en: "Blow-dry", pt: "Brushing" }, price: 28, duration: 30, visible: true },
        { id: "fringe", cat: "cut", name: { en: "Fringe trim", pt: "Acerto de franja" }, price: 12, duration: 15, visible: true },
        { id: "balayage", cat: "colour", name: { en: "Balayage", pt: "Balayage" }, price: 95, duration: 150, visible: true },
        { id: "gloss", cat: "colour", name: { en: "Gloss", pt: "Gloss" }, price: 42, duration: 45, visible: true },
        { id: "roots", cat: "colour", name: { en: "Root colour", pt: "Cor de raiz" }, price: 55, duration: 75, visible: true },
        { id: "ritual", cat: "care", name: { en: "Repair ritual", pt: "Ritual reparador" }, price: 35, duration: 30, visible: true }
      ],
      staff: [
        { id: "ana", name: "Ana Costa", role: { en: "Colour lead", pt: "Responsável de cor" }, days: [2, 3, 4, 5, 6], services: ["balayage", "gloss", "roots", "ritual", "blow"], color: "#b0715a" },
        { id: "rui", name: "Rui Mendes", role: { en: "Cutting", pt: "Corte" }, days: [3, 4, 5, 6], services: ["cut", "blow", "fringe", "ritual"], color: "#5d6b5a" },
        { id: "lea", name: "Léa Moreau", role: { en: "Texture & curls", pt: "Textura e caracóis" }, days: [2, 4, 5, 6], services: ["cut", "blow", "fringe", "gloss", "ritual"], color: "#8a6a8f" }
      ],
      bookings: [
        { id: "AU-4K2M", client: "Marta Silva", phone: "912 000 101", email: "", service: "cut", staff: "rui", date: d0, time: "11:00", status: "confirmed", source: "site", note: "" },
        { id: "AU-7P3D", client: "João Pires", phone: "912 000 102", email: "", service: "blow", staff: "lea", date: d0, time: "14:30", status: "confirmed", source: "desk", note: "" },
        { id: "AU-2H8Q", client: "Inês Lopes", phone: "912 000 103", email: "", service: "balayage", staff: "ana", date: d1, time: "10:00", status: "pending", source: "site", note: "First time with colour." },
        { id: "AU-9T5R", client: "Tomás Reis", phone: "912 000 104", email: "", service: "gloss", staff: "lea", date: d2, time: "16:00", status: "pending", source: "site", note: "" }
      ],
      gallery: [
        { url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=75", alt: { en: "The salon floor in warm light", pt: "O salão com luz quente" } },
        { url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=75", alt: { en: "Colour being painted on", pt: "Cor a ser aplicada" } },
        { url: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1200&q=75", alt: { en: "A close cut in progress", pt: "Um corte em curso" } },
        { url: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=75", alt: { en: "A finished blow-dry", pt: "Um brushing acabado" } }
      ]
    };
  }

  function clone(value) { return JSON.parse(JSON.stringify(value)); }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return defaults();
      var data = JSON.parse(raw);
      return data && data.version === 2 ? data : defaults();
    } catch (error) {
      return defaults();
    }
  }

  function save(data) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (error) { /* private mode: keeps working for this page only */ }
    emit(data);
    return data;
  }

  /** Change the data with a function and save it: AuraStore.update(function (d) { … }). */
  function update(fn) {
    var data = load();
    fn(data);
    return save(data);
  }

  function reset() {
    try { localStorage.removeItem(KEY); } catch (error) { /* ignore */ }
    var data = defaults();
    emit(data);
    return data;
  }

  var listeners = [];
  function emit(data) { listeners.forEach(function (fn) { fn(data); }); }
  function onChange(fn) { listeners.push(fn); }
  // another tab (the site or the desk) saved: tell this page
  global.addEventListener("storage", function (event) {
    if (event.key === KEY || event.key === null) emit(load());
  });

  function uid(prefix) {
    var chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789", out = "";
    for (var i = 0; i < 4; i++) out += chars[Math.floor(Math.random() * chars.length)];
    return (prefix || "AU") + "-" + out;
  }

  function toMin(hhmm) { var p = hhmm.split(":"); return +p[0] * 60 + +p[1]; }
  function toHHMM(min) { return String(Math.floor(min / 60)).padStart(2, "0") + ":" + String(min % 60).padStart(2, "0"); }
  function weekday(iso) { return new Date(iso + "T12:00:00").getDay(); }

  function service(data, id) { return data.services.find(function (s) { return s.id === id; }); }
  function member(data, id) { return data.staff.find(function (s) { return s.id === id; }); }

  /** Stylists who do this service on this date. */
  function stylistsFor(data, serviceId, iso) {
    var wd = iso ? weekday(iso) : null;
    return data.staff.filter(function (s) {
      return s.services.indexOf(serviceId) !== -1 && (wd === null || s.days.indexOf(wd) !== -1);
    });
  }

  /**
   * Free start times for a service on a date, every 15 minutes.
   * staffId "any" returns a time if at least one suitable stylist is free.
   * Returns [{ time, staff: [ids] }].
   */
  function availability(data, iso, serviceId, staffId) {
    var hours = data.hours[weekday(iso)];
    var svc = service(data, serviceId);
    if (!hours || !svc) return [];
    var people = stylistsFor(data, serviceId, iso).filter(function (s) { return !staffId || staffId === "any" || s.id === staffId; });
    var open = toMin(hours.open), close = toMin(hours.close);
    var now = new Date(), todayIso = isoDay(0), nowMin = now.getHours() * 60 + now.getMinutes();
    var busy = {};
    data.bookings.forEach(function (b) {
      if (b.date !== iso || b.status === "cancelled") return;
      var s = service(data, b.service);
      var start = toMin(b.time), end = start + (s ? s.duration : 30);
      (busy[b.staff] = busy[b.staff] || []).push([start, end]);
    });
    var out = [];
    for (var t = open; t + svc.duration <= close; t += 15) {
      if (iso === todayIso && t < nowMin + 30) continue;
      var free = people.filter(function (p) {
        return !(busy[p.id] || []).some(function (r) { return t < r[1] && t + svc.duration > r[0]; });
      }).map(function (p) { return p.id; });
      if (free.length) out.push({ time: toHHMM(t), staff: free });
    }
    return out;
  }

  /** Pick a value in the current language from { en, pt } (or return a plain string). */
  function text(value, lang) {
    if (value == null) return "";
    if (typeof value === "string") return value;
    return value[lang] || value.en || "";
  }

  global.AuraStore = {
    key: KEY,
    days: DAY_KEYS,
    load: load,
    save: save,
    update: update,
    reset: reset,
    onChange: onChange,
    uid: uid,
    isoDay: isoDay,
    weekday: weekday,
    toMin: toMin,
    toHHMM: toHHMM,
    service: service,
    member: member,
    stylistsFor: stylistsFor,
    availability: availability,
    text: text
  };
})(window);
