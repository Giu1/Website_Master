/* FORMA policy pages */
(() => {
  const F = window.FORMA;
  const { t, esc } = F;
  const key = document.body.dataset.policy || "privacy";
  const root = document.getElementById("policy-root");
  if (!root) return;

  function render() {
    const pack = t(`policy.${key}`);
    const title = pack && pack.title ? pack.title : t(`pages.${key}`);
    document.title = `${title} | ${F.config.brand || "FORMA"}`;
    const h1 = document.getElementById("policy-title");
    if (h1) h1.textContent = title;
    const updated = document.getElementById("policy-updated");
    if (updated) updated.textContent = `${t("policy.updated")}: ${F.config.shopYear || "2026"}`;
    const sections = (pack && pack.sections) || [];
    root.innerHTML = sections.map((s) => `<h2>${esc(s.h)}</h2><p>${esc(s.p)}</p>`).join("");
  }

  render();
  F.on("render", render);
})();
