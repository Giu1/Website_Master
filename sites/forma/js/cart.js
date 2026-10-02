/* FORMA cart page */
(() => {
  const F = window.FORMA;
  const { t, esc } = F;
  const $ = (s) => document.querySelector(s);

  function opts(options) {
    if (!options || (!options.color && !options.text)) return "";
    const bits = [];
    if (options.color) bits.push(`${t("cart.colorLabel")}: <span class="swatch-dot" style="--c:${esc(options.color)}"></span>`);
    if (options.text) bits.push(`${t("cart.textLabel")}: “${esc(options.text)}”`);
    return `<p class="cart-opts">${bits.join(" · ")}</p>`;
  }

  function render() {
    const lines = F.cart.get();
    const empty = $("#cart-empty");
    const layout = $("#cart-layout");
    if (!lines.length) {
      empty.hidden = false;
      layout.hidden = true;
      return;
    }
    empty.hidden = true;
    layout.hidden = false;
    $("#cart-lines").innerHTML = lines
      .map((l) => {
        const p = F.product(l.id);
        return `<div class="cart-line" data-key="${esc(l.key)}">
          <a class="cart-thumb" href="${F.withLang(`produto.html?id=${p.id}`)}">${F.productImage(p, 0)}</a>
          <div>
            <a class="cart-name" href="${F.withLang(`produto.html?id=${p.id}`)}">${esc(F.productName(p))}</a>
            ${opts(l.options)}
            <p class="cart-unit">${F.money(p.price)} ${t("common.each")}</p>
          </div>
          <div class="qty qty-sm">
            <button type="button" data-qty="-1">−</button>
            <input type="number" min="1" max="99" value="${l.qty}" aria-label="${t("product.qty")}" />
            <button type="button" data-qty="1">+</button>
          </div>
          <strong class="cart-total">${F.money(l.qty * p.price)}</strong>
          <button class="cart-remove" type="button" data-remove aria-label="${t("cart.remove")}"><i class="ri-close-line"></i></button>
        </div>`;
      })
      .join("");

    const sub = F.cart.subtotal();
    const free = F.shipping.freeFrom();
    const needed = free != null ? Math.max(0, free - sub) : null;
    $("#sum-sub").textContent = F.money(sub);
    $("#sum-ship").textContent = t("cart.shippingNote");
    $("#sum-total").textContent = F.money(sub);
    const bar = $("#free-bar");
    if (free == null) {
      bar.hidden = true;
    } else {
      bar.hidden = false;
      bar.querySelector("span").textContent = needed > 0 ? t("cart.freeFrom", { n: F.money(needed) }) : t("cart.freeReached");
      bar.querySelector("i").style.setProperty("--w", `${Math.min(100, (sub / free) * 100)}%`);
    }
  }

  $("#cart-lines").addEventListener("click", (e) => {
    const line = e.target.closest(".cart-line");
    if (!line) return;
    if (e.target.closest("[data-remove]")) F.cart.remove(line.dataset.key);
    const q = e.target.closest("[data-qty]");
    if (q) {
      const input = line.querySelector("input");
      F.cart.update(line.dataset.key, Number(input.value) + Number(q.dataset.qty));
    }
  });
  $("#cart-lines").addEventListener("change", (e) => {
    const line = e.target.closest(".cart-line");
    if (line && e.target.matches("input")) F.cart.update(line.dataset.key, Number(e.target.value));
  });

  render();
  F.on("cart", render);
  F.on("render", render);
})();
