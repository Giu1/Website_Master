(function () {
  const P = window.PROPOSTA;
  const $ = (id) => document.getElementById(id);
  const list = P.amostras;

  $("brand-name").textContent = P.estudio;
  $("brand").href = P.estudioUrl || "#";
  $("top-line").textContent = P.linhaTopo;
  $("title").textContent = P.titulo;
  $("intro").innerHTML = P.intro;
  $("foot").textContent = P.rodape || "";
  document.title = P.titulo.replace(/\.$/, "");

  /* Cartões. Sem "thumb", mostra a própria página em miniatura. */
  const picker = $("picker");
  const cards = list.map((a, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "pick";
    b.setAttribute("role", "radio");
    b.dataset.i = i;
    const thumb = document.createElement("span");
    thumb.className = "thumb";
    if (a.thumb) {
      const img = new Image();
      img.alt = "";
      img.loading = "lazy";
      img.src = a.thumb;
      img.onerror = () => { img.remove(); liveThumb(thumb, a.url); };
      thumb.appendChild(img);
    } else {
      liveThumb(thumb, a.url);
    }
    const t = document.createElement("b");
    t.textContent = (i + 1) + " · " + a.nome;
    const s = document.createElement("small");
    s.textContent = a.resumo;
    b.append(thumb, t, s);
    b.addEventListener("click", () => select(i, true));
    picker.appendChild(b);
    return b;
  });

  function liveThumb(box, url) {
    const f = document.createElement("iframe");
    f.src = url;
    f.loading = "lazy";
    f.tabIndex = -1;
    f.setAttribute("aria-hidden", "true");
    box.appendChild(f);
    const fit = () => { f.style.transform = "scale(" + box.clientWidth / 1280 + ")"; };
    fit();
    new ResizeObserver(fit).observe(box);
  }

  /* Escolha */
  let cur = -1;
  function select(i, push) {
    i = (i + list.length) % list.length;
    if (i === cur) return;
    cur = i;
    const a = list[i];
    cards.forEach((c, k) => {
      c.setAttribute("aria-checked", k === i ? "true" : "false");
      c.tabIndex = k === i ? 0 : -1;
    });
    $("frame").src = a.url;
    $("open-full").href = a.url;
    $("chrome-url").textContent = "Amostra " + (i + 1) + " · " + a.nome;
    $("p-name").textContent = a.nome;
    $("p-desc").textContent = a.descricao;
    $("p-move").textContent = a.movimento;
    $("p-tech").textContent = a.tecnica;
    $("count").textContent = (i + 1) + " de " + list.length;
    if (push) {
      history.replaceState(null, "", "#" + a.id);
      cards[i].scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
    }
  }

  picker.addEventListener("keydown", (e) => {
    const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!d) return;
    e.preventDefault();
    select(cur + d, true);
    cards[cur].focus();
  });
  $("prev").addEventListener("click", () => select(cur - 1, true));
  $("next").addEventListener("click", () => select(cur + 1, true));

  /* Computador / Telemóvel */
  const stage = $("stage");
  const devBtns = document.querySelectorAll(".device button");
  function setDevice(d) {
    stage.dataset.device = d;
    devBtns.forEach((b) => b.setAttribute("aria-pressed", b.dataset.device === d ? "true" : "false"));
    try { localStorage.setItem("amostras-device", d); } catch (e) {}
  }
  devBtns.forEach((b) => b.addEventListener("click", () => setDevice(b.dataset.device)));
  let saved = null;
  try { saved = localStorage.getItem("amostras-device"); } catch (e) {}
  setDevice(saved || (matchMedia("(max-width: 640px)").matches ? "mobile" : "desktop"));

  const fromHash = () => list.findIndex((a) => a.id === location.hash.slice(1));
  select(Math.max(0, fromHash()), false);
  addEventListener("hashchange", () => { const i = fromHash(); if (i >= 0) select(i, false); });
})();
