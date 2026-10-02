/* FORMA shop page — category filter, search, sort */
(() => {
  const F = window.FORMA;
  const { t, esc } = F;
  const $ = (s) => document.querySelector(s);

  const state = {
    cat: F.param("cat") || "all",
    q: F.param("q") || "",
    sort: F.param("sort") || "featured",
    avail: F.param("avail") === "1"
  };
  if (!F.category(state.cat)) state.cat = "all";

  const STATUS_RANK = { available: 0, "made-to-order": 1, coming: 2 };

  function syncUrl() {
    const url = new URL(location.href);
    ["cat", "q", "sort", "avail"].forEach((k) => url.searchParams.delete(k));
    if (state.cat !== "all") url.searchParams.set("cat", state.cat);
    if (state.q) url.searchParams.set("q", state.q);
    if (state.sort !== "featured") url.searchParams.set("sort", state.sort);
    if (state.avail) url.searchParams.set("avail", "1");
    history.replaceState({}, "", url);
  }

  function filtered() {
    const q = state.q.trim().toLowerCase();
    let list = F.products.filter((p) => state.cat === "all" || p.category === state.cat);
    if (state.avail) list = list.filter((p) => p.status === "available");
    if (q) {
      list = list.filter((p) => [F.productName(p), F.tt(p.blurb), F.catTitle(p.category), p.id].join(" ").toLowerCase().includes(q));
    }
    const byPrice = (p) => (p.price == null ? Number.POSITIVE_INFINITY : p.price);
    switch (state.sort) {
      case "price-asc":
        list.sort((a, b) => byPrice(a) - byPrice(b));
        break;
      case "price-desc":
        list.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "name":
        list.sort((a, b) => F.productName(a).localeCompare(F.productName(b), F.lang));
        break;
      case "sale":
        list.sort((a, b) => F.discount(b) - F.discount(a));
        break;
      default:
        list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || STATUS_RANK[a.status] - STATUS_RANK[b.status]);
    }
    return list;
  }

  function renderSide() {
    const root = $("#cat-list");
    const items = [{ id: "all", label: t("shop.all"), n: F.products.length }, ...F.categories.map((c) => ({ id: c.id, label: F.catTitle(c.id), n: F.inCategory(c.id).length }))];
    root.innerHTML = items
      .map((i) => `<li><a href="${F.withLang(i.id === "all" ? "loja.html" : `loja.html?cat=${i.id}`)}" data-cat="${i.id}"${i.id === state.cat ? ' aria-current="true"' : ""}><span>${esc(i.label)}</span><span>${i.n}</span></a></li>`)
      .join("");
    root.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", (e) => {
        e.preventDefault();
        state.cat = a.dataset.cat;
        update();
        if (innerWidth <= 960) toggleFilters(false);
      })
    );
    $("#only-available").checked = state.avail;
  }

  function renderHead() {
    const crumb = $("#crumb-cat");
    if (state.cat !== "all") {
      crumb.hidden = false;
      crumb.innerHTML = `<span>/</span> ${esc(F.catTitle(state.cat))}`;
      $("#shop-title").textContent = F.catTitle(state.cat);
      $("#shop-lead").textContent = t(`cats.${state.cat}.desc`);
      document.title = `${F.catTitle(state.cat)} | ${F.config.brand || "FORMA"}`;
    } else {
      crumb.hidden = true;
      $("#shop-title").textContent = t("shop.title");
      $("#shop-lead").textContent = t("shop.lead");
      document.title = `${t("pages.shop")} | ${F.config.brand || "FORMA"}`;
    }
  }

  function renderGrid() {
    const list = filtered();
    $("#shop-grid").innerHTML = list.map(F.productCard).join("");
    $("#shop-empty").hidden = list.length > 0;
    $("#shop-count").textContent = list.length === 1 ? t("shop.result") : t("shop.results", { n: list.length });
  }

  function update() {
    syncUrl();
    renderSide();
    renderHead();
    renderGrid();
  }

  function toggleFilters(force) {
    const open = force ?? $("#filter-toggle").getAttribute("aria-expanded") !== "true";
    $("#filter-toggle").setAttribute("aria-expanded", String(open));
    document.querySelectorAll(".shop-side .side-block").forEach((b) => b.classList.toggle("open", open));
  }

  $("#shop-q").value = state.q;
  $("#shop-sort").value = state.sort;
  let qt;
  $("#shop-q").addEventListener("input", (e) => {
    clearTimeout(qt);
    qt = setTimeout(() => {
      state.q = e.target.value;
      update();
    }, 120);
  });
  $("#shop-sort").addEventListener("change", (e) => {
    state.sort = e.target.value;
    update();
  });
  $("#only-available").addEventListener("change", (e) => {
    state.avail = e.target.checked;
    update();
  });
  $("#shop-clear").addEventListener("click", () => {
    Object.assign(state, { cat: "all", q: "", avail: false, sort: "featured" });
    $("#shop-q").value = "";
    $("#shop-sort").value = "featured";
    update();
  });
  $("#filter-toggle").addEventListener("click", () => toggleFilters());

  update();
  F.on("render", update);
})();
