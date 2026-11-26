/* Archived copy: the live site ran on Next.js. This puts back the few
   interactions that worked without a server (menu, FAQ, theme). */
(() => {
  const root = document.documentElement;
  const KEY = "sj-archive-theme";
  const setTheme = (t) => {
    root.classList.toggle("dark", t === "dark");
    root.classList.toggle("light", t !== "dark");
    root.style.colorScheme = t;
  };
  try { const t = localStorage.getItem(KEY); if (t) setTheme(t); } catch (e) {}

  document.addEventListener("click", (e) => {
    const theme = e.target.closest('button[aria-label="Toggle theme"]');
    if (theme) {
      const t = root.classList.contains("dark") ? "light" : "dark";
      setTheme(t);
      try { localStorage.setItem(KEY, t); } catch (err) {}
      return;
    }
    const burger = e.target.closest('button[aria-label="Toggle menu"]');
    if (burger) {
      const m = document.querySelector("[data-sj-menu]");
      if (m) m.hidden = !m.hidden;
      return;
    }
    const q = e.target.closest("[data-sj-faq]");
    if (q) {
      const a = q.nextElementSibling;
      const open = a.hidden;
      document.querySelectorAll("[data-sj-faq]").forEach((b) => {
        b.nextElementSibling.hidden = true;
        b.querySelector("svg")?.classList.remove("rotate-180");
      });
      a.hidden = !open;
      q.querySelector("svg")?.classList.toggle("rotate-180", open);
    }
  });

  document.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    if (f.querySelector(".sj-note")) return;
    f.insertAdjacentHTML("beforeend", '<p class="sj-note">This is an archived copy, so sign-up and sign-in are switched off.</p>');
  });
})();
