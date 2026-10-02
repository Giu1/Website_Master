/* FORMA orders / account page */
(() => {
  const F = window.FORMA;
  const { t, esc } = F;
  const $ = (s) => document.querySelector(s);
  const STEPS = ["received", "confirmed", "printing", "shipped", "delivered"];

  function timeline(status) {
    const idx = Math.max(0, STEPS.indexOf(status));
    return `<ol class="timeline">${STEPS.map(
      (s, i) => `<li class="${i <= idx ? "done" : ""}">${t(`orders.status.${s}`)}</li>`
    ).join("")}</ol>`;
  }

  function card(o) {
    return `<article class="order-card">
      <div class="order-head">
        <div>
          <strong>${esc(o.number)}</strong>
          <p class="muted">${t("orders.date")}: ${F.fmtDate(o.date)}</p>
        </div>
        <span class="status-pill">${t(`orders.status.${o.status || "received"}`)}</span>
      </div>
      ${timeline(o.status || "received")}
      <ul class="order-items">
        ${(o.items || [])
          .map((i) => `<li><span>${i.qty}× ${esc(i.name)}</span><span>${F.money(i.qty * i.price)}</span></li>`)
          .join("")}
      </ul>
      <div class="order-foot">
        <span>${t("orders.shipping")}: ${o.shipping === 0 ? t("cart.freeShipping") : F.money(o.shipping || 0)}</span>
        <strong>${t("orders.total")}: ${F.money(o.total)}</strong>
        <button class="btn btn-ghost btn-sm" type="button" data-again="${esc(o.number)}">${t("orders.again")}</button>
      </div>
    </article>`;
  }

  function render() {
    const list = F.orders.list();
    const root = $("#orders-list");
    if (!list.length) {
      root.innerHTML = `<div class="empty"><p>${t("orders.empty")}</p><a class="btn btn-dark" href="${F.withLang("loja.html")}">${t("minicart.goShop")}</a></div>`;
      return;
    }
    root.innerHTML = list.map(card).join("");
  }

  $("#lookup-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const number = $("#lookup-number").value.trim();
    const email = $("#lookup-email").value.trim();
    const found = F.orders.find(number, email);
    const status = $("#lookup-status");
    status.hidden = false;
    if (!found) {
      status.className = "form-status err";
      status.textContent = t("orders.notFound");
      return;
    }
    status.className = "form-status ok";
    status.textContent = `${found.number} — ${t(`orders.status.${found.status || "received"}`)}`;
    const el = document.querySelector(".order-card");
    render();
    document.querySelectorAll(".order-card").forEach((c) => {
      if (c.querySelector("strong")?.textContent === found.number) c.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });

  $("#orders-list").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-again]");
    if (!btn) return;
    const o = F.orders.list().find((x) => x.number === btn.dataset.again);
    if (!o) return;
    (o.items || []).forEach((i) => F.cart.add(i.id, i.qty, i.options || {}));
    location.href = F.withLang("carrinho.html");
  });

  $("#clear-orders")?.addEventListener("click", () => {
    F.orders.clear();
    F.toast(t("orders.cleared"), { icon: "ri-check-line" });
    render();
  });

  const wa = F.whatsappLink();
  const help = $("#orders-help");
  if (help) {
    help.href = wa || F.withLang("contacto.html");
    if (wa) {
      help.target = "_blank";
      help.rel = "noreferrer";
    }
  }

  render();
  F.on("render", render);
})();
