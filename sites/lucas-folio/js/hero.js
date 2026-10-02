/**
 * Lucas header on top of the work stage.
 *
 * The page opens on the header. Scrolling down does not move the page: it
 * drives the page-change panel by hand. The first half raises the dark panel
 * (curved top edge) and names the next view; the second half lifts it off
 * (curved bottom edge) to reveal the stage. Scrolling back up runs it in
 * reverse. Every wheel step moves the panel part of the way and it stays
 * there, so slow, spaced-out scrolls play the move stage by stage. The stage's
 * own intro (titles, cards rising) starts as the panel lifts.
 *
 * window.heroGate resolves when the stage should start its intro.
 * window.HERO.back() plays the panel in reverse and returns to the header.
 */
(() => {
  const $ = (s) => document.querySelector(s);
  const body = document.body;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  const hero = $("#hero");
  const veil = $("#veil");
  const vTop = veil.querySelector(".v-top");
  const vBottom = veil.querySelector(".v-bottom");
  const vLabel = veil.querySelector(".v-label");
  const vText = vLabel.querySelector(".v-text");   // set here on every move, not by i18n.js
  const KEY = "lb-transition";               // shared with the contact page's script
  const t = (key) => (window.I18N && window.SITE_I18N ? I18N.t(SITE_I18N, key) : key);

  let openGate;
  window.heroGate = new Promise((r) => { openGate = r; });

  /* ───────── scrub state ───────── */

  // a deep link (#full, #p/slug, #traditional) skips the header
  const deep = Boolean(location.hash) && location.hash !== "#featured";
  let target = deep ? 1 : 0;
  let p = target;
  let done = deep;
  let vel = 0;
  let leaving = false;                        // panel rising over the stage on the way to another page

  // arriving from the contact page: start under the panel it left up, then
  // lift it to the stage (index.html#work) or drop it back down to the header
  let arriving = null;
  try { arriving = sessionStorage.getItem(KEY); sessionStorage.removeItem(KEY); } catch { /* storage blocked */ }
  vText.textContent = t("nav.work");
  if (arriving && !reduced) {
    vText.textContent = arriving;
    p = 0.5;
    target = deep ? 1 : 0;
    done = false;
  } else if (deep) finish();

  function finish() {
    done = true;
    body.classList.remove("hero-mode");
    hero.setAttribute("aria-hidden", "true");
    hero.inert = true;
    openGate();
  }

  function render() {
    const a = clamp(p / 0.5, 0, 1);          // raise
    const b = clamp((p - 0.5) / 0.5, 0, 1);  // lift
    if (p <= 0.5) {
      const e = easeInOut(a);
      veil.style.visibility = p > 0.001 ? "visible" : "hidden";
      veil.style.transform = `translate3d(0,${(1 - e) * 100}%,0)`;
      vTop.style.transform = `scaleY(${1 - e})`;
      vBottom.style.transform = "scaleY(0)";
      const t = clamp((a - 0.55) / 0.45, 0, 1);
      vLabel.style.opacity = String(t);
      vLabel.style.transform = `translate3d(0,${(1 - t) * 30}px,0)`;
      if (!leaving) hero.style.visibility = "visible";
    } else {
      const e = easeInOut(b);
      veil.style.visibility = p < 0.999 ? "visible" : "hidden";
      veil.style.transform = `translate3d(0,${-e * 100}%,0)`;
      vTop.style.transform = "scaleY(0)";
      // the bottom edge bows out as it lifts, then flattens
      vBottom.style.transform = `scaleY(${Math.sin(Math.PI * Math.min(1, b * 1.15)) * 0.95 + 0.05 * (1 - b)})`;
      const t = clamp(b / 0.4, 0, 1);
      vLabel.style.opacity = String(1 - t);
      vLabel.style.transform = `translate3d(0,${-t * 40}px,0)`;
      hero.style.visibility = "hidden";
      openGate();                             // stage intro runs behind the lifting panel
    }
  }

  // a timed, eased sequence (used by ↑ Top / the brand); while it plays the wheel waits
  let tween = null;

  function nudge(amount) {
    if (done || tween) return;
    target = clamp(target + amount, 0, 1);
  }

  addEventListener("wheel", (e) => {
    if (done) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    let d = e.deltaY;
    if (e.deltaMode === 1) d *= 40;
    else if (e.deltaMode === 2) d *= innerHeight;
    nudge(d / 800);                           // about eight wheel ticks for the whole move
  }, { passive: false, capture: true });

  let touchY = null;
  addEventListener("touchstart", (e) => { if (!done) touchY = e.touches[0].clientY; }, { passive: true });
  addEventListener("touchmove", (e) => {
    if (done || touchY == null) return;
    const y = e.touches[0].clientY;
    nudge((touchY - y) / (innerHeight * 0.9));
    touchY = y;
  }, { passive: true });
  addEventListener("touchend", () => { touchY = null; });

  addEventListener("keydown", (e) => {
    if (done) return;
    if (["ArrowDown", "PageDown", " ", "ArrowUp", "PageUp"].includes(e.key)) {
      e.preventDefault();
      e.stopImmediatePropagation();
      nudge(e.key === "ArrowUp" || e.key === "PageUp" ? -0.125 : 0.125);
    }
  }, true);

  // "Work" in the top bar plays the whole move
  document.querySelectorAll("[data-reveal-work]").forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    target = 1;
  }));

  /** Raise the panel over the stage, name the next page, then go there. */
  function leaveTo(href, labelKey) {
    if (leaving) return;
    const label = t(labelKey);
    try { sessionStorage.setItem(KEY, label); } catch { /* the next page just loads normally */ }
    if (reduced) { location.href = href; return; }
    vText.textContent = label;
    leaving = true;
    p = 0;
    target = 0.5;
    const go = () => (p >= 0.49 ? (location.href = href) : requestAnimationFrame(go));
    requestAnimationFrame(go);
  }

  // About and Contact (including the "Contact me" button) play the panel up and open the page
  const LEAVE = { "about.html": "nav.about", "contact.html": "nav.contact" };
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    const key = a && LEAVE[a.getAttribute("href")];
    if (!key || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    e.preventDefault();
    leaveTo(a.getAttribute("href"), key);
  });

  // EN / PT switch: the resting label follows the language
  document.addEventListener("langchange", () => {
    if (!tween && !leaving) vText.textContent = t("nav.work");
  });

  // back/forward cache: never return to a covered stage
  addEventListener("pageshow", (e) => {
    if (!e.persisted || !leaving) return;
    leaving = false;
    p = target = 1;
    vText.textContent = t("nav.work");
  });

  function frame(now) {
    const prev = p;
    if (tween) {
      // play the current step of the sequence on the clock, eased in and out
      const step = tween[0];
      if (step.t0 == null) step.t0 = now;
      const k = clamp((now - step.t0) / step.ms, 0, 1);
      p = step.from + (step.to - step.from) * easeInOut(k);
      target = p;
      if (k >= 1) {
        tween.shift();
        if (!tween.length) { tween = null; vText.textContent = t("nav.work"); }
      }
    } else {
      // ease toward wherever the scroll has taken it; a pause simply holds the panel there
      p = reduced ? target : lerp(p, target, 0.1);
      // the last sliver of an ease is invisible; settle it so the stage's controls appear on time
      if (Math.abs(p - target) < 0.015) p = target;
    }
    vel = p - prev;
    render();
    if (!done && !tween && p >= 1) finish();   // not while a timed move is playing (it starts at p = 1)
    tickName();
    requestAnimationFrame(frame);
  }

  /** Play the panel in reverse and come back to the header. */
  function back() {
    if (!done) return;
    done = false;
    body.classList.add("hero-mode");
    hero.removeAttribute("aria-hidden");
    hero.inert = false;
    history.replaceState(null, "", "#featured");
    if (reduced) { p = target = 0; vText.textContent = t("nav.work"); return; }
    // glide the panel down over the stage, rest on the label, then ease it away to the header
    vText.textContent = t("nav.home");
    p = target = 1;
    tween = [
      { from: 1, to: 0.5, ms: 1100 },
      { from: 0.5, to: 0.5, ms: 380 },
      { from: 0.5, to: 0, ms: 1250 }
    ];
  }
  window.HERO = { back, get done() { return done; } };

  /* ───────── looping name: drifts left, rushes with the scrub ───────── */

  const track = $("#name-track");
  let nameX = 0;
  function tickName() {
    if (done || !track) return;
    const half = track.scrollWidth / 2;
    if (!half) return;
    nameX -= (reduced ? 0 : 1.1) + Math.min(40, Math.abs(vel) * 900);
    if (nameX <= -half) nameX += half;
    track.style.transform = `translate3d(${nameX}px,0,0)`;
  }

  /* ───────── photo switcher (temporary; every visit starts on photo 1) ───────── */

  const portrait = $("#portrait");
  const photoBtns = [...document.querySelectorAll(".photo-switch [data-photo]")];
  function showPhoto(btn) {
    const src = btn.dataset.photo;
    photoBtns.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
    hero.style.setProperty("--hero", btn.dataset.bg);
    const current = portrait.querySelector("img:last-child");
    if (current && current.getAttribute("src") === src) return;
    const wide = btn.hasAttribute("data-wide");
    const img = new Image();
    img.alt = "Lucas Bastos";
    img.src = src;
    img.className = reduced ? "" : "incoming";
    const reveal = () => {
      portrait.classList.toggle("wide", wide);
      portrait.appendChild(img);
      requestAnimationFrame(() => requestAnimationFrame(() => img.classList.remove("incoming")));
      setTimeout(() => { while (portrait.children.length > 1) portrait.firstElementChild.remove(); }, 900);
    };
    img.decode ? img.decode().then(reveal, reveal) : (img.onload = reveal);
  }
  photoBtns.forEach((b) => b.addEventListener("click", () => showPhoto(b)));

  /* ───────── first-visit greeting ───────── */

  const loader = $("#hl-loader");
  const word = $("#hello");
  const pt = window.I18N && I18N.lang === "pt";
  const GREETINGS = pt
    ? ["Olá", "Hello", "Bonjour", "Ciao", "Hola", "Hallo", "Hej", "Hallå", "Olá"]
    : ["Hello", "Olá", "Bonjour", "Ciao", "Hola", "Hallo", "Hej", "Hallå", "Hello"];

  function greet() {
    if (deep || arriving || reduced) { loader.classList.add("gone"); body.classList.remove("hl-loading"); return; }
    body.classList.add("hl-loading");
    word.textContent = GREETINGS[0];
    requestAnimationFrame(() => loader.classList.add("on"));
    let i = 0;
    const next = () => {
      i++;
      if (i >= GREETINGS.length) {
        loader.classList.add("out");
        setTimeout(() => body.classList.remove("hl-loading"), 350);
        setTimeout(() => loader.classList.add("gone"), 1300);
        return;
      }
      word.textContent = GREETINGS[i];
      setTimeout(next, i === GREETINGS.length - 1 ? 380 : 150);
    };
    setTimeout(next, 900);
  }

  // the © credit is already on this header; the stage's brand and ↑ Top bring the header back
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-credit]")) { e.preventDefault(); return; }
    if (e.target.closest("#brand, #to-top") && done) { e.preventDefault(); back(); }
  }, true);

  greet();
  render();
  requestAnimationFrame(frame);
})();
