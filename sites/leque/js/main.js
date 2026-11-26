/* Leque: o leque de serviços e cores, e o resto da página. Dados em js/cliente.js. */
(() => {
  const C = window.CLIENTE;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.add("js");

  $$("[data-c]").forEach((el) => { el.textContent = C[el.dataset.c]; });
  $$("[data-tel]").forEach((a) => { a.href = C.telefoneHref; });
  $$("[data-map]").forEach((a) => { a.href = C.mapa; });
  $$("[data-mail]").forEach((a) => { a.href = "mailto:" + C.email; });
  $("#year").textContent = new Date().getFullYear();

  function estado() {
    const e = C.estado();
    $("#now").textContent = e.curto + (e.longo ? " · " + e.longo : "");
    $("#dot").classList.toggle("open", e.aberto);
    $("#status").textContent = e.curto + (e.longo ? ", " + e.longo : "") + ".";
    $("#status").classList.toggle("open", e.aberto);
  }
  estado();
  setInterval(estado, 60000);

  /* cores das famílias e tons da casa */
  const FAM_COR = { "Cortes": "#d9a066", "Coloração": "#8e3b2f", "Tranças": "#2f4f4a", "Penteados": "#c46b7c", "Estética": "#b9a58a" };
  const TONS = [
    { nome: "Cobre", c: "#b4532a", desc: "Ruivo quente, com brilho de cobre ao sol." },
    { nome: "Mel", c: "#c99a4b", desc: "Loiro escuro dourado; fica bem em madeixas finas." },
    { nome: "Ameixa", c: "#5b2a46", desc: "Castanho com reflexo violeta, discreto à luz da sala." },
    { nome: "Grafite", c: "#3b3b40", desc: "Cinza frio para quem assume os brancos com estilo." },
    { nome: "Avelã", c: "#7a4f2e", desc: "Castanho médio, natural, ótimo para cobrir raiz." },
    { nome: "Rosa velho", c: "#c48b8f", desc: "Tonalizante pastel; dura quatro a seis lavagens." },
    { nome: "Areia", c: "#d8c3a0", desc: "Loiro bege, para balayage com pouca manutenção." },
    { nome: "Azeviche", c: "#141214", desc: "Preto profundo com brilho azulado." }
  ];
  const corGlobal = C.itens().find((i) => i.nome === "Coloração global");

  /* ───── o leque ───── */
  const blades = [];
  C.servicos.forEach((s, i) => {
    blades.push({ tipo: "Serviço", nome: s.nome, desc: s.desc, preco: s.preco, c: FAM_COR[s.nome] || "#888", fam: s.nome });
    if (TONS[i]) blades.push({ tipo: "Tom de coloração", nome: TONS[i].nome, desc: TONS[i].desc, preco: "desde " + C.euros(corGlobal.preco), c: TONS[i].c, tom: true });
  });
  const fan = $("#fan");
  const els = blades.map((b, i) => {
    const el = document.createElement("button");
    el.type = "button";
    el.className = "blade";
    el.style.setProperty("--c", b.c);
    el.style.zIndex = i;
    el.innerHTML = `<span>${esc(b.nome)}</span>`;
    el.setAttribute("aria-label", b.tipo + ": " + b.nome);
    el.addEventListener("click", () => pick(i));
    el.addEventListener("mouseenter", () => pick(i));
    fan.appendChild(el);
    return el;
  });
  let spread = 0, sel = 0, bias = 0;
  function layout() {
    const n = els.length;
    els.forEach((el, i) => {
      const a = -spread / 2 + (n > 1 ? (i / (n - 1)) * spread : 0) + bias;
      el.style.transform = `rotate(${a}deg) translateY(${i === sel ? -26 : 0}px)`;
      el.firstChild.style.transform = a < 0 ? "none" : "rotate(180deg)";
    });
  }
  const book = $("#k-book");
  function pick(i) {
    sel = i;
    els.forEach((el, k) => el.classList.toggle("sel", k === i));
    const b = blades[i];
    $("#k-kind").innerHTML = `<span class="chip" style="background:${b.c}"></span>${b.tipo}`;
    $("#k-name").textContent = b.nome;
    $("#k-desc").textContent = b.desc;
    $("#k-price").textContent = b.preco;
    if (b.tom) { book.textContent = "Marcar esta cor"; book.href = "#marcar"; book.dataset.svc = corGlobal.id; delete book.dataset.fam; }
    else { book.textContent = "Ver preços"; book.href = "#servicos"; book.dataset.fam = b.fam; delete book.dataset.svc; }
    layout();
  }
  pick(0);
  setTimeout(() => { spread = innerWidth < 760 ? 92 : 130; layout(); }, reduce ? 0 : 250);
  $("#inicio").addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse" || reduce) return;
    bias = ((e.clientX / innerWidth) - .5) * 12;
    layout();
  });

  /* ───── serviços ───── */
  $("#families").innerHTML = C.tabela.map((f, i) => {
    const min = Math.min(...f.itens.map((x) => x.preco));
    const resumo = C.servicos.find((s) => s.nome === f.familia);
    return `<details class="family rise" data-fam="${esc(f.familia)}" style="--c:${FAM_COR[f.familia] || "#888"}"${i === 0 ? " open" : ""}>
      <summary>
        <span class="sw" aria-hidden="true"></span>
        <h3>${esc(f.familia)}<small>${esc(resumo ? resumo.desc : "")}</small></h3>
        <span class="from">desde ${C.euros(min)}</span>
        <span class="plus" aria-hidden="true">+</span>
      </summary>
      <div class="items">${f.itens.map((x) => `
        <div class="item">
          <b>${esc(x.nome)}</b>
          <span>${esc(x.desc)}</span>
          <div class="row"><span><em>${C.euros(x.preco)}</em> <small>· ${C.duracao(x.min)}</small></span><a href="#marcar" data-svc="${esc(f.familia + "/" + x.nome)}" aria-label="Marcar ${esc(x.nome)}">Marcar</a></div>
        </div>`).join("")}
      </div>
    </details>`;
  }).join("");

  /* ───── paleta ───── */
  const pal = $("#palette"), toneCard = $("#tone-card");
  pal.innerHTML = TONS.map((t, i) =>
    `<button type="button" class="tone" role="listitem" style="--c:${t.c}" data-i="${i}" aria-pressed="${i === 0}" aria-label="${esc(t.nome)}"><span>${esc(t.nome)}</span></button>`).join("");
  function tom(i) {
    $$(".tone", pal).forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.i === i)));
    const t = TONS[i];
    toneCard.innerHTML = `<div><h3><span class="chip" style="background:${t.c}"></span>${esc(t.nome)}</h3><p>${esc(t.desc)} Coloração global desde ${C.euros(corGlobal.preco)}, cerca de ${C.duracao(corGlobal.min)}.</p></div>
      <a class="btn" href="#marcar" data-svc="${esc(corGlobal.id)}">Marcar esta cor</a>`;
  }
  pal.addEventListener("click", (e) => { const b = e.target.closest(".tone"); if (b) tom(+b.dataset.i); });
  pal.addEventListener("mouseover", (e) => { const b = e.target.closest(".tone"); if (b && matchMedia("(hover: hover)").matches) tom(+b.dataset.i); });
  tom(0);

  /* ───── equipa ───── */
  const DIAS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
  $("#team").innerHTML = C.equipa.map((p) => `
    <article class="person rise" style="--c:${p.cor}">
      <div class="avatar" aria-hidden="true">${esc(p.nome[0])}</div>
      <h3>${esc(p.nome)}</h3>
      <p>${esc(p.papel)}</p>
      <ul>${p.faz.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
      <p class="off">${p.folga.length ? "Folga à " + p.folga.map((d) => DIAS[d]).join(" e ") : "Todos os dias de abertura"}</p>
    </article>`).join("");

  /* ───── marcação ───── */
  const booking = window.Marcar.montar($("#booking"), { chave: "leque-marcacoes" });
  document.addEventListener("click", (e) => {
    const s = e.target.closest("[data-svc]");
    if (s) booking.escolher(s.dataset.svc);
    const f = e.target.closest("[data-fam]");
    if (f && f.id === "k-book") { const d = $(`.family[data-fam="${CSS.escape(f.dataset.fam)}"]`); if (d) d.open = true; }
  });

  /* ───── opiniões ───── */
  const qs = $("#quotes");
  qs.innerHTML = C.opinioes.map((o) => `<blockquote class="quote"><p>“${esc(o.texto)}”</p><cite>${esc(o.autor)}</cite></blockquote>`).join("");
  const quotes = $$(".quote", qs);
  let qi = 0, timer = null;
  function mostrar(i) {
    qi = (i + quotes.length) % quotes.length;
    quotes.forEach((q, k) => q.classList.toggle("on", k === qi));
    $("#q-count").textContent = `${qi + 1} / ${quotes.length}`;
  }
  const auto = () => { clearInterval(timer); if (!reduce) timer = setInterval(() => mostrar(qi + 1), 6500); };
  $("#q-prev").addEventListener("click", () => { mostrar(qi - 1); auto(); });
  $("#q-next").addEventListener("click", () => { mostrar(qi + 1); auto(); });
  mostrar(0); auto();

  /* ───── perguntas e horário ───── */
  $("#faq").innerHTML = C.perguntas.map((q) => `<details><summary>${esc(q.q)}</summary><p>${esc(q.a)}</p></details>`).join("");
  const ordem = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
  const hojeI = (new Date().getDay() + 6) % 7;
  $("#hours").innerHTML = C.horarioLinhas().map((l) => {
    const [de, ate] = l.dias.split(" a ");
    const a = ordem.indexOf(de), b = ate ? ordem.findIndex((d) => d.toLowerCase() === ate) : a;
    return `<div${hojeI >= a && hojeI <= b ? ' class="today"' : ""}><span>${esc(l.dias)}</span><b>${esc(l.horas)}</b></div>`;
  }).join("");

  /* ───── navegação ───── */
  const burger = $("#burger"), menu = $("#menu"), nav = $("#nav");
  burger.addEventListener("click", () => {
    const open = burger.getAttribute("aria-expanded") !== "true";
    burger.setAttribute("aria-expanded", String(open));
    menu.classList.toggle("open", open);
  });
  menu.addEventListener("click", (e) => {
    if (!e.target.closest("a")) return;
    burger.setAttribute("aria-expanded", "false");
    menu.classList.remove("open");
  });
  const onScroll = () => nav.classList.toggle("scrolled", scrollY > 20);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }), { threshold: 0.1 });
    $$(".rise").forEach((el, i) => { el.style.transitionDelay = (i % 5) * 60 + "ms"; io.observe(el); });

    const links = $$("a", menu);
    const spy = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) links.forEach((a) => a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id));
    }), { rootMargin: "-45% 0px -50% 0px" });
    links.forEach((a) => { const s = $(a.getAttribute("href")); if (s) spy.observe(s); });

    const fab = $("#float-cta"), hide = new Set();
    const fio = new IntersectionObserver((es) => {
      es.forEach((e) => (e.isIntersecting ? hide.add(e.target) : hide.delete(e.target)));
      fab.classList.toggle("hide", hide.size > 0);
    });
    fio.observe($("#inicio"));
    fio.observe($("#marcar"));
  } else {
    $$(".rise").forEach((el) => el.classList.add("in"));
  }
})();
