/* Dados do salão. O site inteiro lê daqui: para outro cliente, muda só este ficheiro.
   O cliente de exemplo (Estúdio Lírio, Coimbra) é fictício, tal como o telefone e a morada. */
window.CLIENTE = {
  nome: "Lírio",
  nomeCompleto: "Estúdio Lírio",
  tipo: "Cabeleireiro e estética",
  cidade: "Coimbra",
  morada: "Rua da Sofia, 112",
  codigoPostal: "3000-389 Coimbra",
  telefone: "239 000 000",
  telefoneHref: "tel:+351239000000",
  email: "ola@estudiolirio.pt",
  mapa: "https://www.google.com/maps/search/?api=1&query=Rua+da+Sofia+112+Coimbra",
  instagram: "@estudiolirio",
  desde: 2011,

  sobre: [
    "Abrimos em 2011 numa loja antiga da Rua da Sofia, com duas cadeiras e um espelho que já lá estava. Hoje somos quatro, mas a ideia não mudou: tempo para ouvir antes de cortar, e preços escritos à porta.",
    "Trabalhamos cor com marcas sem amoníaco, fazemos tranças de todas as escolas e temos uma sala à parte para estética. Crianças, noivas e quem só quer aparar as pontas: há lugar para todos."
  ],

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

  /* Resumo por família (os cartões grandes) */
  servicos: [
    { nome: "Cortes", desc: "Senhora, homem e criança", preco: "desde 14 €" },
    { nome: "Coloração", desc: "Raiz, global, madeixas e balayage", preco: "desde 32 €" },
    { nome: "Tranças", desc: "Box braids, nagô e tranças soltas", preco: "desde 40 €" },
    { nome: "Penteados", desc: "Casamentos e eventos", preco: "desde 25 €" },
    { nome: "Estética", desc: "Sobrancelhas, depilação e unhas", preco: "desde 8 €" }
  ],

  /* A tabela completa: preço em euros, duração em minutos */
  tabela: [
    { familia: "Cortes", itens: [
      { nome: "Corte senhora", desc: "Lavagem, corte e secagem", preco: 26, min: 60 },
      { nome: "Corte homem", desc: "Tesoura ou máquina, com lavagem", preco: 16, min: 30 },
      { nome: "Corte criança", desc: "Até aos 10 anos", preco: 14, min: 30 },
      { nome: "Franja", desc: "Entre cortes, sem marcação longa", preco: 6, min: 15 },
      { nome: "Brushing", desc: "Lavagem e secagem com escova", preco: 18, min: 45 }
    ]},
    { familia: "Coloração", itens: [
      { nome: "Raiz", desc: "Até 3 cm, com secagem", preco: 32, min: 90 },
      { nome: "Coloração global", desc: "Comprimento médio", preco: 45, min: 120 },
      { nome: "Madeixas", desc: "Papel ou touca", preco: 55, min: 120 },
      { nome: "Balayage", desc: "Pintado à mão, com tonalizante", preco: 85, min: 180 },
      { nome: "Tonalizante", desc: "Brilho e correção de tom", preco: 22, min: 45 }
    ]},
    { familia: "Tranças", itens: [
      { nome: "Tranças soltas", desc: "Duas ou quatro, para o dia", preco: 40, min: 60 },
      { nome: "Nagô", desc: "Rente à cabeça, desenho à escolha", preco: 55, min: 120 },
      { nome: "Box braids", desc: "Médias, com extensões incluídas", preco: 120, min: 300 }
    ]},
    { familia: "Penteados", itens: [
      { nome: "Apanhado", desc: "Para eventos", preco: 25, min: 45 },
      { nome: "Noiva", desc: "Com prova antes do dia", preco: 90, min: 120 },
      { nome: "Ondas", desc: "Ferro ou difusor", preco: 25, min: 45 }
    ]},
    { familia: "Estética", itens: [
      { nome: "Sobrancelhas", desc: "Linha ou cera", preco: 8, min: 15 },
      { nome: "Manicure", desc: "Com verniz normal", preco: 14, min: 40 },
      { nome: "Verniz gel", desc: "Mãos, dura três semanas", preco: 22, min: 60 },
      { nome: "Depilação pernas", desc: "Cera morna", preco: 18, min: 40 }
    ]}
  ],

  equipa: [
    { nome: "Inês Lírio", papel: "Fundadora · corte e cor", cor: "#c46b7c", faz: ["Cortes", "Coloração", "Penteados"], folga: [] },
    { nome: "Rui Matos", papel: "Corte homem e criança", cor: "#2f4f4a", faz: ["Cortes"], folga: [6] },
    { nome: "Aminata Sow", papel: "Tranças", cor: "#8e3b2f", faz: ["Tranças", "Penteados"], folga: [2] },
    { nome: "Beatriz Paiva", papel: "Estética e unhas", cor: "#d9a066", faz: ["Estética"], folga: [] }
  ],

  opinioes: [
    { texto: "Disse o que queria em três frases e saí com exatamente isso. Raro.", autor: "Marta, cliente desde 2015" },
    { texto: "As box braids da Aminata aguentaram sete semanas sem um fio fora do sítio.", autor: "Djenaba" },
    { texto: "Levo os miúdos ao Rui há anos. Têm paciência e não há drama.", autor: "Paulo" },
    { texto: "A prova de noiva foi meia hora de conversa e meia hora de testes. No dia, nem pensei no cabelo.", autor: "Carolina" }
  ],

  perguntas: [
    { q: "Preciso de marcar?", a: "Para corte homem e franja, se houver cadeira livre, atendemos sem marcação. Tudo o resto marca-se aqui no site ou por telefone." },
    { q: "Posso desmarcar?", a: "Pode, até à véspera, sem custo. No próprio dia pedimos que ligue." },
    { q: "Que marcas de cor usam?", a: "Coloração sem amoníaco e tonalizantes vegan. Fazemos teste de alergia 48 horas antes de uma primeira coloração." },
    { q: "Aceitam cartão?", a: "Sim: cartão, MB WAY e dinheiro." },
    { q: "Há estacionamento?", a: "O parque do Mercado D. Pedro V fica a dois minutos a pé." }
  ]
};

/* Hora em "h": "09:30" → "9h30", "19:00" → "19h". */
CLIENTE.hora = function (hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h + "h" + (m ? String(m).padStart(2, "0") : "");
};
CLIENTE.minutos = (s) => { const [h, m] = s.split(":").map(Number); return h * 60 + m; };
CLIENTE.hhmm = (n) => String(Math.floor(n / 60)).padStart(2, "0") + ":" + String(n % 60).padStart(2, "0");
CLIENTE.duracao = (min) => (min >= 60 ? Math.floor(min / 60) + " h" + (min % 60 ? " " + (min % 60) : "") : min + " min");
CLIENTE.euros = (n) => n.toLocaleString("pt-PT", { minimumFractionDigits: 0 }) + " €";

/* Estado de agora: { aberto, curto, longo }. */
CLIENTE.estado = function (agora = new Date()) {
  const min = this.minutos;
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

/* Todos os serviços numa lista simples, com a família */
CLIENTE.itens = function () {
  return this.tabela.flatMap((f) => f.itens.map((i) => ({ ...i, familia: f.familia, id: f.familia + "/" + i.nome })));
};
