/* Dados públicos do cliente. Todas as amostras leem daqui:
   para um cliente novo, muda só este ficheiro e o js/data.js. */
window.CLIENTE = {
  nome: "Lírio",
  nomeCompleto: "Estúdio Lírio",
  tipo: "Cabeleireiro e estética",
  cidade: "Coimbra",
  morada: "Rua da Sofia, 112",
  codigoPostal: "3000-389 Coimbra",
  telefone: "239 000 000",
  telefoneHref: "tel:+351239000000",
  mapa: "https://www.google.com/maps/search/?api=1&query=Rua+da+Sofia+112+Coimbra",
  instagram: "@estudiolirio",

  /* 0 = domingo … 6 = sábado. Sem "abre" = fechado. */
  horario: [
    { dia: "Domingo" },
    { dia: "Segunda" },
    { dia: "Terça", abre: "09:30", fecha: "19:00" },
    { dia: "Quarta", abre: "09:30", fecha: "19:00" },
    { dia: "Quinta", abre: "09:30", fecha: "20:00" },
    { dia: "Sexta", abre: "09:30", fecha: "20:00" },
    { dia: "Sábado", abre: "09:00", fecha: "14:00" }
  ],

  servicos: [
    { nome: "Cortes", desc: "Senhora, homem e criança", preco: "desde 14 €" },
    { nome: "Coloração", desc: "Raiz, global, madeixas e balayage", preco: "desde 32 €" },
    { nome: "Tranças", desc: "Box braids, nagô e tranças soltas", preco: "desde 40 €" },
    { nome: "Penteados", desc: "Casamentos e eventos", preco: "desde 25 €" },
    { nome: "Estética", desc: "Sobrancelhas, depilação e unhas", preco: "desde 8 €" }
  ]
};

/* Hora em "h": "09:30" → "9h30", "19:00" → "19h". */
CLIENTE.hora = function (hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h + "h" + (m ? String(m).padStart(2, "0") : "");
};

/* Estado de agora: { aberto, curto, longo }. */
CLIENTE.estado = function (agora = new Date()) {
  const min = (s) => { const [h, m] = s.split(":").map(Number); return h * 60 + m; };
  const hoje = this.horario[agora.getDay()];
  const n = agora.getHours() * 60 + agora.getMinutes();
  if (hoje.abre && n >= min(hoje.abre) && n < min(hoje.fecha)) {
    return { aberto: true, curto: "Aberto agora", longo: "até às " + this.hora(hoje.fecha) };
  }
  for (let i = 0; i < 8; i++) {
    const d = (agora.getDay() + i) % 7;
    const h = this.horario[d];
    if (!h.abre) continue;
    if (i === 0 && n >= min(h.abre)) continue;
    const quando = i === 0 ? "hoje" : i === 1 ? "amanhã" : h.dia.toLowerCase();
    return { aberto: false, curto: "Fechado", longo: "abre " + quando + " às " + this.hora(h.abre) };
  }
  return { aberto: false, curto: "Fechado", longo: "" };
};

/* Linhas de horário agrupadas: "Terça a quarta · 9h30–19h". Começa à segunda. */
CLIENTE.horarioLinhas = function () {
  const ordem = [1, 2, 3, 4, 5, 6, 0].map((i) => this.horario[i]);
  const chave = (h) => (h.abre ? h.abre + "-" + h.fecha : "x");
  const linhas = [];
  ordem.forEach((h) => {
    const ult = linhas[linhas.length - 1];
    if (ult && ult.chave === chave(h)) ult.ate = h.dia;
    else linhas.push({ chave: chave(h), de: h.dia, ate: null, h });
  });
  return linhas.map((l) => ({
    dias: l.ate ? l.de + " a " + l.ate.toLowerCase() : l.de,
    horas: l.h.abre ? this.hora(l.h.abre) + "–" + this.hora(l.h.fecha) : "Fechado"
  }));
};
