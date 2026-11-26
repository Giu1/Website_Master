/* Slab Journey: the Android app, rebuilt as a clickable phone.
   Screens, colours and wording follow the app's Compose code (ui/landing, ui/explorer,
   ui/cards, ui/collection, ui/portfolio, ui/social, ui/account). Card prices are the ones
   in the app's own screenshots; collection, portfolio and community numbers are demo data. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const eur = (n) => "€" + n.toLocaleString("en-GB", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
  const eur2 = (n) => "€" + n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const GRADES = ["Ungraded", "Grade 7", "Grade 8", "Grade 9", "Grade 9.5", "PSA 10", "BGS 10", "CGC 10", "SGC 10"];
  const g = (...v) => Object.fromEntries(GRADES.map((k, i) => [k, v[i]]));
  const CARDS = [
    { id: "pikachu", name: "Pikachu EX", num: "#XY84", set: "Pokemon Promo", series: "Market catch-all — not a collectible set yet", prices: g(45.63, 78.62, 150.85, 170.53, 189.61, 5246.62, 6820.30, 316.42, 3148.24), vol: 384, change: 20.39 },
    { id: "clefable", name: "Mega Clefable EX", num: "#119", set: "Perfect Order", series: "Pokemon Perfect Order", prices: g(50.91, null, null, 109.50, 160.69, 229.12, 430.12, 14.11, 137.30), vol: 586, change: -1.25 },
    { id: "charizard", name: "Charizard", num: "#4", set: "Base Set", series: "Pokemon Base Set · 1st Edition", prices: g(null, 1551, 26349, 44374, 69092, 322404, null, null, null), vol: 41, change: 4.8 },
    { id: "lunala", name: "Lunala GX", num: "#SM103a", set: "Pokemon Promo", series: "Market catch-all — not a collectible set yet", prices: g(13.29, 16.34, 17.77, 19.24, 20.99, 64.98, 84.83, 30.90, 39.35), vol: 152, change: 6.1 },
    { id: "altaria", name: "Altaria", num: "#194", set: "VSTAR Universe", series: "Pokemon Japanese VSTAR Universe", prices: g(4.11, 5.25, 7, 13.60, 14.87, 36.69, 29.68, 17.22, 11.94), vol: 97, change: -3.4 },
    { id: "oak", name: "Imposter Professor Oak", num: "#73", set: "Celebrations", series: "Pokemon Celebrations", prices: g(1.36, 1.97, 6.02, 10.06, 11.37, 42.85, 55.97, 12.12, 25.36), vol: 233, change: 2.2 }
  ];
  const byId = Object.fromEntries(CARDS.map((c) => [c.id, c]));
  const img = (c) => `img/app/${c.id}.jpg`;
  const firstGrade = (c) => GRADES.find((k) => c.prices[k] != null);

  /* demo holdings (portfolio) */
  const holdings = [
    { id: "pikachu", grade: "PSA 10", cost: 3900 },
    { id: "lunala", grade: "PSA 10", cost: 41 },
    { id: "clefable", grade: "Grade 9", cost: 120 },
    { id: "oak", grade: "Grade 9.5", cost: 8 }
  ];
  const SETS = [
    { sym: "BS", name: "Base Set", series: "Base", own: 34, of: 102 },
    { sym: "CEL", name: "Celebrations", series: "Sword & Shield", own: 19, of: 25 },
    { sym: "PO", name: "Perfect Order", series: "Mega Evolution", own: 58, of: 124 },
    { sym: "VSU", name: "VSTAR Universe", series: "Japanese · Sword & Shield", own: 77, of: 262 },
    { sym: "SVP", name: "Scarlet & Violet Promos", series: "Scarlet & Violet", own: 12, of: 210 }
  ];
  const PEOPLE = [
    { n: "Porto Slab House", k: "Retail shop · 214 listings", c: "#ffd700" },
    { n: "Marta R.", k: "Collector · 1,302 cards", c: "#2dd4bf" },
    { n: "Lisbon Card Vault", k: "Retail shop · 88 listings", c: "#facc15" },
    { n: "Tiago F.", k: "Collector · PSA 10 hunter", c: "#1d9e75" },
    { n: "Card Corner Braga", k: "Retail shop · 41 listings", c: "#e24b4a" }
  ];

  /* small deterministic price history that ends at the current price */
  function series(seed, end, change) {
    let s = 0;
    for (const ch of seed) s = (s * 31 + ch.charCodeAt(0)) % 9973;
    const n = 30, start = end / (1 + change / 100), walk = [0];
    for (let i = 1; i < n; i++) {
      s = (s * 9301 + 49297) % 233280;
      walk.push(walk[i - 1] + (s / 233280 - 0.5) * 0.03);
    }
    // smooth the walk, then pin both ends so the line lands on today's price
    const sm = walk.map((_, i) => { const a = walk.slice(Math.max(0, i - 2), i + 3); return a.reduce((x, y) => x + y, 0) / a.length; });
    return sm.map((w, i) => {
      const t = i / (n - 1);
      return start + (end - start) * t + end * (w - sm[0] - (sm[n - 1] - sm[0]) * t);
    });
  }
  function chartSvg(vals, up) {
    const w = 300, h = 90, min = Math.min(...vals), max = Math.max(...vals), r = max - min || 1;
    const pts = vals.map((v, i) => [(i / (vals.length - 1)) * w, h - 6 - ((v - min) / r) * (h - 16)]);
    const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
    const col = up ? "#1d9e75" : "#e24b4a";
    const id = "gr" + Math.random().toString(36).slice(2, 7);
    const last = pts[pts.length - 1];
    return `<svg class="chart" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">
      <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${col}" stop-opacity=".45"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></linearGradient></defs>
      <path d="${line} L${w} ${h} L0 ${h} Z" fill="url(#${id})"/>
      <path d="${line}" fill="none" stroke="${col}" stroke-width="2" vector-effect="non-scaling-stroke"/>
      <circle cx="${last[0]}" cy="${last[1]}" r="3.5" fill="${col}"/></svg>`;
  }

  const ICON = {
    search: "M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z",
    star: "M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z",
    list: "M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z",
    person: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
    account: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z",
    back: "M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"
  };
  const svg = (k) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${ICON[k]}"/></svg>`;
  const TABS = [
    ["explorer", "Explorer", "search"],
    ["collection", "Collection", "star"],
    ["portfolio", "Portfolio", "list"],
    ["social", "Social", "person"],
    ["account", "Account", "account"]
  ];

  const screen = $("#screen"), tabbar = $("#tabbar"), toastEl = $("#toast");
  const state = { view: "landing", tab: "explorer", card: "pikachu", grade: null, product: "Cards", q: "", pTab: "Overview", following: new Set(["Marta R."]), role: "Collector", back: "explorer" };

  tabbar.innerHTML = TABS.map(([id, label, ic]) =>
    `<button type="button" class="tab" data-tab="${id}" aria-label="${label}"><span class="ind">${svg(ic)}</span>${label}</button>`).join("");

  let toastT;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove("show"), 1800);
  }

  /* views */
  const V = {
    landing: () => `<div class="view landing">
      <div class="logo"><img src="img/logo.png" alt="" />Slab <span class="gold-t">Journey</span></div>
      <div class="stack3"><img src="${img(byId.lunala)}" alt="" /><img src="${img(byId.pikachu)}" alt="" /><img src="${img(byId.clefable)}" alt="" /></div>
      <h4>Your graded cards, valued every day</h4>
      <p>Slab Journey is a cloud-first app for collectors and shops to track market prices, profit and loss, set completion, and community — powered by daily market data.</p>
      <button class="gbtn" data-go="explorer">Get started</button>
      <button class="obtn" data-go="explorer">I already have an account</button>
      <small>Slab Journey · Collect smarter · USD market data</small>
    </div>`,

    explorer: () => {
      const q = state.q.trim().toLowerCase();
      const list = CARDS.filter((c) => !q || (c.name + " " + c.set).toLowerCase().includes(q));
      const tiles = state.product === "Containers"
        ? `<p class="empty">Sealed products load from the live catalog.<br />Switch back to Cards.</p>`
        : list.length ? list.map((c) => {
          const k = firstGrade(c);
          return `<button class="tile" data-card="${c.id}">
            <img src="${img(c)}" alt="" loading="lazy" />
            <b>${esc(c.name)} ${esc(c.num)}</b><span>${esc(c.set)}</span>
            <span class="row"><span class="p">${eur(c.prices[k])}</span><span class="g">${esc(k)}</span></span>
          </button>`;
        }).join("") : `<p class="empty">No cards match “${esc(state.q)}”.</p>`;
      return `<div class="view">
        <div class="v-head"><h3>Market Explorer</h3><p>Know what your cards are worth.</p></div>
        <label class="search">${svg("search")}<input id="q" type="search" placeholder="Search cards or sets" value="${esc(state.q)}" aria-label="Search cards" /></label>
        <div class="chips">${["Cards", "Containers", "All"].map((p) => `<button class="chip${state.product === p ? " on" : ""}" data-product="${p}">${p}</button>`).join("")}</div>
        <div class="grid">${tiles}</div>
      </div>`;
    },

    card: () => {
      const c = byId[state.card];
      const k = state.grade && c.prices[state.grade] != null ? state.grade : firstGrade(c);
      const vals = Object.values(c.prices).filter((v) => v != null);
      const spread = Math.max(...vals) - Math.min(...vals);
      const up = c.change >= 0;
      return `<div class="view push">
        <div class="v-bar"><button class="icon-btn" data-back aria-label="Back">${svg("back")}</button><b>${esc(c.name)} ${esc(c.num)}</b></div>
        <div class="art"><img src="${img(c)}" alt="${esc(c.name)} card" /></div>
        <div class="card-title">${esc(c.name)} ${esc(c.num)}</div>
        <div class="card-set">${esc(c.set)}</div>
        <div class="card-series">${esc(c.series)}</div>
        <div class="back-row"><i></i><div><b>Default card back</b><span>Pokémon Classic</span></div></div>
        <div class="grades" role="group" aria-label="Grade">${GRADES.map((gr) => {
          const v = c.prices[gr];
          return `<button class="grade${gr === k ? " on" : ""}" data-grade="${gr}"${v == null ? " disabled" : ""} aria-pressed="${gr === k}"><small>${gr}</small><b>${v == null ? "—" : eur2(v)}</b></button>`;
        }).join("")}</div>
        <button class="gbtn" data-add>Add to portfolio</button>
        <div class="panel" style="margin-top:12px"><div class="mp"><div><div class="lbl">Market price</div><div class="big">${eur2(c.prices[k])}</div></div><span class="pill">${esc(k)}</span></div></div>
        <div class="panel">
          <h5>Market statistics</h5>
          <p class="sub">Sales volume, grade price spread, and 30-day price change from recorded market history.</p>
          <div class="stats">
            <div><span class="lbl">Sales vol.</span><b>${c.vol}</b></div>
            <div><span class="lbl">Grade spread</span><b>${eur2(spread)}</b></div>
            <div><span class="lbl">30D change</span><b class="${up ? "up" : "down"}">${up ? "+" : ""}${c.change.toFixed(2)}%</b></div>
          </div>
          <span class="lbl">Price trend</span>
          ${chartSvg(series(c.id + k, c.prices[k], c.change), up)}
        </div>
      </div>`;
    },

    collection: () => `<div class="view">
      <div class="v-head"><h3>Collection</h3><p>Track set completion against your portfolio holdings.</p></div>
      <div class="chips"><button class="chip on">Set tracker</button><button class="chip" data-toast="The Pokédex grid shows every Pokémon you own.">Pokédex grid</button></div>
      <div class="panel"><div class="lbl">Collection stats</div><div class="big">${SETS.reduce((t, s) => t + s.own, 0)} <span class="muted" style="font-size:14px">cards · ${SETS.length} sets</span></div></div>
      ${SETS.map((s) => {
        const p = Math.round((s.own / s.of) * 100);
        return `<div class="set"><div class="sym">${s.sym}</div><div class="meta"><b>${esc(s.name)}</b><span>${esc(s.series)} · ${s.own}/${s.of}</span><div class="bar"><i style="width:${p}%"></i></div></div><span class="pct">${p}%</span></div>`;
      }).join("")}
    </div>`,

    portfolio: () => {
      const rows = holdings.map((h) => ({ ...h, c: byId[h.id], v: byId[h.id].prices[h.grade] }));
      const total = rows.reduce((t, r) => t + r.v, 0), cost = rows.reduce((t, r) => t + r.cost, 0), pl = total - cost;
      const up = pl >= 0;
      let body = "";
      if (state.pTab === "Gallery") {
        body = `<div class="gallery">${rows.map((r) => `<img src="${img(r.c)}" alt="${esc(r.c.name)}" data-card="${r.id}" style="cursor:pointer" />`).join("")}</div>`;
      } else if (state.pTab === "Performance") {
        body = `<div class="panel"><span class="lbl">Value · 30 days</span>${chartSvg(series("pf" + rows.length, total, 9.4), true)}</div>
          <div class="panel"><div class="stats" style="margin:0">
            <div><span class="lbl">Best</span><b class="up">${esc(rows.slice().sort((a, b) => (b.v - b.cost) - (a.v - a.cost))[0].c.name)}</b></div>
            <div><span class="lbl">Cards</span><b>${rows.length}</b></div>
            <div><span class="lbl">Return</span><b class="${up ? "up" : "down"}">${up ? "+" : ""}${((pl / cost) * 100).toFixed(1)}%</b></div>
          </div></div>`;
      } else {
        body = rows.map((r) => {
          const d = r.v - r.cost;
          return `<div class="hold" data-card="${r.id}" data-g="${r.grade}"><img src="${img(r.c)}" alt="" /><div class="meta"><b>${esc(r.c.name)} ${esc(r.c.num)}</b><span>${esc(r.grade)} · cost ${eur2(r.cost)}</span></div><div class="val">${eur2(r.v)}<small class="${d >= 0 ? "up" : "down"}">${d >= 0 ? "+" : "−"}${eur2(Math.abs(d))}</small></div></div>`;
        }).join("");
      }
      return `<div class="view">
        <div class="v-head"><h3>Portfolio</h3><p>Track profit and loss on your slabs.</p></div>
        <div class="panel"><div class="lbl">Total value</div><div class="big">${eur2(total)}</div>
          <div style="margin-top:6px;font:600 12px/1 var(--mono)" class="${up ? "up" : "down"}">${up ? "▲ +" : "▼ −"}${eur2(Math.abs(pl))} (${((pl / cost) * 100).toFixed(1)}%)</div>
          ${chartSvg(series("pv" + rows.length, total, 9.4), true)}
        </div>
        <div class="seg">${["Overview", "Gallery", "Performance"].map((t) => `<button class="${state.pTab === t ? "on" : ""}" data-ptab="${t}">${t}</button>`).join("")}</div>
        ${body}
        <p class="muted" style="font-size:11px;margin-top:12px">${rows.length} grades · ${rows.length} cards</p>
      </div>`;
    },

    social: () => `<div class="view">
      <div class="v-head"><h3>Community</h3><p>Discover collectors and retail shops with public listings.</p></div>
      <label class="search">${svg("search")}<input type="search" placeholder="Search people and shops" aria-label="Search people" /></label>
      <div class="panel" style="padding:4px 14px">${PEOPLE.map((p) => {
        const on = state.following.has(p.n);
        return `<div class="person"><div class="av" style="background:${p.c}">${esc(p.n.split(" ").map((w) => w[0]).join("").slice(0, 2))}</div><div class="meta"><b>${esc(p.n)}</b><span>${esc(p.k)}</span></div><button class="follow${on ? " on" : ""}" data-follow="${esc(p.n)}">${on ? "Following" : "Follow"}</button></div>`;
      }).join("")}</div>
    </div>`,

    account: () => `<div class="view">
      <div class="v-head"><h3>Account</h3><p>collector@example.com</p></div>
      <div class="panel"><b>Social profile</b><p class="sub">Choose how your public profile appears in Social.</p>
        <div class="toggle">${["Collector", "Retail shop"].map((r) => `<button class="${state.role === r ? "on" : ""}" data-role="${r}">${r}</button>`).join("")}</div></div>
      <div class="panel"><b>Activity</b><p class="sub">Notifications, trades, and shop requests.</p>
        <div class="row-link" data-toast="No new notifications"><div><b>Notifications</b><span>Alerts, offers, and account updates</span></div><em>›</em></div>
        <div class="row-link" data-toast="Your history is empty in this preview"><div><b>Transaction history</b><span>Buys, sells, trades, and safekeeping</span></div><em>›</em></div>
        <div class="row-link" data-toast="Shop applications are reviewed by hand"><div><b>Become a shop account</b><span>Submit an application to start selling through the app</span></div><em>›</em></div>
      </div>
      <div class="panel"><b>Portfolio</b><p class="sub">Defaults when tracking slabs and P&amp;L.</p>
        <div class="row-link" data-toast="CSV import and export"><div><b>Portfolio data tools</b><span>Import/export holdings or download the CSV template</span></div><em>›</em></div>
      </div>
      <div class="panel"><b>Display currency</b><p class="sub">Prices are stored in USD and shown in your currency.</p>
        <div class="toggle"><button class="on">€ EUR</button><button data-toast="USD and JPY are in the full app">$ USD</button></div></div>
      <button class="obtn" data-go="landing">Sign out</button>
    </div>`
  };

  function render(push) {
    const isTab = TABS.some(([id]) => id === state.view);
    if (isTab) state.tab = state.view;
    tabbar.hidden = state.view === "landing";
    $$(".tab", tabbar).forEach((t) => {
      const on = t.dataset.tab === state.tab;
      t.classList.toggle("on", on);
      t.setAttribute("aria-current", on ? "page" : "false");
    });
    screen.innerHTML = V[state.view]();
    if (!push) screen.scrollTop = 0;
    if (push) screen.scrollTop = 0;
    $$("#jump [data-go]").forEach((b) => b.setAttribute("aria-current", String(b.dataset.go === state.view)));
    const q = $("#q", screen);
    if (q) q.addEventListener("input", () => {
      state.q = q.value;
      const pos = q.selectionStart;
      render();
      const n = $("#q", screen); n.focus(); n.setSelectionRange(pos, pos);
    });
  }

  function go(view, opts = {}) {
    if (view === "card") {
      state.back = state.view === "card" ? state.back : state.view;
      state.card = opts.card || state.card;
      state.grade = opts.grade || null;
    }
    state.view = view;
    render(view === "card");
  }

  screen.addEventListener("click", (e) => {
    const t = e.target;
    const goEl = t.closest("[data-go]"); if (goEl) return go(goEl.dataset.go);
    const back = t.closest("[data-back]"); if (back) { state.view = state.back || "explorer"; return render(); }
    const card = t.closest("[data-card]"); if (card) return go("card", { card: card.dataset.card, grade: card.dataset.g });
    const pr = t.closest("[data-product]"); if (pr) { state.product = pr.dataset.product; return render(); }
    const gr = t.closest("[data-grade]"); if (gr && !gr.disabled) { state.grade = gr.dataset.grade; const top = screen.scrollTop; render(); screen.scrollTop = top; return; }
    if (t.closest("[data-add]")) {
      const c = byId[state.card], k = state.grade && c.prices[state.grade] != null ? state.grade : firstGrade(c);
      holdings.push({ id: c.id, grade: k, cost: Math.round(c.prices[k] * 0.9 * 100) / 100 });
      return toast(`Added ${c.name} (${k}) to your portfolio`);
    }
    const pt = t.closest("[data-ptab]"); if (pt) { state.pTab = pt.dataset.ptab; return render(); }
    const f = t.closest("[data-follow]"); if (f) { const n = f.dataset.follow; state.following.has(n) ? state.following.delete(n) : state.following.add(n); const top = screen.scrollTop; render(); screen.scrollTop = top; return; }
    const r = t.closest("[data-role]"); if (r) { state.role = r.dataset.role; const top = screen.scrollTop; render(); screen.scrollTop = top; return; }
    const ts = t.closest("[data-toast]"); if (ts) return toast(ts.dataset.toast);
  });
  tabbar.addEventListener("click", (e) => { const b = e.target.closest("[data-tab]"); if (b) go(b.dataset.tab); });
  $("#jump").addEventListener("click", (e) => {
    const b = e.target.closest("[data-go]"); if (!b) return;
    if (b.dataset.go === "card") { state.view = "explorer"; go("card", { card: b.dataset.card }); } else go(b.dataset.go);
    if (matchMedia("(max-width: 900px)").matches) $(".device").scrollIntoView({ block: "center" });
  });

  const clock = $("#clock");
  const tick = () => { const d = new Date(); clock.textContent = d.getHours() + ":" + String(d.getMinutes()).padStart(2, "0"); };
  tick(); setInterval(tick, 30000);

  render();
})();
