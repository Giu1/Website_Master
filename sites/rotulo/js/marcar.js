/* Marcação no site: serviço → pessoa → dia → hora → nome e telemóvel.
   Não há servidor: a marcação fica guardada neste navegador e aparece em "As suas marcações".
   O aspeto vem do CSS de cada site (classes .bk-*); aqui só há estrutura e regras.

   Marcar.montar(elemento, { chave: "montra-marcacoes" }) */
window.Marcar = (() => {
  const C = window.CLIENTE;
  const DIAS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
  const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const iso = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");

  function ler(chave) { try { return JSON.parse(localStorage.getItem(chave)) || []; } catch { return []; } }
  function gravar(chave, v) { try { localStorage.setItem(chave, JSON.stringify(v)); } catch { /* sem armazenamento: fica só nesta visita */ } }

  /* Ocupação de exemplo, sempre igual para o mesmo dia e pessoa, para a agenda não parecer vazia */
  function ocupado(dia, pessoa, minuto) {
    let h = 0;
    const s = dia + pessoa + minuto;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h % 100 < 32;
  }

  function montar(raiz, opcoes) {
    const chave = opcoes.chave;
    const itens = C.itens();
    let minhas = ler(chave);
    const st = { item: null, pessoa: "qualquer", dia: null, hora: null };

    raiz.classList.add("bk");
    raiz.innerHTML = `
      <ol class="bk-steps">
        <li class="bk-step" data-s="1">
          <h4><span>1</span> Serviço</h4>
          <select class="bk-svc" aria-label="Serviço">
            <option value="">Escolha um serviço…</option>
            ${C.tabela.map((f) => `<optgroup label="${esc(f.familia)}">${f.itens.map((i) =>
              `<option value="${esc(f.familia + "/" + i.nome)}">${esc(i.nome)} · ${C.euros(i.preco)} · ${C.duracao(i.min)}</option>`).join("")}</optgroup>`).join("")}
          </select>
        </li>
        <li class="bk-step" data-s="2">
          <h4><span>2</span> Com quem</h4>
          <div class="bk-who" role="radiogroup" aria-label="Com quem"></div>
        </li>
        <li class="bk-step" data-s="3">
          <h4><span>3</span> Dia</h4>
          <div class="bk-days" role="radiogroup" aria-label="Dia"></div>
        </li>
        <li class="bk-step" data-s="4">
          <h4><span>4</span> Hora</h4>
          <div class="bk-slots" role="radiogroup" aria-label="Hora"><p class="bk-hint">Escolha primeiro o serviço e o dia.</p></div>
        </li>
        <li class="bk-step" data-s="5">
          <h4><span>5</span> Os seus dados</h4>
          <form class="bk-form" novalidate>
            <label><span>Nome</span><input name="nome" autocomplete="name" required></label>
            <label><span>Telemóvel</span><input name="tel" type="tel" inputmode="tel" autocomplete="tel" required placeholder="9xx xxx xxx"></label>
            <p class="bk-sum" aria-live="polite"></p>
            <p class="bk-err" role="alert"></p>
            <button class="bk-go" type="submit">Marcar</button>
          </form>
        </li>
      </ol>
      <div class="bk-done" hidden role="status"></div>
      <div class="bk-mine"></div>`;

    const $ = (s) => raiz.querySelector(s);
    const svc = $(".bk-svc"), who = $(".bk-who"), days = $(".bk-days"), slots = $(".bk-slots");
    const form = $(".bk-form"), sum = $(".bk-sum"), err = $(".bk-err"), done = $(".bk-done"), mine = $(".bk-mine");

    function equipaPara(item) {
      return C.equipa.filter((p) => !item || p.faz.includes(item.familia));
    }

    function pintarPessoas() {
      const gente = equipaPara(st.item);
      if (st.pessoa !== "qualquer" && !gente.some((p) => p.nome === st.pessoa)) st.pessoa = "qualquer";
      who.innerHTML = [`<button type="button" role="radio" data-p="qualquer" aria-checked="${st.pessoa === "qualquer"}"><i style="--c:#888">?</i>Qualquer pessoa</button>`]
        .concat(gente.map((p) => `<button type="button" role="radio" data-p="${esc(p.nome)}" aria-checked="${st.pessoa === p.nome}"><i style="--c:${p.cor}">${esc(p.nome[0])}</i>${esc(p.nome.split(" ")[0])}</button>`))
        .join("");
    }

    function proximosDias() {
      const out = [];
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      for (let i = 0; out.length < 12 && i < 30; i++) {
        const x = new Date(d);
        x.setDate(d.getDate() + i);
        if (C.horario[x.getDay()].abre) out.push(x);
      }
      return out;
    }

    function pintarDias() {
      const lista = proximosDias();
      if (!st.dia) st.dia = iso(lista[0]);
      days.innerHTML = lista.map((d) => {
        const k = iso(d);
        return `<button type="button" role="radio" data-d="${k}" aria-checked="${st.dia === k}"><small>${DIAS[d.getDay()]}</small><b>${d.getDate()}</b><small>${MESES[d.getMonth()]}</small></button>`;
      }).join("");
    }

    function livres() {
      if (!st.item || !st.dia) return [];
      const d = new Date(st.dia + "T00:00");
      const h = C.horario[d.getDay()];
      if (!h.abre) return [];
      const agora = new Date();
      const hoje = iso(agora) === st.dia;
      const n = agora.getHours() * 60 + agora.getMinutes();
      const gente = equipaPara(st.item).filter((p) => !p.folga.includes(d.getDay()) && (st.pessoa === "qualquer" || p.nome === st.pessoa));
      const out = [];
      for (let m = C.minutos(h.abre); m + st.item.min <= C.minutos(h.fecha); m += 30) {
        if (hoje && m <= n + 30) continue;
        const pessoa = gente.find((p) => !ocupado(st.dia, p.nome, m) && !minhas.some((b) => b.dia === st.dia && b.hora === C.hhmm(m) && b.pessoa === p.nome));
        if (pessoa) out.push({ hora: C.hhmm(m), pessoa: pessoa.nome });
      }
      return out;
    }

    function pintarHoras() {
      if (!st.item) { slots.innerHTML = `<p class="bk-hint">Escolha primeiro o serviço.</p>`; return; }
      const l = livres();
      if (st.hora && !l.some((s) => s.hora === st.hora)) st.hora = null;
      slots.innerHTML = l.length
        ? l.map((s) => `<button type="button" role="radio" data-h="${s.hora}" data-who="${esc(s.pessoa)}" aria-checked="${st.hora === s.hora}">${s.hora.replace(":", "h")}</button>`).join("")
        : `<p class="bk-hint">Sem horas livres neste dia${st.pessoa !== "qualquer" ? " com " + esc(st.pessoa.split(" ")[0]) : ""}. Experimente outro dia.</p>`;
      resumo();
    }

    function resumo() {
      if (!st.item || !st.hora) { sum.textContent = ""; return; }
      const d = new Date(st.dia + "T00:00");
      const quem = slots.querySelector(`[data-h="${st.hora}"]`)?.dataset.who || st.pessoa;
      sum.textContent = `${st.item.nome} com ${quem.split(" ")[0]}, ${C.horario[d.getDay()].dia.toLowerCase()} ${d.getDate()} de ${MESES[d.getMonth()]} às ${st.hora.replace(":", "h")}. ${C.euros(st.item.preco)}, cerca de ${C.duracao(st.item.min)}.`;
    }

    function pintarMinhas() {
      const hoje = iso(new Date());
      minhas = minhas.filter((b) => b.dia >= hoje);
      gravar(chave, minhas);
      if (!minhas.length) { mine.innerHTML = ""; return; }
      mine.innerHTML = `<h4>As suas marcações</h4><ul>${minhas.map((b, i) => {
        const d = new Date(b.dia + "T00:00");
        return `<li><span><b>${esc(b.servico)}</b> · ${C.horario[d.getDay()].dia} ${d.getDate()} ${MESES[d.getMonth()]}, ${b.hora.replace(":", "h")} · ${esc(b.pessoa.split(" ")[0])}</span><button type="button" data-x="${i}">Desmarcar</button></li>`;
      }).join("")}</ul>`;
    }

    svc.addEventListener("change", () => {
      st.item = itens.find((i) => i.id === svc.value) || null;
      st.hora = null;
      pintarPessoas();
      pintarHoras();
    });
    who.addEventListener("click", (e) => {
      const b = e.target.closest("[data-p]"); if (!b) return;
      st.pessoa = b.dataset.p; pintarPessoas(); pintarHoras();
    });
    days.addEventListener("click", (e) => {
      const b = e.target.closest("[data-d]"); if (!b) return;
      st.dia = b.dataset.d; pintarDias(); pintarHoras();
    });
    slots.addEventListener("click", (e) => {
      const b = e.target.closest("[data-h]"); if (!b) return;
      st.hora = b.dataset.h;
      slots.querySelectorAll("[data-h]").forEach((x) => x.setAttribute("aria-checked", String(x === b)));
      resumo();
    });
    mine.addEventListener("click", (e) => {
      const b = e.target.closest("[data-x]"); if (!b) return;
      minhas.splice(Number(b.dataset.x), 1);
      gravar(chave, minhas);
      pintarMinhas(); pintarHoras();
    });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const nome = form.nome.value.trim();
      const tel = form.tel.value.replace(/\s/g, "");
      err.textContent = "";
      if (!st.item) return (err.textContent = "Falta escolher o serviço.");
      if (!st.hora) return (err.textContent = "Falta escolher a hora.");
      if (nome.length < 2) { form.nome.focus(); return (err.textContent = "Escreva o seu nome."); }
      if (!/^(\+351)?9\d{8}$/.test(tel)) { form.tel.focus(); return (err.textContent = "O telemóvel tem 9 dígitos e começa por 9."); }
      const pessoa = slots.querySelector(`[data-h="${st.hora}"]`).dataset.who;
      const b = { servico: st.item.nome, dia: st.dia, hora: st.hora, pessoa, nome, tel };
      minhas.push(b);
      minhas.sort((a, c) => (a.dia + a.hora).localeCompare(c.dia + c.hora));
      gravar(chave, minhas);
      done.hidden = false;
      done.innerHTML = `<b>Marcado.</b> ${esc(sum.textContent)} Enviamos a confirmação por SMS para ${esc(form.tel.value.trim())}.`;
      st.hora = null;
      form.reset();
      pintarHoras();
      pintarMinhas();
      done.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });

    /* um link com #marcar?servico=Família/Nome escolhe o serviço */
    raiz.escolher = (id) => {
      svc.value = id;
      svc.dispatchEvent(new Event("change"));
    };

    pintarPessoas();
    pintarDias();
    pintarHoras();
    pintarMinhas();
    return raiz;
  }

  return { montar };
})();
