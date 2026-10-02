/* FORMA layout — header, footer, drawers, cookie notice, WhatsApp, mobile bar, i18n application */
(() => {
  const F = window.FORMA;
  if (!F) return;
  const { t, esc, config } = F;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const page = document.body.dataset.page || "home";

  const LOGO = `<svg class="logo-mark" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="19" fill="#25242c" stroke="#42414a"/><path d="M13 29V11h13M13 20h9" stroke="url(#lg)" stroke-width="3.2" stroke-linecap="round" fill="none"/><defs><linearGradient id="lg" x1="0" x2="1"><stop offset="0" stop-color="#b7fbc5"/><stop offset=".5" stop-color="#a2fef9"/><stop offset="1" stop-color="#f9c5f3"/></linearGradient></defs></svg>`;

  function link(href) {
    return F.withLang(href);
  }

  /* ---------------------------------------------------------------- header */
  function headerHtml() {
    return `
    <a class="skip" href="#main" data-i18n="nav.skip">Skip to content</a>
    <div class="announce"><span data-i18n="announce.text">Envios para Portugal, UE e Brasil · pagamento seguro</span></div>
    <header class="site-header" id="site-header">
      <div class="wrap header-inner">
        <button class="icon-btn burger" type="button" id="menu-toggle" aria-controls="mobile-menu" aria-expanded="false" data-i18n-aria="nav.menu"><i class="ri-menu-line"></i></button>
        <a class="brand" href="${link("index.html")}">${LOGO}<span class="brand-name">${esc(config.brand || "FORMA")}</span></a>
        <nav class="main-nav" aria-label="primary">
          <a href="${link("index.html")}" data-nav="home" data-i18n="nav.home">Início</a>
          <a href="${link("loja.html")}" data-nav="shop" data-i18n="nav.shop">Loja</a>
          <a href="${link("pedidos.html")}" data-nav="orders" data-i18n="nav.orders">Os meus pedidos</a>
          <a href="${link("contacto.html")}" data-nav="contact" data-i18n="nav.contact">Contacto</a>
        </nav>
        <div class="header-actions">
          <div class="lang" role="group" aria-label="Language">
            ${F.LANGS.map((l) => `<button type="button" data-lang="${l}" aria-pressed="${l === F.lang}">${l === "pt-PT" ? "PT" : l === "pt-BR" ? "BR" : l === "es" ? "ES" : "EN"}</button>`).join("")}
          </div>
          <a class="icon-btn" href="${link("pedidos.html")}" data-i18n-aria="nav.account" data-i18n-title="nav.account"><i class="ri-user-3-line"></i></a>
          <button class="icon-btn" type="button" id="search-toggle" data-i18n-aria="nav.search" data-i18n-title="nav.search"><i class="ri-search-line"></i></button>
          <button class="icon-btn cart-btn" type="button" id="cart-toggle" data-i18n-aria="nav.cart" data-i18n-title="nav.cart"><i class="ri-shopping-cart-2-line"></i><span class="cart-count" data-cart-count>0</span></button>
        </div>
      </div>
    </header>
    <div class="drawer-backdrop" id="backdrop" hidden></div>
    <aside class="drawer drawer-left" id="mobile-menu" aria-hidden="true">
      <div class="drawer-head">
        <a class="brand" href="${link("index.html")}">${LOGO}<span class="brand-name">${esc(config.brand || "FORMA")}</span></a>
        <button class="icon-btn" type="button" data-close data-i18n-aria="nav.close"><i class="ri-close-line"></i></button>
      </div>
      <nav class="drawer-nav" aria-label="mobile">
        <a href="${link("index.html")}" data-nav="home"><i class="ri-home-5-line"></i><span data-i18n="nav.home">Início</span></a>
        <a href="${link("loja.html")}" data-nav="shop"><i class="ri-store-2-line"></i><span data-i18n="nav.shop">Loja</span></a>
        <a href="${link("pedidos.html")}" data-nav="orders"><i class="ri-file-list-3-line"></i><span data-i18n="nav.orders">Os meus pedidos</span></a>
        <a href="${link("contacto.html")}" data-nav="contact"><i class="ri-chat-3-line"></i><span data-i18n="nav.contact">Contacto</span></a>
        <a href="${link("orcamento.html")}" data-nav="quote"><i class="ri-ruler-2-line"></i><span data-i18n="nav.quote">Orçamento</span></a>
      </nav>
      <div class="drawer-foot">
        <p class="muted small" data-i18n="nav.language">Idioma</p>
        <div class="lang lang-lg" role="group" aria-label="Language">
          ${F.LANGS.map((l) => `<button type="button" data-lang="${l}" aria-pressed="${l === F.lang}">${l === "pt-PT" ? "PT" : l === "pt-BR" ? "BR" : l === "es" ? "ES" : "EN"}</button>`).join("")}
        </div>
      </div>
    </aside>
    <aside class="drawer drawer-right" id="search-drawer" aria-hidden="true">
      <div class="drawer-head">
        <h2 data-i18n="search.title">Pesquisar</h2>
        <button class="icon-btn" type="button" data-close data-i18n-aria="nav.close"><i class="ri-close-line"></i></button>
      </div>
      <form class="search-form" id="search-form" role="search" action="loja.html">
        <i class="ri-search-line"></i>
        <input type="search" name="q" id="search-input" autocomplete="off" data-i18n-placeholder="search.placeholder" />
      </form>
      <p class="muted small" id="search-hint" data-i18n="search.hint"></p>
      <ul class="search-results" id="search-results"></ul>
      <a class="search-all" id="search-all" href="${link("loja.html")}" hidden><span data-i18n="search.all">Ver tudo</span> <i class="ri-arrow-right-line"></i></a>
    </aside>
    <aside class="drawer drawer-right" id="cart-drawer" aria-hidden="true">
      <div class="drawer-head">
        <h2><span data-i18n="minicart.title">Carrinho</span> <span class="muted" data-cart-count-paren></span></h2>
        <button class="icon-btn" type="button" data-close data-i18n-aria="nav.close"><i class="ri-close-line"></i></button>
      </div>
      <div class="minicart-body" id="minicart-body"></div>
      <div class="minicart-foot" id="minicart-foot"></div>
    </aside>`;
  }

  /* ---------------------------------------------------------------- footer */
  function footerHtml() {
    const wa = F.whatsappLink();
    const socials = [
      config.instagram && { href: config.instagram, icon: "ri-instagram-line", label: "Instagram" },
      config.tiktok && { href: config.tiktok, icon: "ri-tiktok-line", label: "TikTok" },
      wa && { href: wa, icon: "ri-whatsapp-line", label: "WhatsApp" },
      config.contactEmail && { href: `mailto:${config.contactEmail}`, icon: "ri-mail-line", label: "E-mail" }
    ].filter(Boolean);
    return `
    <footer class="site-footer">
      <div class="wrap footer-grid">
        <div class="footer-brand">
          <a class="brand" href="${link("index.html")}">${LOGO}<span class="brand-name">${esc(config.brand || "FORMA")}</span></a>
          <p data-i18n="footer.about"></p>
          <p class="footer-contact">
            ${config.contactEmail ? `<span><strong data-i18n="footer.email">E-mail</strong>: <a href="mailto:${esc(config.contactEmail)}">${esc(config.contactEmail)}</a></span>` : ""}
            ${config.whatsapp ? `<span><strong data-i18n="footer.phone">WhatsApp</strong>: <a href="${wa}" target="_blank" rel="noreferrer">+${esc(config.whatsapp)}</a></span>` : ""}
          </p>
        </div>
        <div>
          <h3 data-i18n="footer.links">Ligações úteis</h3>
          <ul class="footer-links">
            <li><a href="${link("index.html")}" data-i18n="nav.home">Início</a></li>
            <li><a href="${link("loja.html")}" data-i18n="nav.shop">Loja</a></li>
            <li><a href="${link("carrinho.html")}" data-i18n="nav.cart">Carrinho</a></li>
            <li><a href="${link("pedidos.html")}" data-i18n="nav.orders">Os meus pedidos</a></li>
            <li><a href="${link("contacto.html")}" data-i18n="nav.contact">Contacto</a></li>
          </ul>
        </div>
        <div>
          <h3 data-i18n="footer.help">Ajuda</h3>
          <ul class="footer-links footer-links-icons">
            ${wa ? `<li><a href="${wa}" target="_blank" rel="noreferrer"><i class="ri-whatsapp-line"></i><span data-i18n="footer.whatsapp">WhatsApp</span></a></li>` : ""}
            <li><a href="${link("orcamento.html")}"><i class="ri-ruler-2-line"></i><span data-i18n="footer.quote">Pedir orçamento</span></a></li>
            <li><a href="${link("privacidade.html")}"><i class="ri-book-open-line"></i><span data-i18n="footer.privacy">Política de privacidade</span></a></li>
            <li><a href="${link("cookies.html")}"><i class="ri-shield-check-line"></i><span data-i18n="footer.cookies">Política de cookies</span></a></li>
          </ul>
        </div>
        <div>
          <h3 data-i18n="footer.follow">Segue-nos</h3>
          <div class="socials">
            ${socials.map((s) => `<a href="${esc(s.href)}" target="_blank" rel="noreferrer" aria-label="${s.label}" title="${s.label}"><i class="${s.icon}"></i></a>`).join("")}
          </div>
          <h3 class="mt" data-i18n="footer.payments">Pagamentos aceites</h3>
          <div class="pay-logos" aria-label="payments">
            <span class="pay pay-mbway">MB WAY</span>
            <span class="pay pay-visa">VISA</span>
            <span class="pay pay-mc"><i></i><i></i></span>
            <span class="pay pay-paypal">PayPal</span>
            <span class="pay pay-sepa">SEPA</span>
          </div>
        </div>
      </div>
      <div class="wrap footer-bottom">
        <p>${esc(config.domain || "forma")} – <span data-i18n="footer.rights">Todos os direitos reservados.</span></p>
        <p class="muted small" data-i18n="footer.licence"></p>
      </div>
    </footer>
    ${wa ? `<a class="whatsapp-fab" href="${wa}" target="_blank" rel="noreferrer" data-i18n-aria="whatsapp.label" data-i18n-title="whatsapp.label"><i class="ri-whatsapp-fill"></i></a>` : ""}
    <nav class="mobile-bar" aria-label="mobile shortcuts">
      <a href="${link("index.html")}" data-nav="home"><i class="ri-home-5-line"></i><span data-i18n="mobilebar.home">Início</span></a>
      <a href="${link("loja.html")}" data-nav="shop"><i class="ri-store-2-line"></i><span data-i18n="mobilebar.shop">Loja</span></a>
      <button type="button" id="cart-toggle-mobile"><i class="ri-shopping-cart-2-line"></i><span data-i18n="mobilebar.cart">Carrinho</span><span class="cart-count" data-cart-count>0</span></button>
      <a href="${link("pedidos.html")}" data-nav="orders"><i class="ri-user-3-line"></i><span data-i18n="mobilebar.account">Conta</span></a>
    </nav>
    <div class="cookie" id="cookie" hidden>
      <div class="cookie-head"><i class="ri-cookie-line"></i><strong data-i18n="cookie.title">Aviso de cookies</strong></div>
      <p><span data-i18n="cookie.text"></span> <a href="${link("cookies.html")}" data-i18n="cookie.link">Ler política de cookies</a>.</p>
      <button class="btn btn-dark btn-sm" type="button" id="cookie-accept" data-i18n="cookie.accept">Aceitar</button>
    </div>`;
  }

  /* ------------------------------------------------------------ drawers */
  let openDrawer = null;
  function open(id) {
    close();
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add("open");
    el.setAttribute("aria-hidden", "false");
    $("#backdrop").hidden = false;
    requestAnimationFrame(() => $("#backdrop").classList.add("show"));
    document.body.classList.add("no-scroll");
    openDrawer = id;
    if (id === "search-drawer") setTimeout(() => $("#search-input")?.focus(), 80);
    if (id === "mobile-menu") $("#menu-toggle")?.setAttribute("aria-expanded", "true");
  }
  function close() {
    if (!openDrawer) return;
    const el = document.getElementById(openDrawer);
    el?.classList.remove("open");
    el?.setAttribute("aria-hidden", "true");
    $("#backdrop").classList.remove("show");
    setTimeout(() => {
      if (!openDrawer) $("#backdrop").hidden = true;
    }, 250);
    document.body.classList.remove("no-scroll");
    $("#menu-toggle")?.setAttribute("aria-expanded", "false");
    openDrawer = null;
  }

  /* ------------------------------------------------------------- minicart */
  function renderMiniCart() {
    const lines = F.cart.get();
    const body = $("#minicart-body");
    const foot = $("#minicart-foot");
    if (!body) return;
    const count = F.cart.count();
    $$("[data-cart-count]").forEach((el) => {
      el.textContent = count;
      el.classList.toggle("has-items", count > 0);
    });
    $$("[data-cart-count-paren]").forEach((el) => (el.textContent = count ? `(${count})` : ""));
    if (!lines.length) {
      body.innerHTML = `<div class="minicart-empty"><i class="ri-shopping-bag-3-line"></i><p data-i18n="minicart.empty">${t("minicart.empty")}</p><a class="btn btn-grad" href="${link("loja.html")}">${t("minicart.goShop")}</a></div>`;
      foot.innerHTML = "";
      return;
    }
    body.innerHTML = lines
      .map((l) => {
        const p = F.product(l.id);
        return `<div class="mini-line" data-key="${esc(l.key)}">
          <a class="mini-thumb" href="${link(`produto.html?id=${p.id}`)}">${F.productImage(p, 0)}</a>
          <div class="mini-info">
            <a class="mini-name" href="${link(`produto.html?id=${p.id}`)}">${esc(F.productName(p))}</a>
            ${optionsLabel(l.options)}
            <div class="mini-row">
              <div class="qty qty-sm">
                <button type="button" data-qty="-1" aria-label="-">−</button>
                <input type="number" min="1" max="99" value="${l.qty}" aria-label="${t("product.qty")}" />
                <button type="button" data-qty="1" aria-label="+">+</button>
              </div>
              <strong>${F.money(l.qty * p.price)}</strong>
            </div>
          </div>
          <button class="mini-remove" type="button" data-remove aria-label="${t("minicart.remove")}"><i class="ri-close-line"></i></button>
        </div>`;
      })
      .join("");
    foot.innerHTML = `
      <div class="mini-subtotal"><span>${t("minicart.subtotal")}</span><strong>${F.money(F.cart.subtotal())}</strong></div>
      <a class="btn btn-ghost" href="${link("carrinho.html")}">${t("minicart.viewCart")}</a>
      <a class="btn btn-grad" href="${link("checkout.html")}">${t("minicart.checkout")}</a>`;
  }
  function optionsLabel(options) {
    if (!options || (!options.color && !options.text)) return "";
    const bits = [];
    if (options.color) bits.push(`<span class="swatch-dot" style="--c:${esc(options.color)}"></span>`);
    if (options.text) bits.push(`<span>“${esc(options.text)}”</span>`);
    return `<p class="mini-opts">${bits.join(" ")}</p>`;
  }

  /* --------------------------------------------------------------- search */
  function runSearch() {
    const q = ($("#search-input")?.value || "").trim().toLowerCase();
    const list = $("#search-results");
    const all = $("#search-all");
    if (!list) return;
    if (q.length < 2) {
      list.innerHTML = "";
      all.hidden = true;
      $("#search-hint").hidden = false;
      return;
    }
    $("#search-hint").hidden = true;
    const hits = F.products.filter((p) => {
      const hay = [F.productName(p), F.tt(p.blurb), F.catTitle(p.category), p.id].join(" ").toLowerCase();
      return hay.includes(q);
    });
    list.innerHTML = hits.length
      ? hits
          .slice(0, 8)
          .map(
            (p) => `<li><a href="${link(`produto.html?id=${p.id}`)}">
          <span class="search-thumb">${F.productImage(p, 0)}</span>
          <span class="search-name">${esc(F.productName(p))}<small>${esc(F.catTitle(p.category))}</small></span>
          ${F.priceHtml(p)}
        </a></li>`
          )
          .join("")
      : `<li class="muted">${t("search.empty")}</li>`;
    all.hidden = false;
    all.href = link(`loja.html?q=${encodeURIComponent(q)}`);
  }

  /* ----------------------------------------------------------------- i18n */
  function applyI18n() {
    document.documentElement.lang = F.lang;
    const titleKey = document.body.dataset.title;
    document.title = titleKey ? `${t(titleKey)} | ${config.brand || "FORMA"}` : t("meta.title");
    const desc = $('meta[name="description"]');
    if (desc && !titleKey) desc.setAttribute("content", t("meta.description"));
    $$("[data-i18n]").forEach((el) => {
      const v = t(el.dataset.i18n);
      if (typeof v === "string") el.textContent = v;
    });
    $$("[data-i18n-html]").forEach((el) => {
      const v = t(el.dataset.i18nHtml);
      if (typeof v === "string") el.innerHTML = v;
    });
    $$("[data-i18n-placeholder]").forEach((el) => el.setAttribute("placeholder", t(el.dataset.i18nPlaceholder)));
    $$("[data-i18n-aria]").forEach((el) => el.setAttribute("aria-label", t(el.dataset.i18nAria)));
    $$("[data-i18n-title]").forEach((el) => el.setAttribute("title", t(el.dataset.i18nTitle)));
    $$("[data-lang]").forEach((btn) => btn.setAttribute("aria-pressed", String(btn.dataset.lang === F.lang)));
    // keep internal links carrying the language
    $$('a[href$=".html"], a[href*=".html?"], a[href*=".html#"]').forEach((a) => {
      const href = a.getAttribute("href");
      if (!href || /^https?:/.test(href)) return;
      a.setAttribute("href", F.withLang(href));
    });
    renderMiniCart();
  }

  /* ------------------------------------------------------------------ init */
  function init() {
    document.body.insertAdjacentHTML("afterbegin", headerHtml());
    document.body.insertAdjacentHTML("beforeend", footerHtml());
    $$(`[data-nav="${page}"]`).forEach((a) => a.setAttribute("aria-current", "page"));

    // sticky header state
    const header = $("#site-header");
    const onScroll = () => header.classList.toggle("scrolled", scrollY > 24);
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });

    // drawers
    $("#menu-toggle").addEventListener("click", () => (openDrawer === "mobile-menu" ? close() : open("mobile-menu")));
    $("#search-toggle").addEventListener("click", () => open("search-drawer"));
    $("#cart-toggle").addEventListener("click", () => open("cart-drawer"));
    $("#cart-toggle-mobile").addEventListener("click", () => open("cart-drawer"));
    $("#backdrop").addEventListener("click", close);
    $$("[data-close]").forEach((b) => b.addEventListener("click", close));
    addEventListener("keydown", (e) => e.key === "Escape" && close());

    // language
    $$("[data-lang]").forEach((btn) => btn.addEventListener("click", () => F.setLang(btn.dataset.lang)));
    F.on("lang", () => {
      applyI18n();
      F.emit("render");
    });

    // search
    $("#search-input").addEventListener("input", runSearch);
    $("#search-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const q = $("#search-input").value.trim();
      location.href = link(`loja.html?q=${encodeURIComponent(q)}`);
    });

    // mini cart interactions
    $("#cart-drawer").addEventListener("click", (e) => {
      const lineEl = e.target.closest(".mini-line");
      if (!lineEl) return;
      const key = lineEl.dataset.key;
      if (e.target.closest("[data-remove]")) F.cart.remove(key);
      const qtyBtn = e.target.closest("[data-qty]");
      if (qtyBtn) {
        const input = lineEl.querySelector("input");
        F.cart.update(key, Number(input.value) + Number(qtyBtn.dataset.qty));
      }
    });
    $("#cart-drawer").addEventListener("change", (e) => {
      const lineEl = e.target.closest(".mini-line");
      if (lineEl && e.target.matches("input")) F.cart.update(lineEl.dataset.key, Number(e.target.value));
    });
    F.on("cart", renderMiniCart);

    // global add-to-cart buttons (product cards)
    document.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-add]");
      if (!btn) return;
      const p = F.product(btn.dataset.add);
      if (!p) return;
      const options = {};
      if (p.colors && p.colors.length) options.color = p.colors[0];
      if (F.cart.add(p.id, 1, options)) {
        btn.classList.add("added");
        setTimeout(() => btn.classList.remove("added"), 900);
        F.toast(`${t("minicart.added")}: ${esc(F.productName(p))}`, { icon: "ri-check-line", link: { href: link("carrinho.html"), label: t("minicart.viewCart") } });
        renderMiniCart();
      }
    });

    // cookie notice
    const cookie = $("#cookie");
    if (!localStorage.getItem(F.KEYS.cookie)) {
      setTimeout(() => (cookie.hidden = false), 600);
    }
    $("#cookie-accept").addEventListener("click", () => {
      localStorage.setItem(F.KEYS.cookie, "1");
      cookie.hidden = true;
    });

    applyI18n();
    document.body.classList.add("ready");
  }

  window.FORMA.layout = { open, close, applyI18n, renderMiniCart };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
