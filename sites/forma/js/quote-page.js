/* FORMA quote page glue */
(() => {
  const F = window.FORMA;
  const { t } = F;
  const form = document.getElementById("waitlist-form");

  function fill() {
    window.FORMA_QUOTE?.refresh?.();
  }

  if (window.FORMA_QUOTE) window.FORMA_QUOTE.init();
  F.on("render", fill);

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const status = document.getElementById("quote-form-status");
    const email = e.target.email.value.trim();
    if (!F.validEmail(email)) {
      status.hidden = false;
      status.className = "form-status err";
      status.textContent = t("checkout.invalidEmail");
      return;
    }
    if (!e.target.consent.checked) {
      status.hidden = false;
      status.className = "form-status err";
      status.textContent = t("checkout.consentError");
      return;
    }
    const btn = e.target.querySelector("[type=submit]");
    btn.disabled = true;
    try {
      await F.send({
        _subject: "Orçamento FORMA",
        type: "quote",
        email,
        summary: document.getElementById("quote-summary")?.value || window.FORMA_QUOTE?.getSummary?.() || ""
      });
      status.hidden = false;
      status.className = "form-status ok";
      status.textContent = t("waitlist.success");
      e.target.reset();
    } catch (err) {
      status.hidden = false;
      status.className = "form-status err";
      status.textContent = err.message === "missing-config" ? t("contact.missingConfig") : t("contact.error");
    }
    btn.disabled = false;
  });
})();
