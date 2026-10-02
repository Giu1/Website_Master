/* FORMA home page */
(() => {
  const F = window.FORMA;
  const { t, esc } = F;
  const $ = (s) => document.querySelector(s);

  /* faint silhouettes behind the hero, like a wall of shadow prints */
  function renderSilhouettes() {
    const root = $("#hero-silhouettes");
    if (!root) return;
    const ids = ["assembled-figure", "wyrm-mini", "display-helm", "comic-bust", "stage-hilt", "moon-lamp", "hero-pack", "shadow-lamp"];
    const spots = [
      [4, 12, 180, 0.35],
      [22, 62, 140, 0.25],
      [46, 8, 120, 0.2],
      [60, 66, 200, 0.28],
      [82, 14, 150, 0.22],
      [90, 60, 130, 0.25],
      [34, 34, 100, 0.18],
      [72, 40, 110, 0.18]
    ];
    root.innerHTML = `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
      <defs><filter id="soft"><feGaussianBlur stdDeviation="1.2" /></filter></defs>${spots
      .map(
        ([x, y, s, o], i) =>
          `<svg x="${x * 16}" y="${y * 9}" width="${s}" height="${s}" viewBox="0 0 80 80" opacity="${(o * 0.45).toFixed(2)}" filter="url(#soft)"><g fill="#fff" stroke="#fff">${F.shape(ids[i], "#fff").replace(/#f4ecdc|#25242c|#17161c|#1a1410|#8a8a8a/gi, "#fff")}</g></svg>`
      )
      .join("")}</svg>`;
  }

  function renderCategories() {
    const root = $("#cat-grid");
    if (!root) return;
    const cats = [...F.categories].sort((a, b) => (b.hero ? 1 : 0) - (a.hero ? 1 : 0));
    root.innerHTML = cats
      .map((c) => {
        const n = F.inCategory(c.id).length;
        return `<a class="cat-card${c.hero ? " hero-card" : ""}" href="${F.withLang(`loja.html?cat=${c.id}`)}">
          ${F.categoryArt(c)}
          <div class="cat-body">
            <h3>${esc(F.catTitle(c.id))}</h3>
            <p>${esc(c.hero ? t(`cats.${c.id}.desc`) : t("cats.count", { n }))}</p>
            <span class="link-arrow">${t("cats.view")} <i class="ri-arrow-right-line"></i></span>
          </div>
          <span class="cat-tag">${esc(F.config.brand || "FORMA")}</span>
        </a>`;
      })
      .join("");
  }

  function renderFeatured() {
    const root = $("#featured-grid");
    if (!root) return;
    const list = F.products.filter((p) => p.featured).sort((a, b) => Number(b.category === "figurines") - Number(a.category === "figurines"));
    const fill = F.products.filter((p) => !p.featured && F.canBuy(p));
    root.innerHTML = [...list, ...fill].slice(0, 12).map(F.productCard).join("");
  }

  /* -------------------------------------------------------- testimonials */
  let testiIndex = 0;
  let testiTimer;
  function perView() {
    return innerWidth <= 640 ? 1 : innerWidth <= 960 ? 2 : 3;
  }
  function renderTestimonials() {
    const track = $("#testi-track");
    const dots = $("#testi-dots");
    if (!track) return;
    const items = window.FORMA_TESTIMONIALS || [];
    track.innerHTML = items
      .map(
        (x) => `<article class="testi-card">
        <p>${esc(F.tt(x.text))}</p>
        <div class="testi-foot">
          <span class="testi-avatar">${esc(x.name.trim().charAt(0))}</span>
          <div><strong>${esc(x.name)}</strong><span>${t("testimonials.via")} ${esc(x.via)}</span></div>
        </div>
      </article>`
      )
      .join("");
    const pages = Math.max(1, Math.ceil(items.length / perView()));
    dots.innerHTML = Array.from({ length: pages }, (_, i) => `<button type="button" data-page="${i}" aria-label="${t("testimonials.goto")} ${i + 1}"${i === testiIndex ? ' aria-current="true"' : ""}></button>`).join("");
    dots.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => goTo(Number(b.dataset.page))));
    goTo(Math.min(testiIndex, pages - 1), false);
  }
  function goTo(i, smooth = true) {
    const track = $("#testi-track");
    const pages = Math.max(1, Math.ceil((window.FORMA_TESTIMONIALS || []).length / perView()));
    testiIndex = (i + pages) % pages;
    const card = track.querySelector(".testi-card");
    if (!card) return;
    const gap = 20;
    const x = testiIndex * perView() * (card.getBoundingClientRect().width + gap);
    track.scrollTo({ left: x, behavior: smooth ? "smooth" : "auto" });
    $("#testi-dots")
      .querySelectorAll("button")
      .forEach((b, k) => {
        if (k === testiIndex) b.setAttribute("aria-current", "true");
        else b.removeAttribute("aria-current");
      });
  }
  function startAuto() {
    clearInterval(testiTimer);
    testiTimer = setInterval(() => goTo(testiIndex + 1), 6000);
  }

  function reveal() {
    const els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) return els.forEach((el) => el.classList.add("in"));
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && (e.target.classList.add("in"), io.unobserve(e.target))),
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
  }

  function render() {
    renderCategories();
    renderFeatured();
    renderTestimonials();
  }

  renderSilhouettes();
  render();
  reveal();
  startAuto();
  F.on("render", render);
  $("#testi-prev").addEventListener("click", () => (goTo(testiIndex - 1), startAuto()));
  $("#testi-next").addEventListener("click", () => (goTo(testiIndex + 1), startAuto()));
  $("#testi-track").addEventListener("pointerdown", () => clearInterval(testiTimer));
  let rt;
  addEventListener("resize", () => {
    clearTimeout(rt);
    rt = setTimeout(renderTestimonials, 150);
  });
})();
