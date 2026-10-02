(function (global) {
  var KEY = "aura-demo-store";

  var DEFAULTS = {
    announcement: "New guests: first cut includes a consult.",
    hero: "Hair with a point of view.",
    hours: {
      mon: "Closed",
      tue: "10:00–19:00",
      wed: "10:00–19:00",
      thu: "10:00–20:00",
      fri: "10:00–20:00",
      sat: "09:00–17:00",
      sun: "Closed"
    },
    services: [
      { id: "cut", name: "Cut & finish", price: 38, duration: 45, visible: true },
      { id: "blow", name: "Blow-dry", price: 28, duration: 35, visible: true },
      { id: "balayage", name: "Balayage", price: 90, duration: 150, visible: true },
      { id: "gloss", name: "Gloss", price: 42, duration: 40, visible: true },
      { id: "treatment", name: "Repair ritual", price: 35, duration: 30, visible: true }
    ],
    staff: [
      { id: "ana", name: "Ana Costa", role: "Colour", days: "Tue–Sat" },
      { id: "rui", name: "Rui Mendes", role: "Cut", days: "Wed–Sat" },
      { id: "lea", name: "Léa Moreau", role: "Texture", days: "Thu–Sat" }
    ],
    bookings: [
      { id: "b1", client: "Marta Silva", service: "Cut & finish", date: "2026-09-25", time: "11:00", status: "confirmed" },
      { id: "b2", client: "João Pires", service: "Blow-dry", date: "2026-09-25", time: "14:30", status: "confirmed" },
      { id: "b3", client: "Inês Lopes", service: "Balayage", date: "2026-09-26", time: "10:00", status: "done" }
    ],
    gallery: [
      { id: "g1", url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80", alt: "Salon floor with warm light" },
      { id: "g2", url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80", alt: "Hair colour being painted" },
      { id: "g3", url: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1200&q=80", alt: "Close cut in progress" },
      { id: "g4", url: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80", alt: "Finished blow-dry" }
    ]
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return clone(DEFAULTS);
      var data = JSON.parse(raw);
      return Object.assign(clone(DEFAULTS), data);
    } catch (error) {
      return clone(DEFAULTS);
    }
  }

  function save(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
    return data;
  }

  function uid(prefix) {
    return prefix + "-" + Math.random().toString(36).slice(2, 8);
  }

  global.AuraStore = {
    key: KEY,
    defaults: DEFAULTS,
    load: load,
    save: save,
    uid: uid,
    visibleServices: function () {
      return load().services.filter(function (item) { return item.visible; });
    }
  };
})(window);
