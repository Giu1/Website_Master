/* FORMA core — i18n, money, catalog helpers, cart & order storage, SVG art */
(() => {
  const LANGS = ["pt-PT", "pt-BR", "es", "en"];
  const KEYS = { lang: "forma-lang", cart: "forma-cart", orders: "forma-orders", cookie: "forma-cookie-ok" };
  const config = window.FORMA_CONFIG || {};
  const i18n = window.FORMA_I18N || {};
  const products = window.FORMA_PRODUCTS || [];
  const categories = window.FORMA_CATEGORIES || [];
  const listeners = {};

  /* ------------------------------------------------------------ language */
  function detectLang() {
    const fromUrl = new URLSearchParams(location.search).get("lang");
    if (LANGS.includes(fromUrl)) return fromUrl;
    const stored = localStorage.getItem(KEYS.lang);
    if (LANGS.includes(stored)) return stored;
    const nav = (navigator.language || "en").toLowerCase();
    if (nav.startsWith("es")) return "es";
    if (nav.startsWith("pt-br")) return "pt-BR";
    if (nav.startsWith("pt")) return "pt-PT";
    return "en";
  }
  let lang = detectLang();

  function lookup(code, key) {
    return key.split(".").reduce((acc, part) => (acc == null ? undefined : acc[part]), i18n[code]);
  }
  function t(key, vars) {
    let value = lookup(lang, key);
    if (value === undefined && lang === "pt-BR") value = lookup("pt-PT", key);
    if (value === undefined && lang === "es") value = lookup("en", key);
    if (value === undefined) value = lookup("en", key);
    if (value === undefined) return key;
    if (typeof value === "string" && vars) {
      Object.keys(vars).forEach((k) => {
        value = value.replace(new RegExp(`\\{${k}\\}`, "g"), String(vars[k]));
      });
    }
    return value;
  }
  function tt(value) {
    if (value == null) return "";
    if (typeof value === "string") return value;
    return value[lang] || (lang === "es" ? value.en : undefined) || value["pt-PT"] || value["pt-BR"] || value.en || "";
  }
  function setLang(next) {
    if (!LANGS.includes(next) || next === lang) return;
    lang = next;
    localStorage.setItem(KEYS.lang, next);
    const url = new URL(location.href);
    url.searchParams.set("lang", next);
    history.replaceState({}, "", url);
    emit("lang", next);
  }

  /* -------------------------------------------------------------- utils */
  function esc(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function money(n, opts = {}) {
    const currency = config.currency || "EUR";
    try {
      return new Intl.NumberFormat(lang, {
        style: "currency",
        currency,
        minimumFractionDigits: opts.cents === false ? 0 : Number.isInteger(n) ? 0 : 2,
        maximumFractionDigits: 2
      }).format(n);
    } catch {
      return `${n} €`;
    }
  }
  function fmtDate(iso) {
    try {
      return new Intl.DateTimeFormat(lang, { dateStyle: "medium" }).format(new Date(iso));
    } catch {
      return iso;
    }
  }
  function on(evt, fn) {
    (listeners[evt] = listeners[evt] || []).push(fn);
  }
  function emit(evt, data) {
    (listeners[evt] || []).forEach((fn) => fn(data));
  }
  function withLang(url) {
    const u = new URL(url, location.href);
    u.searchParams.delete("lang");
    if (lang !== detectDefault()) u.searchParams.set("lang", lang);
    return u.pathname.split("/").pop() + u.search + u.hash;
  }
  function detectDefault() {
    const nav = (navigator.language || "en").toLowerCase();
    if (nav.startsWith("es")) return "es";
    if (nav.startsWith("pt-br")) return "pt-BR";
    if (nav.startsWith("pt")) return "pt-PT";
    return "en";
  }
  function param(name) {
    return new URLSearchParams(location.search).get(name);
  }
  function validEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }
  function whatsappLink(message) {
    if (!config.whatsapp) return "";
    return `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(message || t("whatsapp.message"))}`;
  }

  /* ------------------------------------------------------------ catalog */
  const product = (id) => products.find((p) => p.id === id);
  const category = (id) => categories.find((c) => c.id === id);
  const productName = (p) => tt(p.name);
  const catTitle = (id) => t(`cats.${id}.title`);
  const inCategory = (id) => products.filter((p) => p.category === id);
  const discount = (p) => (p.compareAt && p.price && p.compareAt > p.price ? Math.round((1 - p.price / p.compareAt) * 100) : 0);
  const canBuy = (p) => p.price != null && p.status !== "coming";

  function priceHtml(p, big) {
    if (p.price == null) return `<span class="price"><span class="price-now">${t("price.onRequest")}</span></span>`;
    const d = discount(p);
    return `<span class="price${big ? " price-big" : ""}">${
      d ? `<del class="price-was">${money(p.compareAt)}</del>` : ""
    }<ins class="price-now">${money(p.price)}</ins></span>`;
  }

  /* --------------------------------------------------------------- art */
  const SHAPES = {
    "initials-keychain": (a) => `<circle cx="22" cy="20" r="9" stroke="${a}" stroke-width="4" fill="none"/><rect x="28" y="28" width="38" height="38" rx="8" fill="#f4ecdc"/><path d="M38 40h6v16h-6zM46 40h10c5 0 8 3 8 6s-3 6-8 6H46" stroke="#1a1410" stroke-width="3" fill="none"/>`,
    "pixel-mascot": (a) => `<rect x="22" y="18" width="36" height="28" fill="#f4ecdc"/><rect x="28" y="24" width="8" height="8" fill="#1a1410"/><rect x="44" y="24" width="8" height="8" fill="#1a1410"/><rect x="32" y="46" width="8" height="16" fill="#f4ecdc"/><rect x="44" y="46" width="8" height="16" fill="#f4ecdc"/><rect x="18" y="28" width="8" height="8" fill="${a}"/><rect x="54" y="28" width="8" height="8" fill="${a}"/>`,
    "name-tag": (a) => `<rect x="10" y="28" width="60" height="24" rx="7" fill="#f4ecdc"/><circle cx="22" cy="40" r="4" fill="${a}"/><path d="M32 36h28M32 44h20" stroke="#1a1410" stroke-width="3" stroke-linecap="round"/>`,
    "assembled-figure": (a) => `<circle cx="40" cy="15" r="8" fill="#f4ecdc"/><rect x="31" y="25" width="18" height="24" rx="3" fill="#f4ecdc"/><rect x="20" y="27" width="10" height="6" rx="2" fill="${a}"/><rect x="50" y="27" width="10" height="6" rx="2" fill="${a}"/><rect x="31" y="51" width="7" height="18" fill="#f4ecdc"/><rect x="42" y="51" width="7" height="18" fill="#f4ecdc"/><rect x="24" y="70" width="32" height="4" rx="2" fill="${a}" opacity=".8"/>`,
    "comic-bust": (a) => `<circle cx="40" cy="24" r="12" fill="#f4ecdc"/><path d="M16 70c4-22 44-22 48 0z" fill="#f4ecdc"/><rect x="33" y="21" width="14" height="4" fill="${a}"/><path d="M26 58l-4 8M54 58l4 8" stroke="#1a1410" stroke-width="2" opacity=".4"/>`,
    "shadow-lamp": (a) => `<rect x="20" y="46" width="40" height="22" rx="4" fill="#25242c" stroke="${a}" stroke-width="2"/><path d="M28 46 L14 12 H66 L52 46 Z" fill="${a}" opacity=".18"/><circle cx="40" cy="30" r="12" fill="${a}" opacity=".45"/><path d="M34 36c2-8 10-8 12 0c-3 2-9 2-12 0z" fill="#17161c"/><circle cx="40" cy="27" r="3" fill="#17161c"/>`,
    "wyrm-mini": (a) => `<ellipse cx="40" cy="64" rx="22" ry="5" fill="#1a1410" opacity=".6"/><path d="M18 56c8-24 24-8 32-22 6 14 18 8 14 24" stroke="#f4ecdc" stroke-width="7" stroke-linecap="round" fill="none"/><circle cx="56" cy="30" r="6" fill="${a}"/><circle cx="58" cy="29" r="1.5" fill="#1a1410"/>`,
    "hero-pack": (a) => [0, 1, 2, 3, 4].map((i) => `<rect x="${11 + i * 13}" y="${26 + (i % 2) * 8}" width="10" height="24" rx="3" fill="${i === 2 ? a : "#f4ecdc"}"/><circle cx="${16 + i * 13}" cy="${22 + (i % 2) * 8}" r="4" fill="${i === 2 ? a : "#f4ecdc"}"/>`).join(""),
    "dungeon-tiles": (a) => [0, 1, 2].map((r) => [0, 1, 2].map((c) => `<rect x="${17 + c * 16}" y="${17 + r * 16}" width="14" height="14" rx="2" fill="${(r + c) % 2 ? "#8a8a8a" : "#f4ecdc"}" opacity=".9"/>`).join("")).join("") + `<rect x="33" y="33" width="14" height="14" rx="2" fill="${a}"/>`,
    "geo-planter": (a) => `<path d="M22 22h36l8 40H14z" fill="#f4ecdc"/><path d="M22 22l18 40L58 22" stroke="#1a1410" stroke-width="1.5" opacity=".2" fill="none"/><path d="M36 10c4 6 4 10 4 12s0-6 4-12" stroke="${a}" stroke-width="4" stroke-linecap="round" fill="none"/>`,
    "cable-nest": (a) => `<path d="M14 48c10-20 42-20 52 0" stroke="#f4ecdc" stroke-width="9" stroke-linecap="round" fill="none"/><circle cx="18" cy="52" r="6" fill="${a}"/><circle cx="62" cy="52" r="6" fill="${a}"/>`,
    "desk-tray": (a) => `<rect x="10" y="26" width="60" height="30" rx="5" fill="#f4ecdc"/><rect x="16" y="32" width="20" height="18" rx="2" fill="${a}"/><rect x="42" y="32" width="22" height="8" rx="2" fill="#1a1410" opacity=".25"/><rect x="42" y="44" width="22" height="6" rx="2" fill="#1a1410" opacity=".15"/>`,
    "moon-lamp": (a) => `<circle cx="40" cy="36" r="22" fill="#f4ecdc"/><circle cx="32" cy="30" r="4" fill="#1a1410" opacity=".12"/><circle cx="48" cy="40" r="6" fill="#1a1410" opacity=".1"/><circle cx="38" cy="48" r="3" fill="#1a1410" opacity=".12"/><rect x="30" y="60" width="20" height="8" rx="3" fill="${a}"/>`,
    "display-helm": (a) => `<path d="M16 46c0-18 12-30 24-30s24 12 24 30v10H16z" fill="#f4ecdc"/><rect x="26" y="40" width="28" height="9" rx="2" fill="${a}"/><path d="M40 16v-8" stroke="${a}" stroke-width="4" stroke-linecap="round"/>`,
    "stage-hilt": (a) => `<rect x="36" y="8" width="8" height="42" rx="3" fill="#f4ecdc"/><rect x="16" y="34" width="48" height="8" rx="4" fill="${a}"/><rect x="32" y="52" width="16" height="18" rx="4" fill="#f4ecdc"/><rect x="34" y="42" width="12" height="10" fill="#1a1410" opacity=".3"/>`,
    "phone-stand": (a) => `<path d="M20 64h40l-8-8H28z" fill="#f4ecdc"/><rect x="30" y="14" width="24" height="44" rx="4" transform="rotate(-12 42 36)" fill="#25242c" stroke="${a}" stroke-width="2"/>`
  };

  function tile(inner, accent, opts = {}) {
    const lit = opts.lit ? 1 : 0.55;
    const id = `g${Math.random().toString(36).slice(2, 8)}`;
    return `<svg class="art${opts.className ? " " + opts.className : ""}" viewBox="0 0 400 400" role="img" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="${id}" cx="50%" cy="42%" r="65%">
          <stop offset="0" stop-color="#3a3944"/><stop offset="1" stop-color="#17161c"/>
        </radialGradient>
        <radialGradient id="${id}b" cx="50%" cy="50%" r="50%">
          <stop offset="0" stop-color="${accent}" stop-opacity="${lit * 0.55}"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="400" height="400" fill="url(#${id})"/>
      <circle cx="200" cy="200" r="150" fill="url(#${id}b)"/>
      <ellipse cx="200" cy="318" rx="110" ry="14" fill="#000" opacity=".35"/>
      <svg x="80" y="72" width="240" height="240" viewBox="0 0 80 80">${inner}</svg>
    </svg>`;
  }

  function productArt(p, opts = {}) {
    const accent = (category(p.category) || {}).accent || "#a2fef9";
    const shape = SHAPES[p.art] || SHAPES[p.id] || SHAPES["shadow-lamp"] || SHAPES["geo-planter"];
    return tile(shape(accent), accent, opts);
  }

  function productImage(p, idx = 0, opts = {}) {
    const imgs = (p.images || []).filter(Boolean);
    if (imgs[idx]) return `<img src="${esc(imgs[idx])}" alt="${esc(productName(p))}" loading="lazy" />`;
    return productArt(p, { lit: idx > 0 || opts.lit });
  }

  function categoryArt(cat) {
    const pick = (p) => SHAPES[p.art] || SHAPES[p.id] || SHAPES["shadow-lamp"] || SHAPES["geo-planter"];
    const first = inCategory(cat.id)[0];
    const shape = first ? pick(first) : SHAPES["geo-planter"];
    const ids = inCategory(cat.id).slice(0, 3).map(pick);
    const inner = ids.length > 1
      ? ids.map((fn, i) => `<svg x="${6 + i * 24}" y="${18 - (i % 2) * 6}" width="34" height="34" viewBox="0 0 80 80" opacity="${i === 1 ? 1 : 0.85}">${fn(cat.accent)}</svg>`).join("")
      : shape(cat.accent);
    return tile(inner, cat.accent, { lit: true, className: "art-cat" });
  }

  /* ------------------------------------------------------- product card */
  function productCard(p) {
    const d = discount(p);
    const url = withLang(`produto.html?id=${p.id}`);
    const buy = canBuy(p);
    return `<article class="pcard" data-id="${p.id}">
      <a class="pcard-media" href="${url}" aria-label="${esc(productName(p))}">
        ${d ? `<span class="badge badge-sale">-${d}%</span>` : ""}
        ${p.status === "coming" ? `<span class="badge badge-soon">${t("status.coming")}</span>` : ""}
        <span class="pcard-img">${productImage(p, 0)}</span>
        <span class="pcard-img pcard-img-alt">${productImage(p, 1)}</span>
      </a>
      <div class="pcard-body">
        <p class="pcard-cat">${esc(catTitle(p.category))}</p>
        <h3 class="pcard-title"><a href="${url}">${esc(productName(p))}</a></h3>
        ${priceHtml(p)}
        ${
          buy
            ? `<button class="btn btn-dark btn-sm pcard-add" type="button" data-add="${p.id}"><i class="ri-shopping-cart-line"></i> ${t("product.add")}</button>`
            : `<a class="btn btn-ghost btn-sm" href="${url}">${p.status === "coming" ? t("product.notify") : t("product.request")}</a>`
        }
      </div>
    </article>`;
  }

  /* --------------------------------------------------------------- cart */
  function readJson(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
      return fallback;
    }
  }
  function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
  const lineKey = (id, options) => `${id}|${options?.color || ""}|${options?.text || ""}`;

  const cart = {
    get: () => readJson(KEYS.cart, []).filter((l) => product(l.id)),
    save(lines) {
      writeJson(KEYS.cart, lines);
      emit("cart", lines);
    },
    add(id, qty = 1, options = {}) {
      const p = product(id);
      if (!p || !canBuy(p)) return false;
      const lines = cart.get();
      const key = lineKey(id, options);
      const found = lines.find((l) => l.key === key);
      if (found) found.qty = Math.min(99, found.qty + qty);
      else lines.push({ key, id, qty: Math.max(1, qty), options });
      cart.save(lines);
      return true;
    },
    update(key, qty) {
      const lines = cart.get();
      const line = lines.find((l) => l.key === key);
      if (!line) return;
      line.qty = Math.max(0, Math.min(99, qty));
      cart.save(lines.filter((l) => l.qty > 0));
    },
    remove(key) {
      cart.save(cart.get().filter((l) => l.key !== key));
    },
    clear() {
      cart.save([]);
    },
    count: () => cart.get().reduce((n, l) => n + l.qty, 0),
    subtotal: () => cart.get().reduce((n, l) => n + l.qty * (product(l.id).price || 0), 0)
  };

  /* ------------------------------------------------------------ shipping */
  const shipping = {
    zones: () => (config.shipping && config.shipping.zones) || [],
    zone: (id) => shipping.zones().find((z) => z.id === id),
    price(zoneId, subtotal) {
      const z = shipping.zone(zoneId);
      if (!z) return 0;
      const free = config.shipping && config.shipping.freeFrom;
      if (zoneId === "pt" && free != null && subtotal >= free) return 0;
      return z.price;
    },
    freeFrom: () => (config.shipping ? config.shipping.freeFrom : null)
  };

  /* -------------------------------------------------------------- orders */
  const orders = {
    list: () => readJson(KEYS.orders, []).sort((a, b) => (a.date < b.date ? 1 : -1)),
    add(order) {
      const list = readJson(KEYS.orders, []);
      list.push(order);
      writeJson(KEYS.orders, list);
    },
    find: (number, email) =>
      readJson(KEYS.orders, []).find(
        (o) => o.number.toLowerCase() === String(number).trim().toLowerCase() && o.email.toLowerCase() === String(email).trim().toLowerCase()
      ),
    clear: () => writeJson(KEYS.orders, []),
    newNumber() {
      const d = new Date();
      const y = String(d.getFullYear()).slice(2);
      const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
      return `FRM-${y}${String(d.getMonth() + 1).padStart(2, "0")}-${rnd}`;
    }
  };

  /* ---------------------------------------------------------- form send */
  function endpoint() {
    if (config.formspreeId) return { url: `https://formspree.io/f/${config.formspreeId}`, extra: {} };
    if (config.ownerEmail) {
      return {
        url: `https://formsubmit.co/ajax/${encodeURIComponent(config.ownerEmail)}`,
        extra: { _captcha: "false", _template: "table" }
      };
    }
    return null;
  }
  async function send(payload) {
    const dest = endpoint();
    if (!dest) throw new Error("missing-config");
    const res = await fetch(dest.url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ ...payload, language: lang, source: location.href, ...dest.extra })
    });
    if (!res.ok) throw new Error("bad-status");
    return res;
  }

  /* --------------------------------------------------------------- toast */
  let toastTimer;
  function toast(message, opts = {}) {
    let el = document.getElementById("toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "toast";
      el.className = "toast";
      el.setAttribute("role", "status");
      document.body.appendChild(el);
    }
    el.innerHTML = `${opts.icon ? `<i class="${opts.icon}"></i>` : ""}<span>${message}</span>${
      opts.link ? `<a href="${opts.link.href}">${opts.link.label}</a>` : ""
    }`;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), opts.duration || 3200);
  }

  window.FORMA = {
    LANGS,
    KEYS,
    config,
    get lang() {
      return lang;
    },
    setLang,
    t,
    tt,
    esc,
    money,
    fmtDate,
    on,
    emit,
    withLang,
    param,
    validEmail,
    whatsappLink,
    products,
    categories,
    product,
    category,
    productName,
    catTitle,
    inCategory,
    discount,
    canBuy,
    priceHtml,
    productArt,
    shape: (id, accent) => (SHAPES[id] || SHAPES["geo-planter"])(accent),
    productImage,
    categoryArt,
    productCard,
    cart,
    shipping,
    orders,
    endpoint,
    send,
    toast
  };
})();
