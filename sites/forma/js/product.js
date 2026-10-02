/* FORMA product page */
(() => {
  const F = window.FORMA;
  const { t, esc } = F;
  const $ = (s, r = document) => r.querySelector(s);
  const p = F.product(F.param("id"));

  const state = { idx: 0, color: "", text: "", qty: 1 };

  function crumbs() {
    const root = $("#crumbs");
    if (!root) return;
    if (!p) {
      root.innerHTML = `<a href="${F.withLang("index.html")}">${t("nav.home")}</a><span>/</span><a href="${F.withLang("loja.html")}">${t("pages.shop")}</a>`;
      return;
    }
    root.innerHTML = `<a href="${F.withLang("index.html")}">${t("nav.home")}</a><span>/</span><a href="${F.withLang("loja.html")}">${t("pages.shop")}</a><span>/</span><a href="${F.withLang(`loja.html?cat=${p.category}`)}">${esc(F.catTitle(p.category))}</a><span>/</span><span>${esc(F.productName(p))}</span>`;
  }

  function gallery() {
    const imgs = Math.max(2, (p.images || []).filter(Boolean).length || 2);
    const d = F.discount(p);
    return `<div>
      <div class="gallery-main" id="gallery-main">
        ${d ? `<span class="badge badge-sale">-${d}%</span>` : ""}
        ${p.status === "coming" ? `<span class="badge badge-soon">${t("status.coming")}</span>` : ""}
        ${F.productImage(p, state.idx, { lit: state.idx > 0 })}
      </div>
      <div class="gallery-thumbs" role="tablist" aria-label="${t("product.gallery")}">
        ${Array.from({ length: imgs }, (_, i) => `<button type="button" aria-label="${t("product.thumb")} ${i + 1}"${i === state.idx ? ' aria-current="true"' : ""}>${F.productImage(p, i, { lit: i > 0 })}</button>`).join("")}
      </div>
    </div>`;
  }

  function options() {
    let html = "";
    if (p.colors && p.colors.length) {
      html += `<div class="opt">
        <div class="opt-label"><span>${t("product.color")}</span><span>${esc(state.color || p.colors[0])}</span></div>
        <div class="swatches">
          ${p.colors.map((c) => `<button type="button" data-color="${esc(c)}" style="--c:${esc(c)}" aria-pressed="${c === (state.color || p.colors[0])}" aria-label="${esc(c)}"></button>`).join("")}
        </div>
      </div>`;
    }
    if (p.personalize) {
      html += `<div class="opt">
        <label class="field">
          ${t("product.personalize")}
          <input id="pers-text" maxlength="${p.personalize.maxLength}" value="${esc(state.text)}" data-i18n-placeholder="product.personalizePlaceholder" placeholder="${t("product.personalizePlaceholder", { n: p.personalize.maxLength })}" />
          <small>${t("product.personalizeHelp")}</small>
        </label>
      </div>`;
    }
    return html;
  }

  function buy() {
    const can = F.canBuy(p);
    if (p.status === "coming") {
      return `<div class="waitbox">
        <h3>${t("waitlist.title")}</h3>
        <p class="muted small">${t("waitlist.lead")}</p>
        <form id="wait-form">
          <label class="field">${t("waitlist.email")}<input type="email" name="email" required /></label>
          <label class="consent"><input type="checkbox" name="consent" required /><span>${t("waitlist.consent")}</span></label>
          <button class="btn btn-dark" type="submit">${t("waitlist.submit")}</button>
          <p class="form-status" id="wait-status" hidden></p>
        </form>
      </div>`;
    }
    if (!can) {
      return `<a class="btn btn-grad btn-lg btn-block" href="${F.withLang("orcamento.html")}">${t("product.request")}</a>`;
    }
    return `<div class="buy-row">
      <div class="qty">
        <button type="button" data-qty="-1" aria-label="−">−</button>
        <input type="number" id="qty" min="1" max="99" value="${state.qty}" aria-label="${t("product.qty")}" />
        <button type="button" data-qty="1" aria-label="+">+</button>
      </div>
      <button class="btn btn-grad btn-lg" type="button" id="add-btn"><i class="ri-shopping-cart-line"></i> ${t("product.add")}</button>
    </div>`;
  }

  function meta() {
    const stock = p.stock != null ? `<li><i class="ri-stack-line"></i><span>${t("product.inStock", { n: p.stock })}</span></li>` : "";
    return `<ul class="pmeta">
      <li><i class="ri-printer-line"></i><span>${t("product.madeOn")}</span></li>
      <li><i class="ri-shield-check-line"></i><span>${t("product.secure")}</span></li>
      <li><i class="ri-hand-heart-line"></i><span>${t("product.handFinished")}</span></li>
      <li><i class="ri-truck-line"></i><span>${t("product.shipsIn")}</span></li>
      <li><i class="ri-map-pin-line"></i><span>${t("product.madeIn")}</span></li>
      ${stock}
    </ul>
    <p class="pref">${t("product.sku")}: ${esc(p.id)} · ${t("product.category")}: ${esc(F.catTitle(p.category))}</p>`;
  }

  function info() {
    const d = F.discount(p);
    const save = d ? `<span class="save-pill">${t("price.save")} ${F.money(p.compareAt - p.price)}</span>` : "";
    return `<div class="pinfo">
      <p class="pcard-cat">${esc(F.catTitle(p.category))}</p>
      <h1>${esc(F.productName(p))}</h1>
      ${F.priceHtml(p, true)}${save}
      <p class="stock" data-status="${p.status}">${t(`status.${p.status}`)}</p>
      <p class="blurb">${esc(F.tt(p.blurb))}</p>
      ${options()}
      ${buy()}
      ${meta()}
    </div>`;
  }

  function tabs() {
    const specs = p.specs || {};
    const free = F.shipping.freeFrom();
    return `<div class="tabs" role="tablist">
        <button type="button" role="tab" aria-selected="true" data-tab="desc">${t("product.description")}</button>
        <button type="button" role="tab" aria-selected="false" data-tab="specs">${t("product.specs")}</button>
        <button type="button" role="tab" aria-selected="false" data-tab="ship">${t("product.shippingTab")}</button>
      </div>
      <div class="tab-panel" data-panel="desc">${F.tt(p.description).split("\n").map((line) => `<p>${esc(line)}</p>`).join("")}</div>
      <div class="tab-panel" data-panel="specs" hidden>
        <ul class="specs">
          ${specs.size ? `<li><span>${t("product.size")}</span>${esc(specs.size)}</li>` : ""}
          ${specs.material ? `<li><span>${t("product.material")}</span>${esc(specs.material)}</li>` : ""}
          ${specs.parts ? `<li><span>${t("product.parts")}</span>${esc(specs.parts)}</li>` : ""}
          ${specs.weight ? `<li><span>${t("product.weight")}</span>${esc(specs.weight)}</li>` : ""}
        </ul>
      </div>
      <div class="tab-panel" data-panel="ship" hidden><p>${t("product.shippingText", { free: free != null ? F.money(free) : "—" })}</p></div>`;
  }

  function related() {
    const list = F.products.filter((x) => x.id !== p.id && (x.category === p.category || x.featured)).slice(0, 4);
    const sec = $("#related-section");
    if (!list.length) {
      sec.hidden = true;
      return;
    }
    sec.hidden = false;
    $("#related").innerHTML = list.map(F.productCard).join("");
  }

  function render() {
    crumbs();
    if (!p) {
      $("#product-root").innerHTML = `<div class="empty"><p>${t("product.notFound")}</p><a class="btn btn-dark" href="${F.withLang("loja.html")}">${t("product.back")}</a></div>`;
      $("#tabs-root").innerHTML = "";
      $("#related-section").hidden = true;
      return;
    }
    if (!state.color && p.colors && p.colors.length) state.color = p.colors[0];
    document.title = `${F.productName(p)} | ${F.config.brand || "FORMA"}`;
    $("#product-root").innerHTML = gallery() + info();
    $("#tabs-root").innerHTML = tabs();
    related();
    bind();
  }

  function bind() {
    $("#gallery-main")?.addEventListener("click", () => {
      const n = Math.max(2, (p.images || []).filter(Boolean).length || 2);
      state.idx = (state.idx + 1) % n;
      render();
    });
    document.querySelectorAll(".gallery-thumbs button").forEach((b, i) =>
      b.addEventListener("click", () => {
        state.idx = i;
        render();
      })
    );
    document.querySelectorAll("[data-color]").forEach((b) =>
      b.addEventListener("click", () => {
        state.color = b.dataset.color;
        render();
      })
    );
    const pers = $("#pers-text");
    if (pers) pers.addEventListener("input", () => (state.text = pers.value));
    document.querySelectorAll("[data-qty]").forEach((b) =>
      b.addEventListener("click", () => {
        state.qty = Math.max(1, Math.min(99, state.qty + Number(b.dataset.qty)));
        render();
      })
    );
    $("#qty")?.addEventListener("change", (e) => {
      state.qty = Math.max(1, Math.min(99, Number(e.target.value) || 1));
    });
    $("#add-btn")?.addEventListener("click", () => {
      const options = {};
      if (state.color) options.color = state.color;
      if (state.text) options.text = state.text.slice(0, p.personalize?.maxLength || 40);
      if (F.cart.add(p.id, state.qty, options)) {
        F.toast(`${t("minicart.added")}: ${esc(F.productName(p))}`, {
          icon: "ri-check-line",
          link: { href: F.withLang("carrinho.html"), label: t("minicart.viewCart") }
        });
        F.layout?.renderMiniCart();
      }
    });
    document.querySelectorAll("[data-tab]").forEach((btn) =>
      btn.addEventListener("click", () => {
        document.querySelectorAll("[data-tab]").forEach((b) => b.setAttribute("aria-selected", String(b === btn)));
        document.querySelectorAll("[data-panel]").forEach((panel) => {
          panel.hidden = panel.dataset.panel !== btn.dataset.tab;
        });
      })
    );
    $("#wait-form")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const status = $("#wait-status");
      const email = e.target.email.value.trim();
      if (!F.validEmail(email)) {
        status.hidden = false;
        status.className = "form-status err";
        status.textContent = t("checkout.invalidEmail");
        return;
      }
      try {
        await F.send({ _subject: `Waitlist ${F.productName(p)}`, email, product: p.id, type: "waitlist" });
        status.hidden = false;
        status.className = "form-status ok";
        status.textContent = t("waitlist.success");
        e.target.reset();
      } catch (err) {
        status.hidden = false;
        status.className = "form-status err";
        status.textContent = err.message === "missing-config" ? t("contact.missingConfig") : t("contact.error");
      }
    });
  }

  function init() {
    if (!state.color && p?.colors?.length) state.color = p.colors[0];
    render();
  }

  init();
  F.on("render", () => {
    if (p) Object.assign(state, { idx: state.idx });
    render();
  });
})();
