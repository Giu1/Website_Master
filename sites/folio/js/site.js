/**
 * FOLIO — stage, index lens, profile/newsletter rings and case sheets.
 * Content lives in data.js. Three.js comes from a CDN via the import map in
 * index.html. Narrow screens, reduced motion, or no WebGL get a flat scroller.
 */
const F = window.FOLIO;
const featured = F.projects.filter((p) => p.featured);
const body = document.body;

const $ = (id) => document.getElementById(id);
const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeOutExpo = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
const easeInCubic = (t) => t * t * t;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const narrow = () => matchMedia("(max-width: 860px)").matches;
const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;

const CARD_ASPECT = 1.42;
const ARROW_SVG = `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 11.5 L11.5 4.5 M6 4.5 H11.5 V10" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>`;
const AWARD_SVG = `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5 H12 V6 A4 4 0 0 1 4 6 Z M8 10 V13 M5.5 13.5 H10.5 M4 3.5 H2.5 V5 A2 2 0 0 0 4.4 7 M12 3.5 H13.5 V5 A2 2 0 0 1 11.6 7" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>`;

const STYLE_KEY = "folio-style";
const ui = {
  view: "featured",     // "featured" | "full" | "traditional"
  overlay: null,        // null | "profile" | "news"
  lastView: "#featured",
  style: (() => {       // featured card look: 1 arc panels, 2 ribbon, 3 living ribbon
    try { const v = Number(localStorage.getItem(STYLE_KEY)); return [1, 2, 3].includes(v) ? v : 2; } catch { return 2; }
  })()
};

let stage = null;   // WebGL stage api
let lens = null;    // index lens api

/* ───────────────────────── content ───────────────────────── */

function fillChrome() {
  document.title = F.name;
  $("brand").textContent = F.name;
  $("profile-copy").innerHTML = F.bio.map((p) => `<p>${esc(p)}</p>`).join("");
  $("awards").textContent = F.awards;
  $("news-copy").textContent = F.newsletter;
  $("socials").innerHTML = F.links
    .map((l) => {
      const label = esc(l.label);
      if (!l.href) return `<li><span>${label}</span></li>`;
      return `<li><a href="${esc(l.href)}" target="_blank" rel="noopener">${label}</a></li>`;
    })
    .concat(F.email ? [`<li><a href="mailto:${esc(F.email)}">Email</a></li>`] : [])
    .join("");

  $("a11y").innerHTML = `
    <h1>${esc(F.name)} — ${esc(F.role)}</h1>
    ${F.bio.map((p) => `<p>${esc(p)}</p>`).join("")}
    <p>${esc(F.awards)}</p>
    <h2>Featured work</h2>
    <ul>${featured.map((p) => `<li><a href="#p/${esc(p.slug)}">${esc(p.title)}</a> — ${esc(p.summary)}</li>`).join("")}</ul>`;

  $("index-title").textContent = `Index — every project by ${F.name}`;
  $("index-list").innerHTML = F.projects
    .map((p, i) => {
      const external = !p.featured && p.url;
      const href = external ? p.url : `#p/${p.slug}`;
      const ext = external ? ` target="_blank" rel="noopener"` : "";
      const sep = i ? ` <span class="sep" aria-hidden="true">·</span> ` : "";
      return `${sep}<a href="${esc(href)}" data-slug="${esc(p.slug)}"${ext}>${esc(p.title)}</a>`;
    })
    .join("");
}

/** Traditional view: every project as a plain grid. Needs media warmed. */
function fillGrid() {
  $("grid-count").textContent = `${F.projects.length} projects`;
  $("grid-list").innerHTML = F.projects
    .map((p, i) => {
      const external = !p.featured && p.url;
      const href = external ? p.url : `#p/${p.slug}`;
      const ext = external ? ` target="_blank" rel="noopener"` : "";
      const client = p.client && p.client !== p.title ? `<p class="c">${esc(p.client)}</p>` : "";
      return `<li class="work" style="--i:${Math.min(i, 12)}">
        <a href="${esc(href)}"${ext}>
          <div class="thumb">
            <img src="${mediaURL(p, p.media[0])}" alt="" loading="lazy">
            <span class="go">${ARROW_SVG}</span>
          </div>
          <div class="row"><span class="t">${esc(p.title)}</span><span class="y">${esc(p.year)}</span></div>
          ${client}
        </a>
      </li>`;
    })
    .join("");
}

/* ───────────────────────── images + posters ───────────────────────── */

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function warmMedia(onProgress) {
  const list = [];
  for (const p of F.projects) for (const m of p.media || []) if (m.src) list.push(m);
  const total = list.length + 1;
  let done = 0;
  const tick = () => onProgress(++done / total);
  await Promise.all(
    list.map((m) => loadImage(m.src).then((img) => { m._img = img; }).catch(() => {}).finally(tick))
  );
  try {
    await Promise.all([
      document.fonts.load('400 64px "Inter Tight"'),
      document.fonts.load('500 64px "Inter Tight"'),
      document.fonts.load("520 80px Newsreader")
    ]);
  } catch { /* posters fall back to a system face */ }
  tick();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawCover(ctx, img, w, h) {
  const ir = img.width / img.height;
  const cr = w / h;
  let dw = w, dh = h, dx = 0, dy = 0;
  if (ir > cr) { dw = h * ir; dx = (w - dw) / 2; }
  else { dh = w / ir; dy = (h - dh) / 2; }
  ctx.drawImage(img, dx, dy, dw, dh);
}

/** Gradient + big word, for media without a photograph. */
function drawPoster(ctx, media, title, w, h) {
  const g = ctx.createLinearGradient(0, 0, w, h);
  const colors = media.colors || ["#1a1a1a", "#3a3a3a"];
  g.addColorStop(0, colors[0]);
  g.addColorStop(1, colors[1] || colors[0]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = media.ink || "#fff";
  ctx.textBaseline = "middle";
  const word = String(media.word || title);
  const base = Math.min(w, h * 1.6);
  if (media.kind === "serif") {
    ctx.font = `520 ${Math.round(base * 0.17)}px Newsreader, serif`;
    ctx.textAlign = "center";
    word.split("\n").forEach((line, i, all) =>
      ctx.fillText(line, w / 2, h * 0.5 + (i - (all.length - 1) / 2) * base * 0.18));
  } else {
    const stack = media.kind === "stack";
    ctx.font = `500 ${Math.round(base * (stack ? 0.085 : 0.095))}px "Inter Tight", sans-serif`;
    ctx.textAlign = "left";
    const lines = word.split("\n");
    const lh = base * (stack ? 0.095 : 0.105);
    const top = h * 0.46 - ((lines.length - 1) * lh) / 2;
    lines.forEach((line, i) => ctx.fillText(line, w * 0.07, top + i * lh));
  }
}

/** Card face: picture, title bottom-left, round arrow bottom-right. */
function paintCard(project, w, withPhoto = true) {
  const h = Math.round(w / CARD_ASPECT);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  roundRect(ctx, 0, 0, w, h, w * 0.022);
  ctx.save();
  ctx.clip();
  const m = project.media[0];
  if (withPhoto) {
    if (m._img) drawCover(ctx, m._img, w, h);
    else drawPoster(ctx, m, project.title, w, h);
  }

  const shade = ctx.createLinearGradient(0, h * 0.55, 0, h);
  shade.addColorStop(0, "rgba(0,0,0,0)");
  shade.addColorStop(1, "rgba(0,0,0,0.42)");
  ctx.fillStyle = shade;
  ctx.fillRect(0, h * 0.55, w, h * 0.45);

  const pad = w * 0.04;
  ctx.fillStyle = "#fff";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.font = `400 ${Math.round(w * 0.043)}px "Inter Tight", sans-serif`;
  if ("letterSpacing" in ctx) ctx.letterSpacing = `${(-0.035 * w * 0.043).toFixed(2)}px`;
  ctx.fillText(project.title, pad, h - pad);

  const r = w * 0.019;
  const cx = w - pad - r * 0.4;
  const cy = h - pad - r * 0.35;
  ctx.fillStyle = "#0b0b0b";
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = r * 0.12;
  ctx.lineCap = "round";
  const a = r * 0.36;
  ctx.beginPath();
  ctx.moveTo(cx - a, cy + a);
  ctx.lineTo(cx + a, cy - a);
  ctx.moveTo(cx - a * 0.35, cy - a);
  ctx.lineTo(cx + a, cy - a);
  ctx.lineTo(cx + a, cy + a * 0.35);
  ctx.stroke();
  ctx.restore();
  return canvas;
}

/** Style 1 face: 16:9 picture, caption band on top, bold title and two lines of summary. */
function paintPanel(project, w) {
  const h = Math.round(w * 9 / 16);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  roundRect(ctx, 0, 0, w, h, w * 0.02);
  ctx.save();
  ctx.clip();
  const m = project.media[0];
  if (m._img) drawCover(ctx, m._img, w, h);
  else drawPoster(ctx, m, project.title, w, h);

  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(0, 0, w, Math.round(h * 0.1));
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = `500 ${Math.round(w * 0.02)}px "Inter Tight", sans-serif`;
  ctx.textBaseline = "middle";
  ctx.fillText(m.caption || project.client || project.title, w * 0.045, h * 0.05);

  const shade = ctx.createLinearGradient(0, h * 0.58, 0, h);
  shade.addColorStop(0, "rgba(0,0,0,0)");
  shade.addColorStop(1, "rgba(0,0,0,0.62)");
  ctx.fillStyle = shade;
  ctx.fillRect(0, h * 0.58, w, h * 0.42);

  const x = w * 0.045;
  ctx.fillStyle = "#fff";
  ctx.textBaseline = "alphabetic";
  ctx.font = `600 ${Math.round(w * 0.052)}px "Inter Tight", sans-serif`;
  ctx.fillText(project.title, x, h - w * 0.1);
  if (project.summary) {
    ctx.globalAlpha = 0.82;
    ctx.font = `400 ${Math.round(w * 0.02)}px "Inter Tight", sans-serif`;
    const lines = [];
    let line = "";
    for (const word of String(project.summary).split(/\s+/)) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > w * 0.62 && line) {
        lines.push(line);
        line = word;
        if (lines.length === 2) break;
      } else line = test;
    }
    if (lines.length < 2 && line) lines.push(line);
    lines.slice(0, 2).forEach((ln, i) => ctx.fillText(ln, x, h - w * 0.055 + i * w * 0.028));
    ctx.globalAlpha = 1;
  }
  ctx.restore();
  return canvas;
}

const posterCache = new Map();

/** Image source for a media item inside a case sheet. */
function mediaURL(project, media) {
  if (media._img) return media.src;
  if (posterCache.has(media)) return posterCache.get(media);
  const w = 1400;
  const h = Math.max(1, Math.round(w * (media.h / media.w)));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  drawPoster(canvas.getContext("2d"), media, project.title, w, h);
  const url = canvas.toDataURL("image/jpeg", 0.88);
  posterCache.set(media, url);
  return url;
}

/** Square-ish source used inside the index lens. */
function lensSource(project) {
  const m = project.media[0];
  if (m._img) return m._img;
  if (m._lens) return m._lens;
  const w = 720;
  const h = Math.round(w * (m.h / m.w));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  drawPoster(canvas.getContext("2d"), m, project.title, w, h);
  m._lens = canvas;
  return canvas;
}

/* ───────────────────────── views ───────────────────────── */

const VIEWS = {
  featured: { title: () => F.name },
  full: { title: () => "Index" },
  traditional: { title: () => "Work" }
};

/** Slide the white pill under the active tab. */
/** Slide each segmented control's white pill under its active option. */
function placePill(animate = true) {
  const groups = [
    [document.querySelector("nav.views"), $(`nav-${ui.view}`)],
    [$("styles"), document.querySelector(`[data-style="${ui.style}"]`)]
  ];
  for (const [nav, a] of groups) {
    if (!nav || !a) continue;
    nav.classList.toggle("no-anim", !animate);
    const pill = nav.querySelector(".pill");
    pill.style.width = `${a.offsetWidth}px`;
    pill.style.transform = `translateX(${a.offsetLeft}px)`;
  }
}

function setStyle(n) {
  if (n === ui.style) return;
  ui.style = n;
  try { localStorage.setItem(STYLE_KEY, String(n)); } catch { /* private mode */ }
  document.querySelectorAll("[data-style]").forEach((b) => b.setAttribute("aria-pressed", String(Number(b.dataset.style) === n)));
  placePill();
  if (stage) stage.setStyle(n);
}

function setNav() {
  for (const v of Object.keys(VIEWS)) {
    const a = $(`nav-${v}`);
    if (v === ui.view) a.setAttribute("aria-current", "true");
    else a.removeAttribute("aria-current");
  }
  placePill();
}

function setView(view) {
  ui.view = view;
  body.classList.toggle("v-featured", view === "featured");
  body.classList.toggle("v-full", view === "full");
  body.classList.toggle("v-traditional", view === "traditional");
  $("grid").inert = view !== "traditional";
  setNav();
  if (stage) stage.setCards(view === "featured");
  if (lens) view === "full" ? lens.start() : lens.stop();
  if (!sheetsOpen()) document.title = VIEWS[view].title();
}

function route() {
  const raw = (location.hash || "").replace(/^#/, "");
  if (raw.startsWith("p/")) {
    const slug = decodeURIComponent(raw.slice(2));
    if (F.projects.some((p) => p.slug === slug)) {
      if (ui.overlay) setOverlay(null);
      openCase(slug);
      return;
    }
    history.replaceState(null, "", "#featured");
  }
  if (sheetsOpen()) closeCase();
  const view = VIEWS[raw] ? raw : "featured";
  ui.lastView = `#${view}`;
  setView(view);
}

/* ───────────────────────── overlays ───────────────────────── */

function setOverlay(which) {
  const prev = ui.overlay;
  if (prev === which) which = null;
  ui.overlay = which;
  for (const kind of ["profile", "news"]) {
    const panel = $(kind);
    const btn = $(kind === "profile" ? "profile-btn" : "news-btn");
    const open = kind === which;
    btn.setAttribute("aria-expanded", String(open));
    btn.textContent = open ? "Close" : kind === "profile" ? "Profile" : "Newsletter";
    if (open) {
      panel.hidden = false;
      requestAnimationFrame(() => requestAnimationFrame(() => panel.classList.add("is-open")));
    } else if (!panel.hidden) {
      panel.classList.remove("is-open");
      setTimeout(() => { if (ui.overlay !== kind) panel.hidden = true; }, 600);
    }
  }
  body.classList.toggle("overlay-open", !!which);
  if (stage) stage.setRing(which);
  if (which === "news") setTimeout(() => { if (ui.overlay === "news" && finePointer) $("news-email").focus({ preventScroll: true }); }, 700);
}

/* ───────────────────────── case sheets ───────────────────────── */

const sheets = { prev: null, cur: null, next: null, farPrev: null, farNext: null };
let caseTimer = 0;

const sheetsOpen = () => !$("case").hidden && $("case").classList.contains("is-open");

function poolFor(project) {
  return project.featured ? featured : F.projects.filter((x) => !x.featured);
}

function neighbours(slug) {
  const p = F.projects.find((x) => x.slug === slug);
  const pool = poolFor(p);
  const i = pool.findIndex((x) => x.slug === slug);
  return {
    project: p,
    prev: pool[(i - 1 + pool.length) % pool.length],
    next: pool[(i + 1) % pool.length]
  };
}

function sheetHTML(p) {
  const chips = [];
  if (p.url) chips.push(`<a class="chip go" href="${esc(p.url)}" target="_blank" rel="noopener" aria-label="Visit ${esc(p.title)}">${ARROW_SVG}</a>`);
  if (p.client && p.client !== p.title) chips.push(`<span class="chip">${esc(p.client)}</span>`);
  if (p.year) chips.push(`<span class="chip">${esc(p.year)}</span>`);
  for (let i = 0; i < (p.awards || 0); i++) chips.push(`<span class="award" title="Award">${AWARD_SVG}</span>`);
  const media = (p.media || [])
    .map((m) => {
      const cap = m.caption ? `<figcaption>${esc(m.caption)}</figcaption>` : "";
      if (m.video) return `<figure><video src="${esc(m.video)}" playsinline loop muted autoplay></video>${cap}</figure>`;
      return `<figure><img alt="${esc(m.caption || p.title)}" src="${mediaURL(p, m)}" loading="lazy"></figure>`;
    })
    .join("");
  return `
    <div class="sheet-scroll">
      <div class="sheet-grid">
        <div class="sheet-copy">
          <h1>${esc(p.title)}</h1>
          <p class="summary">${esc(p.summary || "")}</p>
          <div class="meta">${chips.join("")}</div>
        </div>
        <div class="sheet-media">${media}</div>
      </div>
    </div>
    <svg class="progress" viewBox="0 0 20 20" aria-hidden="true">
      <circle class="track" cx="10" cy="10" r="8.5" pathLength="100"/>
      <circle class="bar" cx="10" cy="10" r="8.5" pathLength="100"/>
    </svg>`;
}

function makeSheet(p, pos) {
  const el = document.createElement("article");
  el.className = `sheet is-${pos}`;
  el.dataset.slug = p.slug;
  el.innerHTML = sheetHTML(p);
  const scroller = el.querySelector(".sheet-scroll");
  const bar = el.querySelector(".bar");
  scroller.addEventListener("scroll", () => {
    const max = scroller.scrollHeight - scroller.clientHeight;
    bar.style.strokeDashoffset = String(100 - (max > 0 ? (scroller.scrollTop / max) * 100 : 0));
  }, { passive: true });
  $("sheets").appendChild(el);
  return el;
}

function markCurrent() {
  for (const el of $("sheets").children) {
    const cur = el === sheets.cur;
    el.setAttribute("aria-hidden", String(!cur));
    const scroller = el.querySelector(".sheet-scroll");
    if (scroller) scroller.inert = !cur;
    const h = el.querySelector("h1");
    if (h) h.id = cur ? "case-title" : "";
  }
}

function buildSheets(slug) {
  $("sheets").innerHTML = "";
  const n = neighbours(slug);
  sheets.cur = makeSheet(n.project, "cur");
  sheets.prev = n.prev.slug !== slug ? makeSheet(n.prev, "prev") : null;
  sheets.next = n.next.slug !== slug && n.next.slug !== n.prev.slug ? makeSheet(n.next, "next") : null;
  markCurrent();
}

function slideTo(slug, dir) {
  const n = neighbours(slug);
  const outgoing = dir > 0 ? sheets.prev : sheets.next;
  if (outgoing) {
    outgoing.className = `sheet is-far-${dir > 0 ? "prev" : "next"}`;
    setTimeout(() => outgoing.remove(), 1000);
  }
  const leaving = sheets.cur;
  if (dir > 0) {
    sheets.prev = leaving;
    sheets.cur = sheets.next;
    leaving.className = "sheet is-prev";
    sheets.cur.className = "sheet is-cur";
    const incoming = n.next.slug !== slug && n.next.slug !== n.prev.slug ? n.next : null;
    sheets.next = incoming ? makeSheet(incoming, "far-next") : null;
    if (sheets.next) requestAnimationFrame(() => requestAnimationFrame(() => { sheets.next.className = "sheet is-next"; }));
  } else {
    sheets.next = leaving;
    sheets.cur = sheets.prev;
    leaving.className = "sheet is-next";
    sheets.cur.className = "sheet is-cur";
    const incoming = n.prev.slug !== slug && n.prev.slug !== n.next.slug ? n.prev : null;
    sheets.prev = incoming ? makeSheet(incoming, "far-prev") : null;
    if (sheets.prev) requestAnimationFrame(() => requestAnimationFrame(() => { sheets.prev.className = "sheet is-prev"; }));
  }
  markCurrent();
}

function openCase(slug) {
  const p = F.projects.find((x) => x.slug === slug);
  const box = $("case");
  clearTimeout(caseTimer);
  document.title = p.title;
  if (sheetsOpen() && sheets.cur) {
    if (sheets.cur.dataset.slug === slug) return;
    if (sheets.next && sheets.next.dataset.slug === slug) return slideTo(slug, 1);
    if (sheets.prev && sheets.prev.dataset.slug === slug) return slideTo(slug, -1);
  }
  buildSheets(slug);
  box.hidden = false;
  body.classList.add("case-open");
  if (stage) stage.pause(true);
  if (lens) lens.stop();
  requestAnimationFrame(() => requestAnimationFrame(() => box.classList.add("is-open")));
  setTimeout(() => $("case-x").focus({ preventScroll: true }), 50);
}

function closeCase() {
  const box = $("case");
  box.classList.remove("is-open");
  body.classList.remove("case-open");
  if (stage) stage.pause(false);
  if (lens && ui.view === "full") lens.start();
  clearTimeout(caseTimer);
  caseTimer = setTimeout(() => {
    if (!box.classList.contains("is-open")) { box.hidden = true; $("sheets").innerHTML = ""; }
  }, 950);
}

function stepCase(dir) {
  const slug = sheets.cur && sheets.cur.dataset.slug;
  if (!slug) return;
  const n = neighbours(slug);
  const to = dir > 0 ? n.next : n.prev;
  if (to.slug !== slug) location.hash = `#p/${to.slug}`;
}

/* ───────────────────────── chrome bindings ───────────────────────── */

function bindChrome() {
  document.querySelectorAll("[data-style]").forEach((b) => {
    b.setAttribute("aria-pressed", String(Number(b.dataset.style) === ui.style));
    b.onclick = () => setStyle(Number(b.dataset.style));
  });
  $("profile-btn").onclick = () => setOverlay("profile");
  $("news-btn").onclick = () => setOverlay("news");
  $("case-x").onclick = () => { location.hash = ui.lastView; };
  $("sheets").addEventListener("click", (e) => {
    const sheet = e.target.closest(".sheet");
    if (!sheet || sheet === sheets.cur) return;
    location.hash = `#p/${sheet.dataset.slug}`;
  });
  $("case").querySelector(".case-backdrop").onclick = () => { location.hash = ui.lastView; };
  $("news-form").onsubmit = (e) => {
    e.preventDefault();
    const email = $("news-email").value.trim();
    if (!email) return;
    try { localStorage.setItem("folio-news", email); } catch { /* private mode */ }
    $("news-note").textContent = "Saved in this browser";
    $("news-form").reset();
  };
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (sheetsOpen()) { location.hash = ui.lastView; return; }
      if (ui.overlay) setOverlay(null);
      return;
    }
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    if (e.target.matches("input, textarea")) return;
    const dir = e.key === "ArrowRight" ? 1 : -1;
    if (sheetsOpen()) { stepCase(dir); return; }
    if (stage && ui.view === "featured" && !ui.overlay) stage.step(dir);
  });
  addEventListener("hashchange", route);
}

/* ───────────────────────── loader + intro ───────────────────────── */

function loaderProgress(t) {
  const dashes = $("loader").children;
  for (let i = 0; i < dashes.length; i++) dashes[i].classList.toggle("on", t >= (i + 1) / dashes.length - 0.001);
}

async function hideLoader() {
  loaderProgress(1);
  await sleep(250);
  $("loader").classList.add("done");
  await sleep(350);
}

async function introTitles(spots) {
  const box = $("intro");
  box.innerHTML = spots.map((s) => `<span style="left:${s.x}px;top:${s.y}px">${esc(s.title)}</span>`).join("");
  const spans = [...box.children];
  await sleep(30);
  spans.forEach((el, i) => setTimeout(() => el.classList.add("on"), i * 70));
  await sleep(650 + spans.length * 70);
  spans.forEach((el) => el.classList.add("off"));
  setTimeout(() => { box.innerHTML = ""; }, 500);
}

/* ───────────────────────── flat fallback ───────────────────────── */

function mountFlat() {
  body.classList.add("is-flat");
  const flat = $("flat");
  flat.hidden = false;
  flat.innerHTML = featured
    .map((p) => {
      const m = p.media[0];
      return `<button class="fcard" type="button" data-slug="${esc(p.slug)}" aria-label="${esc(p.title)}">
        <img src="${mediaURL(p, m)}" alt="">
        <span class="t">${esc(p.title)}</span>
        <span class="go">${ARROW_SVG}</span>
      </button>`;
    })
    .join("");
  flat.onclick = (e) => {
    const btn = e.target.closest("[data-slug]");
    if (btn) location.hash = `#p/${btn.dataset.slug}`;
  };
}

/* ───────────────────────── index lens (raw WebGL) ───────────────────────── */

function mountLens() {
  const cv = $("lens");
  const gl = cv.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false });
  if (!gl) return null;

  const vs = `
    attribute vec2 aPos;
    varying vec2 vUv;
    void main() {
      vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5);
      gl_Position = vec4(aPos, 0.0, 1.0);
    }`;
  const fs = `
    precision highp float;
    uniform sampler2D uText;
    uniform sampler2D uImg;
    uniform vec2 uRes;
    uniform vec2 uMouse;
    uniform vec2 uVel;
    uniform float uRadius;
    uniform float uTime;
    uniform float uAspect;
    uniform float uHasImg;
    varying vec2 vUv;

    float textAt(vec2 p) { return texture2D(uText, p / uRes).a; }

    void main() {
      vec2 p = vUv * uRes;
      vec2 d = p - uMouse;

      // stretch the blob along the pointer's motion
      float vl = length(uVel);
      vec2 vd = vl > 0.001 ? uVel / vl : vec2(1.0, 0.0);
      float stretch = clamp(vl * 0.035, 0.0, 0.55);
      vec2 dd = d - vd * dot(d, vd) * (stretch / (1.0 + stretch));

      // squircle (superellipse, n = 4): round, but close to a rounded rectangle
      float ang = atan(dd.y, dd.x);
      float wob = 1.0 + 0.025 * sin(ang * 3.0 + uTime * 1.9) + 0.015 * sin(ang * 5.0 - uTime * 2.6);
      vec2 hs = max(vec2(uRadius * 1.1, uRadius * 0.78) * wob, vec2(0.0001));
      vec2 nq = dd / hs;
      vec2 n4 = nq * nq;
      n4 *= n4;
      float dist = sqrt(sqrt(n4.x + n4.y));
      float on = step(0.5, uRadius);

      // text around the lens is pulled in and magnified, with a chromatic split
      float zone = on * smoothstep(1.6, 0.95, dist);
      vec2 tp = uMouse + d * (1.0 - 0.3 * zone);
      vec2 dir = normalize(d + 0.0001);
      float ca = 0.018 * uRadius * zone;
      float tr = textAt(tp + dir * ca);
      float tg = textAt(tp);
      float tb = textAt(tp - dir * ca);
      vec3 col = vec3(tr, tg, tb);
      float a = max(tr, max(tg, tb));

      // inside: the project picture on a dome
      float inside = on * uHasImg * (1.0 - smoothstep(0.97, 1.0, dist));
      if (inside > 0.0) {
        // light dome: the picture bulges a little but stays readable
        float z = sqrt(max(0.0, 1.0 - dist * dist));
        vec2 uv = nq * (0.86 + 0.14 * z) * 0.5 + 0.5;
        // cover-fit the picture into the lens box
        float box = hs.x / hs.y;
        if (uAspect > box) uv.x = (uv.x - 0.5) * box / uAspect + 0.5;
        else uv.y = (uv.y - 0.5) * uAspect / box + 0.5;
        vec3 img = texture2D(uImg, uv).rgb;
        float rim = smoothstep(0.86, 1.0, dist);
        vec3 ic = img * (0.88 + 0.12 * z) + rim * 0.18;
        col = mix(col, ic, inside);
        a = max(a, inside);
      }
      gl_FragColor = vec4(min(col, vec3(a)), a);
    }`;

  const compile = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  };
  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, vs));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "aPos");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const U = {};
  for (const n of ["uText", "uImg", "uRes", "uMouse", "uVel", "uRadius", "uTime", "uAspect", "uHasImg"]) U[n] = gl.getUniformLocation(prog, n);

  const makeTex = (unit) => {
    const t = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
    return t;
  };
  const texText = makeTex(0);
  const texImg = makeTex(1);
  gl.uniform1i(U.uText, 0);
  gl.uniform1i(U.uImg, 1);

  const textCanvas = document.createElement("canvas");
  const list = $("index-list");
  let dpr = 1;
  let running = false;
  let raf = 0;
  let hovered = null;
  let shownImg = null;
  const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999, vx: 0, vy: 0 };
  let radius = 0;

  function drawText() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    const w = Math.round(innerWidth * dpr);
    const h = Math.round(innerHeight * dpr);
    cv.width = w;
    cv.height = h;
    textCanvas.width = w;
    textCanvas.height = h;
    const ctx = textCanvas.getContext("2d");
    ctx.clearRect(0, 0, w, h);
    const style = getComputedStyle(list);
    const size = parseFloat(style.fontSize) * dpr;
    ctx.font = `${style.fontWeight} ${size}px ${style.fontFamily}`;
    if ("letterSpacing" in ctx) ctx.letterSpacing = `${parseFloat(style.letterSpacing || 0) * dpr}px`;
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#fff";
    const asc = ctx.measureText("Hg").fontBoundingBoxAscent || size * 0.9;
    for (const el of list.children) {
      const rect = el.getBoundingClientRect();
      ctx.fillText(el.textContent, rect.left * dpr, rect.top * dpr + asc);
    }
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texText);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textCanvas);
    gl.viewport(0, 0, w, h);
    gl.uniform2f(U.uRes, w, h);
  }

  function setImage(project) {
    if (!project) return;
    const src = lensSource(project);
    if (src === shownImg) return;
    shownImg = src;
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texImg);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
    gl.uniform1f(U.uAspect, (src.naturalWidth || src.width) / (src.naturalHeight || src.height));
    gl.uniform1f(U.uHasImg, 1);
  }

  list.addEventListener("pointermove", (e) => {
    mouse.tx = e.clientX * dpr;
    mouse.ty = e.clientY * dpr;
    if (mouse.x < -999) { mouse.x = mouse.tx; mouse.y = mouse.ty; }
  });
  list.addEventListener("pointerover", (e) => {
    const a = e.target.closest("a[data-slug]");
    if (!a) return;
    hovered = F.projects.find((p) => p.slug === a.dataset.slug);
    setImage(hovered);
  });
  list.addEventListener("pointerout", (e) => {
    const a = e.target.closest("a[data-slug]");
    if (a && !a.contains(e.relatedTarget)) hovered = null;
  });

  const t0 = performance.now();
  function frame() {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    const nx = lerp(mouse.x, mouse.tx, 0.2);
    const ny = lerp(mouse.y, mouse.ty, 0.2);
    mouse.vx = lerp(mouse.vx, nx - mouse.x, 0.25);
    mouse.vy = lerp(mouse.vy, ny - mouse.y, 0.25);
    mouse.x = nx;
    mouse.y = ny;
    const goal = hovered ? Math.max(144, innerWidth * 0.18) * dpr : 0;
    radius = lerp(radius, goal, hovered ? 0.12 : 0.18);
    if (radius < 0.4) radius = 0;
    gl.uniform2f(U.uMouse, mouse.x, mouse.y);
    gl.uniform2f(U.uVel, mouse.vx, mouse.vy);
    gl.uniform1f(U.uRadius, radius);
    gl.uniform1f(U.uTime, (performance.now() - t0) / 1000);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  let resizeT = 0;
  addEventListener("resize", () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => { if (running) drawText(); }, 80);
  });

  body.classList.add("has-lens");
  return {
    start() {
      if (running) return;
      running = true;
      // wait a frame so the index is laid out before measuring it
      requestAnimationFrame(() => { drawText(); frame(); });
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf);
      hovered = null;
      radius = 0;
    }
  };
}

/* ───────────────────────── WebGL stage ───────────────────────── */

async function mountStage(mediaReady) {
  const [THREE, { RoomEnvironment }] = await Promise.all([
    import("three"),
    import("three/addons/environments/RoomEnvironment.js")
  ]);
  await mediaReady;   // card faces need the photographs

  const canvas = $("stage");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x000000, 9.5, 21);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.03).texture;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0.42, 8.2);
  camera.lookAt(0, 0.06, 0);

  /* floor grid */
  const floorMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uAlpha: { value: 0 } },
    vertexShader: `
      varying vec3 vP;
      void main() {
        vP = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `
      uniform float uAlpha;
      varying vec3 vP;
      void main() {
        vec2 c = vP.xy * 1.6;
        vec2 g = abs(fract(c - 0.5) - 0.5) / fwidth(c);
        float line = 1.0 - min(min(g.x, g.y), 1.0);
        float fadeFar = smoothstep(26.0, 2.0, vP.y + 6.0);
        float fadeSide = 1.0 - smoothstep(7.0, 20.0, abs(vP.x));
        gl_FragColor = vec4(vec3(0.62), line * fadeFar * fadeSide * 0.36 * uAlpha);
      }`
  });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 60), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, -1.62, -6);
  scene.add(floor);

  /* ───── card decks: three looks for the featured row ─────
   * Scroll state is in card units (1 = one project), so switching style keeps
   * the same project in front. Each deck builds its own meshes and lays them
   * out every frame; the camera eases to that deck's framing.
   */
  let target = 0;
  let current = 0;
  let prevCurrent = 0;
  let cardsAlpha = 0;
  let cardsGoal = 1;
  let hoverSlug = null;
  let hoverUV = null;
  let lastInput = 0;
  let lastDir = 0;
  let introStart = Infinity;
  let paused = false;
  const t0 = performance.now();
  const N = featured.length;

  const CAMERAS = {
    1: { pos: [0, 0.22, 6.3], look: [0, 0.02, -0.2] },
    2: { pos: [0, 0.42, 8.2], look: [0, 0.06, 0] },
    3: { pos: [0, 0.36, 8.0], look: [0, 0.04, 0] }
  };
  const camPos = new THREE.Vector3(...CAMERAS[ui.style].pos);
  const camLook = new THREE.Vector3(...CAMERAS[ui.style].look);
  camera.position.copy(camPos);
  camera.lookAt(camLook);

  const introAt = (time, distance) => easeOutExpo(clamp((time - introStart - Math.min(distance, 4) * 0.09) / 1.5, 0, 1));

  function photoTexture(project) {
    const m = project.media[0];
    let tex;
    if (m._img) tex = new THREE.Texture(m._img);
    else {
      const c = document.createElement("canvas");
      c.width = 1200;
      c.height = Math.round(1200 * (m.h / m.w));
      drawPoster(c.getContext("2d"), m, project.title, c.width, c.height);
      tex = new THREE.Texture(c);
    }
    tex.needsUpdate = true;
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return tex;
  }

  /* style 1 — wide panels on an arc, caption band, bold title, arrows */
  function makeArc() {
    const H = 2.2;
    const W = H * (16 / 9);
    const GAP = 0.2;
    const R = 7.8;
    const step = (W + GAP) / R;
    const meshes = featured.map((project, i) => {
      const tex = new THREE.CanvasTexture(paintPanel(project, 1600));
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      const geo = new THREE.PlaneGeometry(W, H, 28, 10);
      const pos = geo.attributes.position;
      for (let v = 0; v < pos.count; v++) {
        const nx = pos.getX(v) / (W * 0.5);
        pos.setZ(v, -nx * nx * W * 0.2);
      }
      geo.computeVertexNormals();
      const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.02, depthWrite: false, toneMapped: false, opacity: 0 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.userData = { slug: project.slug, title: project.title, index: i, lift: 0 };
      scene.add(mesh);
      return mesh;
    });
    return {
      bounded: true,
      meshes,
      layout(time) {
        for (const mesh of meshes) {
          const u = mesh.userData;
          const a = (u.index - current) * step;
          const hovered = hoverSlug === u.slug;
          u.lift = lerp(u.lift, hovered ? 1 : 0, 0.16);
          const k = 1 - introAt(time, Math.abs(u.index - current));
          mesh.position.set(Math.sin(a) * R, 0.08 + u.lift * 0.14 - k * 2.4, -(1 - Math.cos(a)) * R + u.lift * 0.42 - k * 3);
          mesh.rotation.y = -a * (1 - u.lift * 0.4);
          mesh.scale.setScalar(1 + u.lift * 0.07);
          const dim = hoverSlug ? (hovered ? 1 : 0.5) : 1;
          mesh.material.color.setScalar(lerp(mesh.material.color.r, dim, 0.14));
          mesh.material.opacity = cardsAlpha * (1 - k);
          mesh.visible = mesh.material.opacity > 0.003 && Math.abs(a) < 1.6;
        }
      },
      /** Screen points beside the front card, for the prev / next buttons. */
      arrowPoints() {
        const i = Math.round(current);
        const mesh = meshes[i];
        if (!mesh) return null;
        mesh.updateMatrixWorld();
        const l = mesh.localToWorld(new THREE.Vector3(-W / 2, 0, -W * 0.2 + 0.02)).project(camera);
        const r = mesh.localToWorld(new THREE.Vector3(W / 2, 0, -W * 0.2 + 0.02)).project(camera);
        const toPx = (v) => ({ x: (v.x * 0.5 + 0.5) * innerWidth, y: (-v.y * 0.5 + 0.5) * innerHeight });
        return { prev: i > 0 ? toPx(l) : null, next: i < N - 1 ? toPx(r) : null };
      },
      spots: () => [],
      dispose() {
        for (const m of meshes) { scene.remove(m); m.geometry.dispose(); m.material.map.dispose(); m.material.dispose(); }
      }
    };
  }

  /* style 2 — the wavy ribbon; style 3 — deeper wave, flush cards, living pictures */
  function makeRibbon(alive) {
    const H = alive ? 2.2 : 2.12;
    const W = H * CARD_ASPECT;
    const GAP = alive ? 0.014 : 0.045;
    const P = W + GAP;
    const SX = alive ? 40 : 56;
    const SY = alive ? 10 : 1;
    const copies = Math.max(1, Math.ceil(26 / (N * P)));
    const L = N * copies * P;
    let amp = alive ? 0.5 : 0.2;

    const faces = featured.map((p) => {
      const tex = new THREE.CanvasTexture(paintCard(p, 1500, !alive));
      tex.colorSpace = alive ? THREE.NoColorSpace : THREE.SRGBColorSpace;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      return tex;
    });
    const photos = alive ? featured.map(photoTexture) : [];

    const VERT = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`;
    const FRAG = `
      uniform sampler2D uPhoto;
      uniform sampler2D uFace;
      uniform float uTime;
      uniform float uHover;
      uniform float uAlpha;
      uniform float uDim;
      uniform float uSeed;
      uniform float uImgAspect;
      uniform float uCardAspect;
      uniform vec2 uMouse;
      varying vec2 vUv;

      float roundBox(vec2 p, vec2 b, float r) {
        vec2 q = abs(p) - b + r;
        return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
      }

      void main() {
        vec2 p = (vUv - 0.5) * vec2(uCardAspect, 1.0);
        float edge = roundBox(p, vec2(uCardAspect * 0.5, 0.5), 0.045);
        float mask = 1.0 - smoothstep(-0.003, 0.003, edge);
        if (mask <= 0.0) discard;

        // cover-fit the photo, then let it drift and breathe like a loop
        vec2 uv = vUv - 0.5;
        if (uImgAspect > uCardAspect) uv.x *= uCardAspect / uImgAspect;
        else uv.y *= uImgAspect / uCardAspect;
        float zoom = 1.14 + 0.05 * sin(uTime * 0.23 + uSeed) + 0.08 * uHover;
        uv /= zoom;
        uv += 0.035 * vec2(sin(uTime * 0.17 + uSeed * 1.3), cos(uTime * 0.13 + uSeed)) * (1.0 - 0.6 * uHover);

        // hover: a soft ripple spreading from the pointer
        vec2 m = (vUv - uMouse) * vec2(uCardAspect, 1.0);
        float r = length(m);
        uv += uHover * 0.012 * normalize(m + 1e-4) * sin(r * 26.0 - uTime * 5.0) * exp(-r * 2.6);

        vec3 col = texture2D(uPhoto, uv + 0.5).rgb;
        vec4 face = texture2D(uFace, vUv);
        col = mix(col, face.rgb, face.a);
        gl_FragColor = vec4(col * uDim, mask * uAlpha);
      }`;

    const meshes = [];
    for (let c = 0; c < copies; c++) {
      featured.forEach((project, i) => {
        const geo = new THREE.PlaneGeometry(W, H, SX, SY);
        const base = Float32Array.from(geo.attributes.position.array);
        let mat;
        if (alive) {
          const img = photos[i].image;
          mat = new THREE.ShaderMaterial({
            vertexShader: VERT,
            fragmentShader: FRAG,
            transparent: true,
            depthWrite: false,
            side: THREE.DoubleSide,
            uniforms: {
              uPhoto: { value: photos[i] },
              uFace: { value: faces[i] },
              uTime: { value: 0 },
              uHover: { value: 0 },
              uAlpha: { value: 0 },
              uDim: { value: 1 },
              uSeed: { value: i * 1.7 + c * 0.6 },
              uImgAspect: { value: (img.naturalWidth || img.width) / (img.naturalHeight || img.height) },
              uCardAspect: { value: CARD_ASPECT },
              uMouse: { value: new THREE.Vector2(0.5, 0.5) }
            }
          });
        } else {
          mat = new THREE.MeshBasicMaterial({ map: faces[i], transparent: true, depthWrite: false, toneMapped: false, side: THREE.DoubleSide, opacity: 0 });
        }
        const mesh = new THREE.Mesh(geo, mat);
        mesh.frustumCulled = false;
        mesh.userData = { slug: project.slug, title: project.title, slot: c * N + i, base, lift: 0, dim: 1, mouse: new THREE.Vector2(0.5, 0.5) };
        scene.add(mesh);
        meshes.push(mesh);
      });
    }

    const wrap = (x) => ((((x + L / 2) % L) + L) % L) - L / 2;
    const ribbonZ = alive
      ? (x, phase) => -0.04 * x * x + amp * Math.sin(0.86 * x + phase)
      : (x, phase) => -0.052 * x * x + amp * Math.sin(0.62 * x + phase);
    const ribbonY = alive ? (x, phase) => 0.11 * Math.sin(0.5 * x + phase * 1.3) : () => 0;

    return {
      bounded: false,
      meshes,
      layout(time) {
        const vel = (current - prevCurrent) * P;
        amp = alive
          ? lerp(amp, 0.5 + Math.min(0.6, Math.abs(vel) * 2.6), 0.06)
          : lerp(amp, 0.34 + Math.min(0.55, Math.abs(vel) * 2.4), 0.06);
        const phase = time * 0.32 + current * P * 0.22;
        for (const mesh of meshes) {
          const u = mesh.userData;
          const X = wrap((u.slot - current) * P);
          const hovered = hoverSlug && u.slug === hoverSlug && Math.abs(X) < 8;
          u.lift = lerp(u.lift, hovered ? 1 : 0, 0.12);
          if (hovered && hoverUV) u.mouse.lerp(hoverUV, 0.2);
          const k = 1 - introAt(time, Math.abs(X) / P);

          const arr = mesh.geometry.attributes.position.array;
          const b = u.base;
          for (let i = 0; i < arr.length; i += 3) {
            const lx = b[i];
            const ly = b[i + 1];
            const wx = X + lx;
            let z = ribbonZ(wx, phase) - k * 3.2 + u.lift * (alive ? 0.22 : 0.32);
            if (alive && u.lift > 0.001) {
              // bulge toward the viewer around the pointer
              const du = (lx / W + 0.5 - u.mouse.x) * CARD_ASPECT;
              const dv = ly / H + 0.5 - u.mouse.y;
              z += u.lift * 0.3 * Math.exp(-(du * du + dv * dv) * 5);
            }
            arr[i] = wx;
            arr[i + 1] = ly + 0.04 + ribbonY(wx, phase) - k * 2.4 + u.lift * 0.06;
            arr[i + 2] = z;
          }
          mesh.geometry.attributes.position.needsUpdate = true;

          u.dim = lerp(u.dim, hoverSlug && !hovered ? 0.72 : 1, 0.12);
          const alpha = cardsAlpha * (1 - k);
          if (alive) {
            const un = mesh.material.uniforms;
            un.uTime.value = time;
            un.uHover.value = u.lift;
            un.uAlpha.value = alpha;
            un.uDim.value = u.dim;
            un.uMouse.value.copy(u.mouse);
          } else {
            mesh.material.color.setScalar(u.dim);
            mesh.material.opacity = alpha;
          }
          mesh.visible = alpha > 0.003 && Math.abs(X) < L / 2 - P * 0.5;
        }
      },
      arrowPoints: () => null,
      /** Where each on-screen card's title will land once the intro finishes. */
      spots() {
        const out = [];
        const v = new THREE.Vector3();
        for (const mesh of meshes) {
          const X = wrap((mesh.userData.slot - current) * P);
          if (Math.abs(X) > 7) continue;
          const lx = X - W / 2 + W * 0.04;
          v.set(lx, -H / 2 + 0.04 + ribbonY(lx, 0) + H * 0.055, ribbonZ(lx, 0)).project(camera);
          const x = (v.x * 0.5 + 0.5) * innerWidth;
          const y = (-v.y * 0.5 + 0.5) * innerHeight;
          if (x < -40 || x > innerWidth - 20) continue;
          out.push({ title: mesh.userData.title, x: Math.max(8, x), y: y - 18 });
        }
        return out.sort((a, b) => a.x - b.x);
      },
      dispose() {
        for (const m of meshes) { scene.remove(m); m.geometry.dispose(); m.material.dispose(); }
        faces.forEach((t) => t.dispose());
        photos.forEach((t) => t.dispose());
      }
    };
  }

  const makeDeck = (s) => (s === 1 ? makeArc() : makeRibbon(s === 3));
  let deck = makeDeck(ui.style);
  if (deck.bounded) target = current = prevCurrent = Math.min(1, N - 1);
  let swapTimer = 0;

  function switchDeck(s) {
    clearTimeout(swapTimer);
    cardsGoal = 0;                     // fade the old cards out …
    swapTimer = setTimeout(() => {     // … then build the new ones and let them rise
      deck.dispose();
      deck = makeDeck(s);
      const front = ((Math.round(current) % N) + N) % N;
      target = current = prevCurrent = front;
      hoverSlug = null;
      cardsAlpha = 0;
      cardsGoal = ui.view === "featured" ? 1 : 0;
      introStart = (performance.now() - t0) / 1000;
    }, 380);
    camPos.set(...CAMERAS[s].pos);
    camLook.set(...CAMERAS[s].look);
  }

  // the floor grid stays up while switching styles; it only fades for Full / Traditional
  let floorAlpha = 0;
  let firstIntro = Infinity;
  function layout(time) {
    deck.layout(time);
    prevCurrent = current;
    const on = ui.view === "featured" && time > firstIntro - 0.2;
    floorAlpha = lerp(floorAlpha, on ? 1 : 0, 0.06);
    floorMat.uniforms.uAlpha.value = floorAlpha;
  }

  const arrowsBox = $("arrows");
  function placeArrows() {
    const pts = !paused && ui.view === "featured" && !ui.overlay && cardsAlpha > 0.5 ? deck.arrowPoints() : null;
    arrowsBox.hidden = !pts;
    if (!pts) return;
    for (const [id, pt] of [["prev", pts.prev], ["next", pts.next]]) {
      const el = $(id);
      el.style.visibility = pt ? "visible" : "hidden";
      if (pt) { el.style.left = `${pt.x}px`; el.style.top = `${pt.y}px`; }
    }
  }
  $("prev").onclick = () => api.step(-1);
  $("next").onclick = () => api.step(1);

  /* profile / newsletter ring */
  const ring = new THREE.Group();
  const pivot = new THREE.Group();
  ring.add(pivot);
  ring.visible = false;
  scene.add(ring);

  const thinRing = new THREE.TorusGeometry(1, 0.075, 96, 260);   // profile: chrome
  const fatRing = new THREE.TorusGeometry(1, 0.16, 96, 260);    // newsletter: soft pink
  const chrome = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 1,
    roughness: 0.06,
    iridescence: 1,
    iridescenceIOR: 1.9,
    iridescenceThicknessRange: [180, 820],
    envMapIntensity: 1.25,
    fog: false
  });
  const blush = new THREE.MeshPhysicalMaterial({
    color: 0xc4808d,
    metalness: 0,
    roughness: 0.45,
    clearcoat: 0.5,
    clearcoatRoughness: 0.35,
    sheen: 1,
    sheenColor: new THREE.Color(0xf2b8c4),
    sheenRoughness: 0.5,
    envMapIntensity: 0.55,
    fog: false
  });
  const torus = new THREE.Mesh(thinRing, chrome);
  pivot.add(torus);
  const disc = new THREE.Mesh(
    new THREE.CircleGeometry(0.99, 160),
    new THREE.MeshBasicMaterial({ color: 0x000000, fog: false, toneMapped: false })
  );
  disc.position.z = -0.01;
  pivot.add(disc);

  // small glossy shapes drifting through the ring
  const glossy = new THREE.MeshPhysicalMaterial({
    color: 0x0c0c0c,
    metalness: 0.15,
    roughness: 0.16,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    envMapIntensity: 1.4,
    fog: false
  });
  const shapes = [
    new THREE.SphereGeometry(1, 48, 32),
    new THREE.CapsuleGeometry(0.55, 0.9, 12, 32),
    new THREE.TorusGeometry(0.75, 0.32, 32, 64),
    new THREE.IcosahedronGeometry(1, 2)
  ];
  const floaters = [];
  const spots = [
    [-0.22, 0.78, 0.25], [0.55, 0.58, -0.2], [-0.6, 0.2, 0.15], [0.62, -0.32, 0.3],
    [-0.35, -0.6, -0.15], [0.12, -0.82, 0.2], [0.28, 0.12, 0.45]
  ];
  spots.forEach(([x, y, z], i) => {
    const m = new THREE.Mesh(shapes[i % shapes.length], glossy);
    const s = 0.055 + (i % 3) * 0.018;
    m.scale.set(s, s * (i % 2 ? 1.2 : 0.85), s);
    m.userData = { x, y, z, sp: 0.4 + i * 0.07, ph: i * 1.7, rx: 0.3 + (i % 4) * 0.15, ry: 0.5 - (i % 3) * 0.12 };
    pivot.add(m);
    floaters.push(m);
  });

  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(2.5, 3, 4);
  scene.add(key);

  const RING_Z = 2.6;
  let ringKind = null;
  let ringFrom = 0;
  let ringTo = 0;
  let ringT0 = 0;
  let ringP = 0;
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };

  function sizeRing() {
    const dist = camera.position.distanceTo(new THREE.Vector3(0, 0, RING_Z));
    const visH = 2 * dist * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const visW = visH * camera.aspect;
    const outer = Math.min(visH * 0.5, visW * 0.44);
    ring.userData.scale = outer / 1.16;
  }

  function animateRing(time) {
    const dur = ringTo ? 1.25 : 0.65;
    const t = clamp((time - ringT0) / dur, 0, 1);
    const e = ringTo ? easeOutExpo(t) : 1 - easeInCubic(t);
    ringP = ringTo ? lerp(ringFrom, 1, e) : ringFrom * e;
    ring.visible = ringP > 0.002;
    if (!ring.visible) return;
    ring.position.set(0, 0.06, RING_Z);
    ring.quaternion.copy(camera.quaternion);
    const s = ring.userData.scale * (0.35 + 0.65 * ringP);
    ring.scale.setScalar(s);
    pointer.sx = lerp(pointer.sx, pointer.x, 0.05);
    pointer.sy = lerp(pointer.sy, pointer.y, 0.05);
    pivot.rotation.x = (1 - ringP) * 1.45 - pointer.sy * 0.12;
    pivot.rotation.y = (1 - ringP) * -0.5 + pointer.sx * 0.14;
    torus.rotation.z = time * 0.12;
    disc.scale.setScalar(Math.max(0.001, ringP));
    for (const m of floaters) {
      const u = m.userData;
      const f = Math.min(1, ringP * 1.3);
      m.position.set(
        u.x * f + Math.sin(time * u.sp + u.ph) * 0.05,
        u.y * f + Math.cos(time * u.sp * 0.8 + u.ph) * 0.06,
        u.z + Math.sin(time * 0.5 + u.ph) * 0.05
      );
      m.rotation.x = time * u.rx + u.ph;
      m.rotation.y = time * u.ry;
      m.visible = ringP > 0.3;
    }
  }

  /* resize */
  function resize() {
    const w = canvas.clientWidth || innerWidth;
    const h = canvas.clientHeight || innerHeight;
    camera.aspect = w / Math.max(1, h);
    // keep the card height steady; widen the lens on tall screens
    camera.fov = camera.aspect < 1.2 ? 40 : 30;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    sizeRing();
  }

  /* input */
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let dragging = false;
  let moved = 0;
  let lastX = 0;
  let dragVel = 0;

  const pick = (e) => {
    const rect = canvas.getBoundingClientRect();
    ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(ndc, camera);
    const live = deck.meshes.filter((m) => m.visible);
    for (const m of live) m.geometry.computeBoundingSphere();
    const hit = raycaster.intersectObjects(live)[0];
    hoverUV = hit && hit.uv ? hit.uv.clone() : null;
    return hit ? hit.object.userData.slug : null;
  };

  addEventListener("pointermove", (e) => {
    pointer.x = (e.clientX / innerWidth) * 2 - 1;
    pointer.y = (e.clientY / innerHeight) * 2 - 1;
  });

  canvas.addEventListener("pointerdown", (e) => {
    dragging = true;
    moved = 0;
    lastX = e.clientX;
    dragVel = 0;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (dragging) {
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      moved += Math.abs(dx);
      if (moved > 6) canvas.classList.add("dragging");
      const units = (dx / innerWidth) * 2.5;   // one screen width ≈ 2.5 cards
      target -= units;
      lastDir = -Math.sign(dx) || lastDir;
      dragVel = lerp(dragVel, units, 0.5);
      lastInput = performance.now();
      hoverSlug = null;
      return;
    }
    hoverSlug = pick(e);
    canvas.style.cursor = hoverSlug ? "pointer" : "";
  });
  const endDrag = (e) => {
    if (!dragging) return;
    dragging = false;
    canvas.classList.remove("dragging");
    if (moved > 8) {
      target -= dragVel * 10;
      lastInput = performance.now();
      return;
    }
    const slug = pick(e);
    if (slug) location.hash = `#p/${slug}`;
  };
  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", () => { dragging = false; canvas.classList.remove("dragging"); });
  canvas.addEventListener("pointerleave", () => { if (!dragging) hoverSlug = null; });

  addEventListener("wheel", (e) => {
    if (ui.view !== "featured" || ui.overlay || sheetsOpen()) return;
    e.preventDefault();
    let d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (e.deltaMode === 1) d *= 40;
    else if (e.deltaMode === 2) d *= innerHeight;
    target += d * 0.0017;
    lastDir = Math.sign(d) || lastDir;
    lastInput = performance.now();
  }, { passive: false });

  addEventListener("resize", resize);
  resize();

  /* loop */
  const camLookNow = camLook.clone();
  renderer.setAnimationLoop(() => {
    if (paused) return;
    const now = performance.now();
    const time = (now - t0) / 1000;
    if (now - lastInput > 140 && !dragging) {
      // settle on a card, leaning toward the way the user was scrolling
      const k = target;
      target = lastDir > 0 ? Math.ceil(k - 0.04) : lastDir < 0 ? Math.floor(k + 0.04) : Math.round(k);
      lastDir = 0;
    }
    if (deck.bounded) target = clamp(target, 0, N - 1);
    current = lerp(current, target, 0.14);
    camera.position.lerp(camPos, 0.06);
    camLookNow.lerp(camLook, 0.06);
    camera.lookAt(camLookNow);
    cardsAlpha = lerp(cardsAlpha, cardsGoal, 0.09);
    layout(time);
    animateRing(time);
    placeArrows();
    renderer.render(scene, camera);
  });

  const api = {
    step(dir) {
      target = Math.round(target) + dir;
      if (deck.bounded) target = clamp(target, 0, N - 1);
      lastInput = performance.now() - 1000;
    },
    setCards(on) { cardsGoal = on ? 1 : 0; },
    pause(on) { paused = on; if (on) arrowsBox.hidden = true; },
    setStyle(s) { switchDeck(s); },
    setRing(kind) {
      const time = (performance.now() - t0) / 1000;
      ringFrom = ringP;
      ringT0 = time;
      if (kind) {
        torus.material = kind === "news" ? blush : chrome;
        torus.geometry = kind === "news" ? fatRing : thinRing;
        if (!ringKind || ringP < 0.05) ringFrom = 0;
        ringTo = 1;
      } else {
        ringTo = 0;
      }
      ringKind = kind;
    },
    titleSpots() { return deck.spots(); },
    startIntro() {
      introStart = (performance.now() - t0) / 1000;
      firstIntro = Math.min(firstIntro, introStart);
    }
  };
  return api;
}

/* ───────────────────────── boot ───────────────────────── */

async function boot() {
  if (!F || !F.projects) return;
  body.classList.add("loading");
  fillChrome();
  bindChrome();

  const use3d = !reduced && !narrow();
  const mediaReady = warmMedia(loaderProgress);
  const stageReady = use3d
    ? mountStage(mediaReady).catch((err) => { console.warn("WebGL stage unavailable, using the flat scroller.", err); return null; })
    : Promise.resolve(null);

  await mediaReady;
  fillGrid();
  placePill(false);
  stage = await stageReady;

  if (!reduced && finePointer) {
    try { lens = mountLens(); } catch (err) { console.warn("Index lens unavailable.", err); lens = null; }
  }

  if (!stage) mountFlat();
  await hideLoader();
  body.classList.remove("loading");
  route();

  if (stage) {
    stage.setCards(ui.view === "featured");
    if (ui.view === "featured" && !sheetsOpen()) await introTitles(stage.titleSpots());
    stage.startIntro();
  }
}

// The stage and the flat scroller are chosen once at boot; crossing the
// breakpoint reloads so the right one mounts.
matchMedia("(max-width: 860px)").addEventListener("change", () => location.reload());
addEventListener("resize", () => placePill(false));
document.fonts.ready.then(() => placePill(false));

boot();
