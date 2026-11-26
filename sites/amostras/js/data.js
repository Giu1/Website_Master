/* Proposta: o que a página mostra. Para outro cliente, copia a pasta,
   muda este ficheiro e o js/cliente.js, e troca as amostras em amostras/. */
window.PROPOSTA = {
  estudio: "Lucas Bastos",
  estudioUrl: "../../",
  linhaTopo: "Proposta para o Estúdio Lírio · Cabeleireiro e Estética, Coimbra",
  titulo: "Seis amostras para o novo site do Estúdio Lírio.",
  intro:
    "Escolha uma amostra para a ver aqui, <strong>como no computador ou como no telemóvel</strong>. " +
    "Todas usam só os dados públicos do salão (morada, telefone, horário e serviços). " +
    "As imagens são ilustrações, não fotografias do espaço.",
  rodape: "Amostras de trabalho. Os textos e o horário são de exemplo e confirmam-se antes de publicar.",

  amostras: [
    {
      id: "espelho",
      nome: "Espelho",
      resumo: "O espelho de bancada, com as luzes acesas quando está aberto.",
      descricao: "O espelho de bancada do salão, com lâmpadas à volta e bilhetes entalados na moldura. Verde-petróleo, quente e próximo.",
      movimento: "As lâmpadas acendem uma a uma quando o salão está aberto; as secções revelam-se ao descer.",
      tecnica: "HTML e CSS puros; o horário decide se as luzes ficam acesas.",
      url: "amostras/espelho/",
      thumb: "img/espelho.png"
    },
    {
      id: "azulejo",
      nome: "Azulejo",
      resumo: "A fachada de azulejo da loja de bairro.",
      descricao: "Um painel de azulejo azul e branco como fachada, com o nome pintado à mão por cima. Limpo, claro, muito português.",
      movimento: "Os azulejos viram-se um a um à entrada; cada serviço é um azulejo que roda ao passar o rato.",
      tecnica: "Padrão desenhado em SVG e repetido em CSS; sem imagens.",
      url: "amostras/azulejo/",
      thumb: "img/azulejo.png"
    },
    {
      id: "montra",
      nome: "Montra",
      resumo: "A montra, com placa Aberto/Fechado e toldo às riscas.",
      descricao: "A rua vista de fora: toldo às riscas, o vidro da montra e a placa pendurada na porta. Vermelho-tijolo e creme.",
      movimento: "A placa baloiça e vira para Aberto ou Fechado conforme o horário; um reflexo passa pelo vidro.",
      tecnica: "Toldo e reflexo em gradientes CSS; a placa vira com transformações 3D.",
      url: "amostras/montra/",
      thumb: "img/montra.png"
    },
    {
      id: "rotulo",
      nome: "Rótulo",
      resumo: "Informação rigorosa, como numa embalagem profissional.",
      descricao: "O site como o rótulo de um produto de salão: tudo medido, alinhado e legível. Creme, preto e um verde de destaque.",
      movimento: "Quase parado: os números contam até ao valor e as linhas desenham-se ao entrar.",
      tecnica: "Tipografia e grelha; zero ilustrações.",
      url: "amostras/rotulo/",
      thumb: "img/rotulo.png"
    },
    {
      id: "leque",
      nome: "Leque",
      resumo: "O leque de madeixas de cor, para tocar.",
      descricao: "O leque de amostras de coloração aberto sobre fundo escuro. Cada lâmina é um serviço. Dramático e tátil.",
      movimento: "O leque abre ao carregar e segue o rato; tocar numa lâmina mostra o serviço.",
      tecnica: "Lâminas posicionadas com rotações CSS a partir de um eixo comum.",
      url: "amostras/leque/",
      thumb: "img/leque.png"
    },
    {
      id: "tranca",
      nome: "Trança",
      resumo: "Três fios entrelaçados que seguem a página.",
      descricao: "Três fios de cor entrelaçam-se ao longo da página, como uma trança, e ligam as secções. Amarelo forte e preto.",
      movimento: "A trança desenha-se à medida que se desce; cada secção aparece quando o fio lá chega.",
      tecnica: "Caminhos SVG com o traço ligado à posição da página.",
      url: "amostras/tranca/",
      thumb: "img/tranca.png"
    }
  ]
};
