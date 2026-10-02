/* FORMA contact page */
(() => {
  const F = window.FORMA;
  const { t, esc } = F;
  const $ = (s) => document.querySelector(s);

  function info() {
    const wa = F.whatsappLink();
    const cfg = F.config;
    $("#contact-info").innerHTML = `
      <h2>${t("contact.info")}</h2>
      <ul>
        ${cfg.contactEmail ? `<li><i class="ri-mail-line"></i><div><span>${t("contact.emailLabel")}</span><a href="mailto:${esc(cfg.contactEmail)}">${esc(cfg.contactEmail)}</a></div></li>` : ""}
        ${wa ? `<li><i class="ri-whatsapp-line"></i><div><span>${t("contact.whatsappLabel")}</span><a href="${wa}" target="_blank" rel="noreferrer">+${esc(cfg.whatsapp)}</a></div></li>` : ""}
        <li><i class="ri-time-line"></i><div><span>${t("contact.hours")}</span>${t("contact.hoursValue")}</div></li>
        <li><i class="ri-map-pin-line"></i><div><span>${t("contact.location")}</span>${t("contact.locationValue")}</div></li>
      </ul>`;
  }

  function faq() {
    const items = t("contact.faq.items");
    const list = Array.isArray(items) ? items : [];
    $("#faq-list").innerHTML = list
      .map((x) => `<details><summary>${esc(x.q)}</summary><p>${esc(x.a)}</p></details>`)
      .join("");
  }

  function render() {
    info();
    faq();
    const subjects = t("contact.subjects");
    const sel = $("#contact-subject");
    const cur = sel.value;
    sel.innerHTML = Object.keys(subjects)
      .map((k) => `<option value="${k}">${esc(subjects[k])}</option>`)
      .join("");
    if ([...sel.options].some((o) => o.value === cur)) sel.value = cur;
  }

  $("#contact-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const status = $("#contact-status");
    const fd = new FormData(e.target);
    const name = String(fd.get("name") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const message = String(fd.get("message") || "").trim();
    if (!name || !email || !message) {
      status.hidden = false;
      status.className = "form-status err";
      status.textContent = t("checkout.required");
      return;
    }
    if (!F.validEmail(email)) {
      status.hidden = false;
      status.className = "form-status err";
      status.textContent = t("checkout.invalidEmail");
      return;
    }
    const btn = e.target.querySelector("[type=submit]");
    btn.disabled = true;
    btn.textContent = t("contact.sending");
    try {
      await F.send({
        _subject: `Contacto FORMA — ${fd.get("subject")}`,
        type: "contact",
        name,
        email,
        subject: fd.get("subject"),
        message
      });
      status.hidden = false;
      status.className = "form-status ok";
      status.textContent = t("contact.success");
      e.target.reset();
    } catch (err) {
      status.hidden = false;
      status.className = "form-status err";
      status.textContent = err.message === "missing-config" ? t("contact.missingConfig") : t("contact.error");
    }
    btn.disabled = false;
    btn.textContent = t("contact.send");
  });

  render();
  F.on("render", render);
})();
