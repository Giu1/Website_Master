/**
 * Lucas Bastos — portfolio.
 * Loader, page transitions, smooth scroll, looping name, magnetic buttons,
 * side menu, word reveals, work preview, sliding rows, footer curve, clock
 * and the contact form. No dependencies. Every block checks that its markup
 * exists, so the same file runs on all four pages.
 */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const body = document.body;
  const DICT = window.SITE_I18N;
  /** Current-language string, falling back to the key itself. */
  const t = (key) => (window.I18N && DICT ? I18N.t(DICT, key) : key);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const wide = () => innerWidth > 860;

  /* ───────── page transitions ───────── */

  // file name → label shown on the panel
  const PAGES = { "": "nav.home", "index.html": "nav.home", "work.html": "nav.work", "about.html": "nav.about", "contact.html": "nav.contact" };
  const KEY = "lb-transition";
  const veil = $("#transition");
  const veilLabel = $("#t-label");
  const here = new URL(location.href);
  const dir = here.pathname.replace(/[^/]*$/, "");
  let leaving = false;

  const fileOf = (url) => url.pathname.slice(dir.length);

  /** A link to another page of this site (not an anchor, not a new tab). */
  function sitePage(a, e) {
    if (!a || a.target || a.hasAttribute("download")) return null;
    if (e && (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0)) return null;
    let url;
    try { url = new URL(a.href, location.href); } catch { return null; }
    if (url.origin !== here.origin || !url.pathname.startsWith(dir)) return null;
    const file = fileOf(url);
    if (!(file in PAGES)) return null;
    if (PAGES[file] === PAGES[fileOf(here)]) return url.hash ? null : { url, same: true };
    return { url, label: t(PAGES[file]) };
  }

  function leave(url, label) {
    if (leaving) return;
    leaving = true;
    closeMenu();
    try { sessionStorage.setItem(KEY, label); } catch { /* storage blocked: the next page just loads normally */ }
    if (reduced || !veil) { location.href = url.href; return; }
    veilLabel.textContent = label;
    veil.classList.remove("cover", "out");
    void veil.offsetWidth;
    veil.classList.add("in");
    // panel rises (0.85s), label settles, then the browser navigates under the cover
    setTimeout(() => { location.href = url.href; }, 1150);
  }

  /** Arrive behind the panel that the previous page left up. Returns true if it ran. */
  function arrive() {
    let label = null;
    try { label = sessionStorage.getItem(KEY); sessionStorage.removeItem(KEY); } catch { /* ignore */ }
    if (!label || !veil) return false;
    $(".loader")?.classList.add("gone");
    body.classList.remove("is-loading");
    if (reduced) return true;
    veilLabel.textContent = label;
    veil.classList.add("cover");
    body.classList.add("arriving");
    setTimeout(() => {
      veil.classList.add("out");
      body.classList.remove("arriving");
    }, 380);
    setTimeout(() => veil.classList.remove("cover", "out"), 1400);
    return true;
  }

  // back/forward cache: never come back to a covered page
  addEventListener("pageshow", (e) => {
    if (!e.persisted) return;
    leaving = false;
    veil?.classList.remove("in", "cover", "out");
    body.classList.remove("arriving", "menu-open");
  });

  /* ───────── loader (first visit) ───────── */

  const GREETINGS = window.I18N && I18N.lang === "pt"
    ? ["Olá", "Hello", "Bonjour", "Ciao", "Hola", "Hallo", "Hej", "Hallå", "Olá"]
    : ["Hello", "Olá", "Bonjour", "Ciao", "Hola", "Hallo", "Hej", "Hallå", "Hello"];

  function runLoader() {
    const loader = $(".loader");
    const word = $("#hello");
    if (word) word.textContent = GREETINGS[0];
    if (!loader) { body.classList.remove("is-loading"); return; }
    if (reduced) { body.classList.remove("is-loading"); loader.classList.add("gone"); return; }
    body.classList.add("is-loading");
    const done = () => {
      loader.classList.add("out");
      setTimeout(() => body.classList.remove("is-loading"), 350);
      setTimeout(() => loader.classList.add("gone"), 1300);
    };
    requestAnimationFrame(() => loader.classList.add("on"));
    let i = 0;
    const next = () => {
      i++;
      if (i >= GREETINGS.length) { done(); return; }
      word.textContent = GREETINGS[i];
      setTimeout(next, i === GREETINGS.length - 1 ? 380 : 150);
    };
    setTimeout(next, 900);
  }

  /* ───────── smooth scroll ───────── */

  const wrap = $("#smooth");
  const smoothOn = !reduced && fine && wide();
  const scroll = { cur: scrollY, tgt: scrollY, vel: 0 };

  function sizeBody() { body.style.height = `${wrap.getBoundingClientRect().height}px`; }

  if (smoothOn) {
    document.documentElement.classList.add("has-smooth");
    new ResizeObserver(sizeBody).observe(wrap);
    sizeBody();
  }

  /** Position of an element in the page, independent of the wrapper's transform. */
  const pageTop = (el) => el.getBoundingClientRect().top + (smoothOn ? scroll.cur : scrollY);

  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a) return;
    if (a.hasAttribute("data-social")) { e.preventDefault(); return; }

    const page = sitePage(a, e);
    if (page && !page.same) { e.preventDefault(); leave(page.url, page.label); return; }

    // same-page links: "#id", or a link to this very page
    const href = a.getAttribute("href");
    if (!href.startsWith("#") && !page) return;
    const id = page ? page.url.hash.slice(1) : href.slice(1);
    e.preventDefault();
    closeMenu();
    const el = id ? document.getElementById(id) : null;
    const top = el ? pageTop(el) : 0;
    window.scrollTo({ top, behavior: smoothOn || reduced ? "auto" : "smooth" });
  });

  /* ───────── looping name ───────── */

  const track = $("#name-track");
  let nameX = 0;
  let nameDir = -1;

  function tickName() {
    if (!track) return;
    const half = track.scrollWidth / 2;
    if (!half) return;
    if (scroll.vel > 0.4) nameDir = -1;
    else if (scroll.vel < -0.4) nameDir = 1;
    const speed = (reduced ? 0 : 1.1) + Math.min(14, Math.abs(scroll.vel) * 0.35);
    nameX += speed * nameDir;
    if (nameX <= -half) nameX += half;
    if (nameX > 0) nameX -= half;
    track.style.transform = `translate3d(${nameX}px,0,0)`;
  }

  /* ───────── parallax ───────── */

  const parallax = $$("[data-speed]");

  function tickParallax() {
    if (!parallax.length || !wide() || reduced) return;
    const y = smoothOn ? scroll.cur : scrollY;
    for (const el of parallax) {
      const s = parseFloat(el.dataset.speed);
      const base = el.classList.contains("portrait") && !el.classList.contains("wide") ? "translateX(-50%) " : "";
      el.style.transform = `${base}translate3d(0,${-y * s}px,0)`;
    }
  }

  /* ───────── magnetic buttons ───────── */

  function magnet(el) {
    const inner = $(".magnetic-inner", el);
    const round = el.matches(".fab, .btn-round, .btn-cta");
    const pull = round ? 0.4 : 0.3;
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.style.transition = "transform 0.25s ease-out";
      el.style.transform = `${el.classList.contains("fab") ? "scale(1) " : ""}translate(${dx * pull}px, ${dy * pull}px)`;
      if (inner) {
        inner.style.transition = "transform 0.25s ease-out";
        inner.style.transform = `translate(${dx * pull * 0.45}px, ${dy * pull * 0.45}px)`;
      }
    });
    el.addEventListener("pointerleave", () => {
      el.style.transition = "transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)";
      el.style.transform = "";
      if (inner) {
        inner.style.transition = "transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)";
        inner.style.transform = "";
      }
    });
  }

  if (fine && !reduced) $$(".magnetic").forEach(magnet);

  /* ───────── menu ───────── */

  const fab = $("#fab");
  const menu = $("#menu");

  function openMenu() {
    if (!menu) return;
    body.classList.add("menu-open");
    fab.setAttribute("aria-expanded", "true");
    fab.setAttribute("aria-label", t("menu.close.attr"));
    menu.setAttribute("aria-hidden", "false");
  }

  function closeMenu() {
    if (!body.classList.contains("menu-open")) return;
    body.classList.remove("menu-open");
    fab.setAttribute("aria-expanded", "false");
    fab.setAttribute("aria-label", t("menu.open.attr"));
    menu.setAttribute("aria-hidden", "true");
  }

  fab?.addEventListener("click", () => (body.classList.contains("menu-open") ? closeMenu() : openMenu()));
  $$("[data-open-menu]").forEach((b) => b.addEventListener("click", openMenu));
  $("#menu-dim")?.addEventListener("click", closeMenu);
  addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });

  // the round button appears once the top bar has scrolled away
  function tickFab() {
    if (!fab) return;
    const y = smoothOn ? scroll.cur : scrollY;
    const show = y > innerHeight * 0.12;
    fab.classList.toggle("show", show);
    fab.classList.toggle("hidden-top", !show);
  }

  /* ───────── word reveal ───────── */

  function splitWords() {
    for (const el of $$(".split")) {
      el.innerHTML = el.textContent
        .trim()
        .split(/\s+/)
        .map((w, i) => `<span class="w"><span style="transition-delay:${i * 18}ms">${w}</span></span>`)
        .join(" ");
    }
  }
  splitWords();

  const io = new IntersectionObserver((entries) => {
    for (const en of entries) if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
  }, { threshold: 0.2 });
  // wait for the loader / transition before revealing what is already on screen
  const startReveals = () => $$("[data-reveal]").forEach((el) => io.observe(el));

  /* ───────── work preview (any list with data-preview links) ───────── */

  const preview = $("#preview");
  const pTrack = $("#preview-track");
  const pCursor = $("#preview-cursor");
  const pointer = { x: innerWidth / 2, y: innerHeight / 2 };
  const pPos = { ...pointer };
  const cPos = { ...pointer };
  let previewOn = false;

  addEventListener("pointermove", (e) => { pointer.x = e.clientX; pointer.y = e.clientY; }, { passive: true });

  for (const list of $$("[data-preview-list]")) {
    const links = $$("a[data-preview]", list);
    if (!fine || !preview || !links.length) break;
    links.forEach((a, i) => { a.dataset.index = i; });
    const fill = () => {
      pTrack.innerHTML = links
        .map((a) => `<div class="preview-slide" style="--bg:${a.dataset.bg || "#ddd"}"><img src="${a.dataset.preview}" alt=""></div>`)
        .join("");
    };
    list.addEventListener("pointerover", (e) => {
      const a = e.target.closest("a[data-preview]");
      if (!a) return;
      if (pTrack.dataset.list !== String($$("[data-preview-list]").indexOf(list))) {
        pTrack.dataset.list = String($$("[data-preview-list]").indexOf(list));
        fill();
      }
      pTrack.style.transform = `translateY(${-Number(a.dataset.index) * 100}%)`;
      if (!previewOn) { pPos.x = cPos.x = pointer.x; pPos.y = cPos.y = pointer.y; }
      previewOn = true;
      preview.classList.add("on");
      pCursor.classList.add("on");
    });
    list.addEventListener("pointerleave", () => {
      previewOn = false;
      preview.classList.remove("on");
      pCursor.classList.remove("on");
    });
  }

  function tickPreview() {
    if (!preview || (!previewOn && !preview.classList.contains("on"))) return;
    pPos.x = lerp(pPos.x, pointer.x, 0.12);
    pPos.y = lerp(pPos.y, pointer.y, 0.12);
    cPos.x = lerp(cPos.x, pointer.x, 0.3);
    cPos.y = lerp(cPos.y, pointer.y, 0.3);
    preview.style.left = `${pPos.x}px`;
    preview.style.top = `${pPos.y}px`;
    pCursor.style.left = `${cPos.x}px`;
    pCursor.style.top = `${cPos.y}px`;
  }

  /* ───────── sliding rows + footer curve ───────── */

  const rows = $(".rows");
  const row1 = $('[data-row="1"]');
  const row2 = $('[data-row="2"]');
  const round = $(".round-wrap");
  const footer = $(".footer");
  const footerInner = $("#footer-inner");

  function tickRows() {
    const vh = innerHeight;
    if (rows && row1 && row2) {
      const r = rows.getBoundingClientRect();
      const p = clamp((vh - r.top) / (vh + r.height), 0, 1);
      row1.style.transform = `translate3d(${(p - 0.5) * 10}vw,0,0)`;
      row2.style.transform = `translate3d(${(0.5 - p) * 10}vw,0,0)`;
    }
    if (footer) {
      const q = clamp((vh - footer.getBoundingClientRect().top) / vh, 0, 1);   // 0 as the footer appears, 1 when it fills the screen
      if (round) round.style.height = `${(1 - q) * 10}vw`;
      if (footerInner && wide() && !reduced) footerInner.style.transform = `translate3d(0,${(1 - q) * -18}vh,0)`;
    }
  }

  /* ───────── hero photo switcher ───────── */

  const portrait = $("#portrait");
  const hero = $(".hero");
  const photoBtns = $$(".photo-switch [data-photo]");

  function showPhoto(btn, instant = false) {
    if (!portrait || !btn) return;
    const src = btn.dataset.photo;
    photoBtns.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
    hero.style.setProperty("--hero", btn.dataset.bg);
    const current = portrait.querySelector("img:last-child");
    if (current && current.getAttribute("src") === src) return;
    const img = new Image();
    img.alt = "Lucas Bastos";
    img.src = src;
    const wide = btn.hasAttribute("data-wide");
    if (instant || reduced) {
      portrait.classList.toggle("wide", wide);
      portrait.replaceChildren(img);
      return;
    }
    // crossfade: the new photo fades in on top, then the old ones are dropped
    img.className = "incoming";
    const reveal = () => {
      // landscape photos fill the hero; portrait ones sit in the centre column
      if (portrait.classList.contains("wide") !== wide) {
        portrait.classList.toggle("wide", wide);
        portrait.style.transform = "";
      }
      portrait.appendChild(img);
      requestAnimationFrame(() => requestAnimationFrame(() => img.classList.remove("incoming")));
      setTimeout(() => { while (portrait.children.length > 1) portrait.firstElementChild.remove(); }, 900);
    };
    img.decode ? img.decode().then(reveal, reveal) : (img.onload = reveal);
  }

  // switching is temporary: every visit starts on the default photo
  photoBtns.forEach((b) => b.addEventListener("click", () => showPhoto(b)));
  try { localStorage.removeItem("lb-photo"); } catch { /* ignore */ }

  // warm the other photos once the page has settled
  addEventListener("load", () => setTimeout(() => photoBtns.forEach((b) => { new Image().src = b.dataset.photo; }), 2500));

  /* ───────── clock ───────── */

  const clocks = $$("[data-clock]");
  const zone = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Lisbon", timeZoneName: "short" });
  function tickClock() {
    const pt = window.I18N && I18N.lang === "pt";
    const fmt = new Intl.DateTimeFormat(pt ? "pt-PT" : "en-GB", { timeZone: "Europe/Lisbon", hour: "2-digit", minute: "2-digit", hour12: !pt });
    const now = new Date();
    const tz = zone.formatToParts(now).find((p) => p.type === "timeZoneName")?.value || "";
    const text = `${fmt.format(now).toUpperCase()} ${tz}`;
    clocks.forEach((c) => { c.textContent = text; });
  }
  if (clocks.length) { tickClock(); setInterval(tickClock, 15000); }

  /* ───────── contact form (stays on the page) ───────── */

  const form = $("#contact-form");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const note = $("#form-note");
    const missing = $$("[required]", form).find((f) => !f.value.trim());
    if (missing) {
      note.textContent = t("form.missing");
      missing.focus();
      return;
    }
    const email = $("#f-email", form);
    if (email && !email.checkValidity()) {
      note.textContent = t("form.bademail");
      email.focus();
      return;
    }
    note.textContent = t("form.ok");
    form.reset();
  });

  /* ───────── language toggle ───────── */

  function applyAlts() {
    $$("[data-i18n-alt]").forEach((img) => { img.alt = t(img.dataset.i18nAlt); });
  }
  applyAlts();

  document.addEventListener("langchange", () => {
    // i18n.js has swapped the text; rebuild the word spans and keep shown headings shown
    const shown = $$(".split").map((el) => el.classList.contains("in"));
    splitWords();
    $$(".split").forEach((el, i) => { if (shown[i]) el.classList.add("in"); });
    applyAlts();
    if (clocks.length) tickClock();
    fab?.setAttribute("aria-label", t(body.classList.contains("menu-open") ? "menu.close.attr" : "menu.open.attr"));
    const note = $("#form-note");
    if (note) note.textContent = "";
    if (smoothOn) sizeBody();
  });

  /* ───────── loop ───────── */

  let lastY = scrollY;
  function frame() {
    scroll.tgt = scrollY;
    if (smoothOn) {
      const prev = scroll.cur;
      scroll.cur = lerp(scroll.cur, scroll.tgt, 0.09);
      if (Math.abs(scroll.tgt - scroll.cur) < 0.1) scroll.cur = scroll.tgt;
      scroll.vel = scroll.cur - prev;
      wrap.style.transform = `translate3d(0,${-scroll.cur}px,0)`;
    } else {
      scroll.vel = lerp(scroll.vel, scrollY - lastY, 0.3);
      lastY = scrollY;
    }
    tickName();
    tickParallax();
    tickFab();
    tickPreview();
    tickRows();
    requestAnimationFrame(frame);
  }

  addEventListener("resize", () => { if (smoothOn) sizeBody(); });

  // arriving from another page of the site → lift the panel; otherwise greet
  const viaTransition = arrive();
  if (!viaTransition) runLoader();
  setTimeout(startReveals, viaTransition ? 500 : reduced ? 0 : 2000);
  requestAnimationFrame(frame);
})();
