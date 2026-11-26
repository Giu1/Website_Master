/* Rótulo: preenche o rótulo a partir de js/cliente.js. */
(() => {
  const C = window.CLIENTE;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.add("js");

  $$("[data-c]").forEach((el) => { el.textContent = C[el.dataset.c]; });
  $$("[data-tel]").forEach((a) => { a.href = C.telefoneHref; });
  $$("[data-map]").forEach((a) => { a.href = C.mapa; });
  $$("[data-mail]").forEach((a) => { a.href = "mailto:" + C.email; });
  $("#year").textContent = new Date().getFullYear();

  /* estado: rótulo, barra e contacto */
  function estado() {
    const e = C.estado();
    $("#st1").textContent = e.curto;
    $("#st2").textContent = e.longo;
    $("#badge").classList.toggle("closed", !e.aberto);
    $("#dot").classList.toggle("open", e.aberto);
    $("#status").textContent = e.curto + (e.longo ? " · " + e.longo : "");
    $("#status").classList.toggle("open", e.aberto);
  }
  estado();
  setInterval(estado, 60000);

  /* números do rótulo, contados a partir dos dados */
  const itens = C.itens();
  const abertos = C.horario.filter((h) => h.abre);
  const horas = Math.round(abertos.reduce((t, h) => t + C.minutos(h.fecha) - C.minutos(h.abre), 0) / 60);
  const facts = [
    [itens.length, "", "serviços na tabela"],
    [abertos.length, "", "dias por semana"],
    [horas, " h", "abertas por semana"],
    [Math.min(...itens.map((i) => i.preco)), " €", "preço mais baixo"]
  ];
  $("#facts").innerHTML = facts.map(([n, u, l]) =>
    `<div class="cell fact"><b data-n="${n}" data-u="${u}">${n}${u}</b><span class="mono">${l}</span></div>`).join("");

  function contar(el) {
    const n = +el.dataset.n, u = el.dataset.u;
    if (reduced) return;
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / 900);
      el.textContent = Math.round(n * (1 - Math.pow(1 - p, 3))) + u;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* tabela por família, com filtro */
  const fams = $("#families"), filter = $("#filter");
  fams.innerHTML = C.tabela.map((f) => {
    const precos = f.itens.map((i) => i.preco);
    return `<div class="cell fam" data-fam="${esc(f.familia)}">
      <h3>${esc(f.familia)} <span class="mono">${C.euros(Math.min(...precos))}–${C.euros(Math.max(...precos))}</span></h3>
      ${f.itens.map((i) => `<div class="svc">
        <span>${esc(i.nome)}<small>${esc(i.desc)}</small></span>
        <span class="t mono">${C.duracao(i.min)}</span>
        <span class="p">${C.euros(i.preco)}</span>
        <a class="mono" href="#marcar" data-svc="${esc(f.familia + "/" + i.nome)}" aria-label="Marcar ${esc(i.nome)}">Marcar</a>
      </div>`).join("")}
    </div>`;
  }).join("");
  filter.innerHTML = ["Tudo"].concat(C.tabela.map((f) => f.familia))
    .map((n, i) => `<button type="button" data-f="${esc(n)}" aria-pressed="${i === 0}">${esc(n)}</button>`).join("");
  function filtrar(nome) {
    $$("button", filter).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.f === nome)));
    const cards = $$(".fam", fams);
    cards.forEach((c) => { c.hidden = nome !== "Tudo" && c.dataset.fam !== nome; });
    fams.classList.toggle("one", nome !== "Tudo");
    // a última linha da grelha não leva borda de baixo
    const vis = cards.filter((c) => !c.hidden);
    const cols = matchMedia("(max-width: 760px)").matches || nome !== "Tudo" ? 1 : 2;
    const lastRow = vis.length % cols === 1 && cols === 2 ? 1 : cols;
    vis.forEach((c, i) => c.classList.toggle("last-row", i >= vis.length - lastRow));
  }
  filter.addEventListener("click", (e) => { const b = e.target.closest("[data-f]"); if (b) filtrar(b.dataset.f); });
  filtrar("Tudo");
  addEventListener("resize", () => filtrar($("[aria-pressed=true]", filter).dataset.f));

  /* composição */
  $("#sobre").innerHTML = C.sobre.map((p) => `<p>${esc(p)}</p>`).join("");
  const anos = new Date().getFullYear() - C.desde;
  $("#contem").innerHTML = [
    ["Anos na Rua da Sofia", anos],
    ["Cadeiras", C.equipa.length],
    ["Famílias de serviços", C.tabela.length],
    ["Coloração com amoníaco", "0%"],
    ["Teste de alergia antes da 1.ª cor", "48 h"],
    ["Pagamento", "Cartão · MB WAY · dinheiro"]
  ].map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join("");

  /* equipa */
  const DIAS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
  $("#team").innerHTML = C.equipa.map((p) => `
    <article class="cell member">
      <div class="mono-big" style="--c:${p.cor}" aria-hidden="true">${esc(p.nome.split(" ").map((w) => w[0]).join(""))}</div>
      <h3>${esc(p.nome)}</h3>
      <p>${esc(p.papel)}</p>
      <dl>
        <div><dt>Faz</dt><dd>${p.faz.map(esc).join(", ")}</dd></div>
        <div><dt>Folga</dt><dd>${p.folga.length ? p.folga.map((d) => DIAS[d]).join(", ") : "—"}</dd></div>
      </dl>
      <a class="mono member-book" href="#marcar" data-pessoa="${esc(p.nome)}">Marcar com ${esc(p.nome.split(" ")[0])} →</a>
    </article>`).join("");

  /* marcação */
  const booking = window.Marcar.montar($("#booking"), { chave: "rotulo-marcacoes" });
  document.addEventListener("click", (e) => {
    const s = e.target.closest("[data-svc]");
    if (s) booking.escolher(s.dataset.svc);
    const p = e.target.closest("[data-pessoa]");
    if (p) $(`.bk-who [data-p="${CSS.escape(p.dataset.pessoa)}"]`, booking)?.click();
  });

  /* opiniões */
  $("#quotes").innerHTML = C.opinioes.map((o, i) => `
    <figure class="cell quote">
      <p>“${esc(o.texto)}”</p>
      <footer class="mono"><span>${esc(o.autor)}</span><span class="ok">✓ QC-0${i + 1}</span></footer>
    </figure>`).join("");

  /* perguntas */
  $("#faq").innerHTML = C.perguntas.map((q, i) => `
    <details><summary><span class="n mono">${String(i + 1).padStart(2, "0")}</span><b>${esc(q.q)}</b></summary><p>${esc(q.a)}</p></details>`).join("");

  /* horário */
  const hoje = new Date().getDay();
  const ordem = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
  const hojeI = (hoje + 6) % 7;
  $("#hours").innerHTML = C.horarioLinhas().map((l) => {
    const [de, ate] = l.dias.split(" a ");
    const a = ordem.indexOf(de), b = ate ? ordem.findIndex((d) => d.toLowerCase() === ate) : a;
    return `<tr${hojeI >= a && hojeI <= b ? ' class="today"' : ""}><td>${esc(l.dias)}${hojeI >= a && hojeI <= b ? "<small>hoje</small>" : ""}</td><td>${esc(l.horas)}</td></tr>`;
  }).join("");

  /* menu */
  const burger = $("#burger"), menu = $("#menu");
  burger.addEventListener("click", () => {
    const open = burger.getAttribute("aria-expanded") !== "true";
    burger.setAttribute("aria-expanded", String(open));
    burger.textContent = open ? "Fechar" : "Menu";
    menu.classList.toggle("open", open);
  });
  menu.addEventListener("click", (e) => {
    if (!e.target.closest("a")) return;
    burger.setAttribute("aria-expanded", "false");
    burger.textContent = "Menu";
    menu.classList.remove("open");
  });

  /* réguas que se desenham, números que contam, link ativo, botão flutuante */
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      if (e.target.dataset.n) contar(e.target);
      io.unobserve(e.target);
    }), { threshold: 0.3 });
    $$(".rule, [data-n]").forEach((el) => io.observe(el));

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
    fio.observe($("#topo"));
    fio.observe($("#marcar"));
  } else {
    $$(".rule").forEach((r) => r.classList.add("in"));
  }
})();
