/* FORMA checkout */
(() => {
  const F = window.FORMA;
  const { t, esc } = F;
  const $ = (s) => document.querySelector(s);
  const form = $("#checkout-form");

  let zoneId = F.shipping.zones()[0]?.id || "pt";
  let payId = (F.config.payments || ["transfer"])[0];

  function lineOpts(options) {
    if (!options) return "";
    const bits = [];
    if (options.color) bits.push(options.color);
    if (options.text) bits.push(`“${options.text}”`);
    return bits.join(" · ");
  }

  function summary() {
    const lines = F.cart.get();
    const sub = F.cart.subtotal();
    const ship = F.shipping.price(zoneId, sub);
    const total = sub + ship;
    $("#sum-lines").innerHTML = lines
      .map((l) => {
        const p = F.product(l.id);
        return `<div class="sum-line">
          <span class="thumb">${F.productImage(p, 0)}<b>${l.qty}</b></span>
          <span>${esc(F.productName(p))}<small>${esc(lineOpts(l.options))}</small></span>
          <strong>${F.money(l.qty * p.price)}</strong>
        </div>`;
      })
      .join("");
    $("#ck-sub").textContent = F.money(sub);
    $("#ck-ship").textContent = ship === 0 ? t("cart.freeShipping") : F.money(ship);
    $("#ck-total").textContent = F.money(total);
    return { sub, ship, total, lines };
  }

  function zones() {
    const sub = F.cart.subtotal();
    $("#ship-list").innerHTML = F.shipping
      .zones()
      .map((z) => {
        const price = F.shipping.price(z.id, sub);
        return `<label class="radio-card">
          <input type="radio" name="zone" value="${z.id}" ${z.id === zoneId ? "checked" : ""} />
          <span><strong>${t(`checkout.zones.${z.id}`)}</strong><small>${z.days === "—" ? "" : `${z.days} ${t("checkout.days")}`}</small></span>
          <span class="rc-price">${price === 0 ? t("cart.freeShipping") : F.money(price)}</span>
        </label>`;
      })
      .join("");
  }

  function payments() {
    const ids = F.config.payments || ["transfer"];
    $("#pay-list").innerHTML = ids
      .map(
        (id) => `<label class="radio-card">
        <input type="radio" name="pay" value="${id}" ${id === payId ? "checked" : ""} />
        <span><strong>${t(`checkout.payments.${id}`)}</strong></span>
        <span></span>
      </label>`
      )
      .join("");
  }

  function showEmpty() {
    $("#checkout-empty").hidden = false;
    form.hidden = true;
    $("#checkout-success").hidden = true;
  }

  function render() {
    if (!$("#checkout-success").hidden) return;
    if (!F.cart.get().length) {
      showEmpty();
      return;
    }
    $("#checkout-empty").hidden = true;
    form.hidden = false;
    zones();
    payments();
    summary();
    const wa = F.whatsappLink();
    $("#wa-order").hidden = !wa;
    if (wa) $("#wa-order").href = "#";
  }

  function payloadFromForm() {
    const fd = new FormData(form);
    const { sub, ship, total, lines } = summary();
    return {
      name: String(fd.get("name") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      phone: String(fd.get("phone") || "").trim(),
      address: String(fd.get("address") || "").trim(),
      address2: String(fd.get("address2") || "").trim(),
      city: String(fd.get("city") || "").trim(),
      zip: String(fd.get("zip") || "").trim(),
      country: String(fd.get("country") || "").trim(),
      notes: String(fd.get("notes") || "").trim(),
      consent: fd.get("consent") === "on",
      zone: zoneId,
      payment: payId,
      items: lines.map((l) => {
        const p = F.product(l.id);
        return { id: l.id, qty: l.qty, options: l.options, name: F.productName(p), price: p.price };
      }),
      subtotal: sub,
      shipping: ship,
      total
    };
  }

  function validate(data) {
    const status = $("#ck-status");
    const need = ["name", "email", "address", "city", "zip", "country"];
    if (need.some((k) => !data[k])) return t("checkout.required");
    if (!F.validEmail(data.email)) return t("checkout.invalidEmail");
    if (!data.consent) return t("checkout.consentError");
    if (!F.cart.get().length) return t("checkout.emptyCart");
    status.hidden = true;
    return "";
  }

  function saveOrder(data) {
    const order = {
      number: F.orders.newNumber(),
      date: new Date().toISOString(),
      status: "received",
      ...data
    };
    F.orders.add(order);
    return order;
  }

  function success(order) {
    $("#checkout-success").hidden = false;
    form.hidden = true;
    $("#checkout-empty").hidden = true;
    F.cart.clear();
    $("#ok-body").textContent = t("checkout.success.body", { name: order.name, email: order.email });
    $("#ok-number").textContent = order.number;
  }

  function waText(data, number) {
    const items = data.items.map((i) => `• ${i.qty}× ${i.name} (${F.money(i.qty * i.price)})`).join("\n");
    return `${t("whatsapp.message")}\n\n${t("checkout.success.number")}: ${number}\n${data.name} · ${data.email}\n${data.address}, ${data.zip} ${data.city}\n${items}\n${t("cart.grandTotal")}: ${F.money(data.total)}`;
  }

  form.addEventListener("change", (e) => {
    if (e.target.name === "zone") zoneId = e.target.value;
    if (e.target.name === "pay") payId = e.target.value;
    summary();
    zones();
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = payloadFromForm();
    const err = validate(data);
    const status = $("#ck-status");
    if (err) {
      status.hidden = false;
      status.className = "form-status err";
      status.textContent = err;
      return;
    }
    const btn = $("#place-btn");
    btn.disabled = true;
    btn.textContent = t("checkout.placing");
    const order = saveOrder(data);
    try {
      await F.send({
        _subject: `Pedido ${order.number} — ${F.config.brand || "FORMA"}`,
        type: "order",
        ...data,
        number: order.number,
        items: data.items.map((i) => `${i.qty}× ${i.name}`).join(", ")
      });
      success(order);
    } catch (ex) {
      if (ex.message === "missing-config") {
        const wa = F.whatsappLink(waText(data, order.number));
        if (wa) {
          success(order);
          window.open(wa, "_blank", "noopener");
        } else {
          status.hidden = false;
          status.className = "form-status err";
          status.textContent = t("checkout.missingConfig");
          btn.disabled = false;
          btn.textContent = t("checkout.place");
        }
      } else {
        status.hidden = false;
        status.className = "form-status err";
        status.textContent = t("checkout.error");
        btn.disabled = false;
        btn.textContent = t("checkout.place");
      }
    }
  });

  $("#wa-order").addEventListener("click", (e) => {
    e.preventDefault();
    const data = payloadFromForm();
    const err = validate(data);
    if (err) {
      const status = $("#ck-status");
      status.hidden = false;
      status.className = "form-status err";
      status.textContent = err;
      return;
    }
    const order = saveOrder(data);
    const wa = F.whatsappLink(waText(data, order.number));
    success(order);
    if (wa) window.open(wa, "_blank", "noopener");
  });

  if (!F.cart.get().length) showEmpty();
  else render();
  F.on("cart", () => {
    if ($("#checkout-success").hidden) render();
  });
  F.on("render", () => {
    if ($("#checkout-success").hidden && F.cart.get().length) {
      zones();
      payments();
      summary();
    }
  });
})();
