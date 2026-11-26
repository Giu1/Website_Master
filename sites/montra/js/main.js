/* Montra: a fachada, a prateleira, o quadro de preços e o resto da página.
   Todo o conteúdo vem de js/cliente.js. */
(() => {
  const C = window.CLIENTE;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.add("js");

  /* dados simples */
  $$("[data-c]").forEach((el) => { el.textContent = C[el.dataset.c]; });
  $$("[data-tel]").forEach((a) => { a.href = C.telefoneHref; });
  $$("[data-map]").forEach((a) => { a.href = C.mapa; });
  $$("[data-mail]").forEach((a) => { a.href = "mailto:" + C.email; });
  $("#year").textContent = new Date().getFullYear();

  /* placa da porta: Aberto / Fechado, a sério */
  const sign = $("#sign"), note = $("#sign-note");
  function placa() {
    const e = C.estado();
    sign.classList.toggle("closed", !e.aberto);
    sign.setAttribute("aria-label", e.curto + ", " + e.longo);
    note.textContent = e.longo ? e.curto + " · " + e.longo : e.curto;
    const st = $("#status");
    st.textContent = e.curto + (e.longo ? ", " + e.longo : "");
    st.classList.toggle("open", e.aberto);
  }
  placa();
  setInterval(placa, 60000);
  // tocar na placa vira-a por um instante
  const virar = () => { sign.classList.toggle("closed"); setTimeout(placa, 1400); };
  sign.addEventListener("click", virar);
  sign.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); virar(); } });

  /* prateleira: um frasco por família */
  const CORES = ["#b23a2b", "#c98a3c", "#8e3b2f", "#c46b7c", "#2f4f4a"];
  $("#shelf").innerHTML = C.servicos.map((s, i) => `
    <a class="jar" href="#servicos" data-fam="${esc(s.nome)}" style="--c:${CORES[i % CORES.length]};--fill:${45 + ((i * 17) % 35)}%">
      <span class="jar-lid" aria-hidden="true"></span>
      <span class="jar-glass"><span class="jar-label">${esc(s.nome)}<small>${esc(s.preco)}</small></span></span>
      <p>${esc(s.desc)}</p>
    </a>`).join("");

  /* quadro de preços com separadores */
  const tabs = $("#tabs"), board = $("#board");
  let fam = C.tabela[0].familia;
  tabs.innerHTML = C.tabela.map((f, i) =>
    `<button type="button" role="tab" id="tab-${i}" aria-controls="board" aria-selected="${f.familia === fam}">${esc(f.familia)}</button>`).join("");
  function quadro() {
    const f = C.tabela.find((x) => x.familia === fam);
    $$("button", tabs).forEach((b) => {
      const on = b.textContent === fam;
      b.setAttribute("aria-selected", String(on));
      b.tabIndex = on ? 0 : -1;
      if (on) board.setAttribute("aria-labelledby", b.id);
    });
    board.innerHTML = `<h3>${esc(f.familia)}</h3>` + f.itens.map((i) => `
      <div class="price-row">
        <span><b>${esc(i.nome)}</b><small>${esc(i.desc)}</small></span>
        <i aria-hidden="true"></i>
        <em>${C.euros(i.preco)}</em>
        <a href="#marcar" data-svc="${esc(f.familia + "/" + i.nome)}" aria-label="Marcar ${esc(i.nome)}">Marcar</a>
        <span class="dur">cerca de ${C.duracao(i.min)}</span>
      </div>`).join("") +
      `<p class="board-note">Preços para cabelo médio. Cabelo comprido ou muito volume pode acrescentar 10–20%; dizemos sempre antes.</p>`;
  }
  tabs.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) { fam = b.textContent; quadro(); } });
  tabs.addEventListener("keydown", (e) => {
    if (!["ArrowLeft", "ArrowRight"].includes(e.key)) return;
    const i = C.tabela.findIndex((x) => x.familia === fam);
    const n = (i + (e.key === "ArrowRight" ? 1 : -1) + C.tabela.length) % C.tabela.length;
    fam = C.tabela[n].familia; quadro(); $$("button", tabs)[n].focus();
  });
  quadro();

  // um frasco abre a família certa no quadro
  $("#shelf").addEventListener("click", (e) => {
    const j = e.target.closest("[data-fam]"); if (!j) return;
    if (C.tabela.some((f) => f.familia === j.dataset.fam)) { fam = j.dataset.fam; quadro(); }
  });

  /* o salão */
  $("#sobre").innerHTML = C.sobre.map((p) => `<p>${esc(p)}</p>`).join("");
  const anos = new Date().getFullYear() - C.desde;
  $("#numbers").innerHTML = [
    [anos, "anos na Rua da Sofia"],
    [C.equipa.length, "pessoas na equipa"],
    [C.itens().length, "serviços na tabela"]
  ].map(([n, t]) => `<div><dt data-n="${n}">${n}</dt><dd>${esc(t)}</dd></div>`).join("");

  /* equipa */
  const DIAS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
  const CABELO = ["#5a2d1c", "#1c1410", "#120c0a", "#a5652f"];
  $("#team").innerHTML = C.equipa.map((p, i) => `
    <article class="person">
      <div class="portrait" style="--c:${p.cor};--hair:${CABELO[i % CABELO.length]}" aria-hidden="true"></div>
      <h3>${esc(p.nome)}</h3>
      <p class="role">${esc(p.papel)}</p>
      <ul class="tags">${p.faz.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
      <p class="off">${p.folga.length ? "Folga à " + p.folga.map((d) => DIAS[d]).join(" e ") : "Todos os dias de abertura"}</p>
    </article>`).join("");

  /* marcação */
  const booking = window.Marcar.montar($("#booking"), { chave: "montra-marcacoes" });
  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-svc]"); if (!a) return;
    booking.escolher(a.dataset.svc);
  });

  /* bilhetes */
  const ROT = [-2.2, 1.6, -1, 2.4];
  $("#notes").innerHTML = C.opinioes.map((o, i) =>
    `<figure class="note" style="--r:${ROT[i % ROT.length]}deg"><p>“${esc(o.texto)}”</p><cite>${esc(o.autor)}</cite></figure>`).join("");

  /* perguntas */
  $("#faq").innerHTML = C.perguntas.map((q) => `<details><summary>${esc(q.q)}</summary><p>${esc(q.a)}</p></details>`).join("");

  /* horário */
  const hoje = C.horario[new Date().getDay()].dia;
  $("#hours").innerHTML = C.horarioLinhas().map((l) => {
    const dias = l.dias.split(" a ");
    const ordem = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
    const de = ordem.indexOf(dias[0]), ate = dias[1] ? ordem.findIndex((d) => d.toLowerCase() === dias[1]) : de;
    const eHoje = ordem.indexOf(hoje) >= de && ordem.indexOf(hoje) <= ate;
    return `<div${eHoje ? ' class="today"' : ""}><span>${esc(l.dias)}</span><span>${esc(l.horas)}</span></div>`;
  }).join("");

  /* menu e cabeçalho */
  const burger = $("#burger"), menu = $("#menu"), top = $("#top");
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
  const onScroll = () => top.classList.toggle("scrolled", scrollY > 30);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* secções a aparecer, link ativo, botão flutuante */
  if ("IntersectionObserver" in window && !reduced) {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }), { threshold: 0.12 });
    $$(".reveal").forEach((s) => io.observe(s));
  } else {
    $$(".reveal").forEach((s) => s.classList.add("in"));
  }

  const links = $$("a", menu);
  const secs = links.map((a) => $(a.getAttribute("href"))).filter(Boolean);
  const spy = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    links.forEach((a) => a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id));
  }), { rootMargin: "-45% 0px -50% 0px" });
  secs.forEach((s) => spy.observe(s));

  const fab = $("#float-cta");
  const hide = new Set();
  const fabIO = new IntersectionObserver((es) => {
    es.forEach((e) => (e.isIntersecting ? hide.add(e.target) : hide.delete(e.target)));
    fab.classList.toggle("hide", hide.size > 0);
  });
  fabIO.observe($("#marcar"));
  fabIO.observe($("#inicio"));
})();
