/*
  CATÁLOGO FORMA — edita SÓ este ficheiro + a pasta images/
  Tutorial simples: COMO-EDITAR.md

  Campos de cada produto:
    id           — único, minúsculas, sem espaços
    category     — keychains | figurines | miniatures | decor | props
    status       — available | made-to-order | coming
    price        — preço em euros (null = sob consulta)
    compareAt    — preço "antes" (mostra etiqueta de desconto). Opcional.
    featured     — true para aparecer na página inicial
    images       — lista de fotos ["images/foto1.jpg", ...]. Vazio = desenho automático.
    colors       — cores de filamento disponíveis (hex)
    personalize  — { maxLength: 12 } se aceita texto do cliente
    specs        — { size, material, parts, weight } texto curto
    name / blurb / description — texto por idioma (ou string única)
*/
window.FORMA_PRODUCTS = [
  {
    id: "initials-keychain",
    category: "keychains",
    status: "available",
    price: 8,
    compareAt: 12,
    featured: true,
    images: [],
    colors: ["#f4ecdc", "#ff6b2c", "#3dba9a", "#7b8cff", "#1a1410"],
    personalize: { maxLength: 3 },
    specs: { size: "45 × 30 × 6 mm", material: "PLA mate", parts: "1", weight: "9 g" },
    name: { "pt-PT": "Chaveiro de iniciais", "pt-BR": "Chaveiro de iniciais", en: "Initials keychain" },
    blurb: {
      "pt-PT": "Duas letras em relevo, argola incluída. PLA mate.",
      "pt-BR": "Duas letras em relevo, argola inclusa. PLA fosco.",
      en: "Two raised letters, ring included. Matte PLA."
    },
    description: {
      "pt-PT": "Até três iniciais em relevo de 1,2 mm sobre uma placa arredondada. Impresso em PLA mate com camada de 0,12 mm para arestas limpas. Argola de aço incluída. Escolhe a cor do filamento e escreve as letras no campo de personalização.",
      "pt-BR": "Até três iniciais em relevo de 1,2 mm sobre uma placa arredondada. Impresso em PLA fosco com camada de 0,12 mm para arestas limpas. Argola de aço inclusa. Escolha a cor do filamento e escreva as letras no campo de personalização.",
      en: "Up to three 1.2 mm raised initials on a rounded plate. Printed in matte PLA at 0.12 mm layers for clean edges. Steel ring included. Pick a filament colour and type your letters in the personalisation field."
    }
  },
  {
    id: "pixel-mascot",
    category: "keychains",
    status: "available",
    price: 12,
    compareAt: null,
    featured: true,
    images: [],
    colors: ["#ff6b2c", "#3dba9a", "#7b8cff", "#e85d8c"],
    specs: { size: "40 × 34 × 12 mm", material: "PLA", parts: "1", weight: "11 g" },
    name: { "pt-PT": "Mascote pixel", "pt-BR": "Mascote pixel", en: "Pixel mascot" },
    blurb: {
      "pt-PT": "Criatura original, baixa poli, feita para o bolso e para o molho de chaves.",
      "pt-BR": "Criatura original, low poly, feita para o bolso e para o molho de chaves.",
      en: "Original critter, low-poly, made for a pocket and a key ring."
    },
    description: {
      "pt-PT": "Uma mascote desenhada de raiz na FORMA, em blocos de 4 mm. Robusta o suficiente para viver nas chaves durante anos. Disponível em quatro cores sólidas.",
      "pt-BR": "Uma mascote desenhada do zero na FORMA, em blocos de 4 mm. Robusta o bastante para viver nas chaves por anos. Disponível em quatro cores sólidas.",
      en: "A mascot designed from scratch at FORMA in 4 mm blocks. Sturdy enough to live on your keys for years. Available in four solid colours."
    }
  },
  {
    id: "name-tag",
    category: "keychains",
    status: "available",
    price: 10,
    compareAt: 14,
    featured: false,
    images: [],
    colors: ["#f4ecdc", "#ff6b2c", "#3dba9a", "#7b8cff", "#f2c14e", "#1a1410"],
    personalize: { maxLength: 12 },
    specs: { size: "70 × 24 × 5 mm", material: "PLA", parts: "1", weight: "10 g" },
    name: { "pt-PT": "Etiqueta com nome", "pt-BR": "Etiqueta com nome", en: "Name tag" },
    blurb: {
      "pt-PT": "Até 12 caracteres. Mala, mochila ou chaves da oficina.",
      "pt-BR": "Até 12 caracteres. Mala, mochila ou chaves da oficina.",
      en: "Up to 12 characters. Bag, backpack or workshop keys."
    },
    description: {
      "pt-PT": "Placa alongada com o teu nome em relevo bicolor (base numa cor, letras noutra). Cantos arredondados e furo reforçado. Ideal para malas de viagem e mochilas escolares.",
      "pt-BR": "Placa alongada com o seu nome em relevo bicolor (base numa cor, letras em outra). Cantos arredondados e furo reforçado. Ideal para malas de viagem e mochilas escolares.",
      en: "Elongated plate with your name in two-colour relief (base in one colour, letters in another). Rounded corners and a reinforced hole. Great for luggage and school bags."
    }
  },
  {
    id: "assembled-figure",
    category: "figurines",
    status: "made-to-order",
    price: 65,
    compareAt: 89,
    featured: true,
    images: [],
    colors: ["#f4ecdc", "#1a1410"],
    specs: { size: "200 × 90 × 80 mm", material: "PLA", parts: "7", weight: "260 g" },
    name: { "pt-PT": "Figura 20 cm, várias peças", "pt-BR": "Figure 20 cm, várias peças", en: "20 cm multi-part figure" },
    blurb: {
      "pt-PT": "Personagem original, impressa em partes, juntas escondidas, pronta a pintar ou já montada.",
      "pt-BR": "Personagem original, impressa em partes, encaixes escondidos, pronta para pintar ou já montada.",
      en: "Original character, printed in parts, hidden joints, primed to paint or assembled."
    },
    description: {
      "pt-PT": "A nossa peça estrela. Uma personagem original de 20 cm impressa em sete partes na Bambu Lab A2L, com juntas escondidas nas costuras da roupa. Entregue montada e lixada, ou em kit para pintares. Base incluída. Prazo: 7 a 10 dias úteis.",
      "pt-BR": "Nossa peça estrela. Uma personagem original de 20 cm impressa em sete partes na Bambu Lab A2L, com encaixes escondidos nas costuras da roupa. Entregue montada e lixada, ou em kit para você pintar. Base inclusa. Prazo: 7 a 10 dias úteis.",
      en: "Our star piece. An original 20 cm character printed in seven parts on the Bambu Lab A2L, with joints hidden in the clothing seams. Delivered assembled and sanded, or as a kit for you to paint. Base included. Lead time: 7–10 business days."
    }
  },
  {
    id: "comic-bust",
    category: "figurines",
    status: "made-to-order",
    price: 55,
    compareAt: null,
    featured: true,
    images: [],
    colors: ["#f4ecdc", "#7b8cff", "#1a1410"],
    specs: { size: "150 × 110 × 90 mm", material: "PLA", parts: "3", weight: "210 g" },
    name: { "pt-PT": "Busto comic", "pt-BR": "Busto de HQ", en: "Comic bust" },
    blurb: {
      "pt-PT": "Ombros e cabeça, ~15 cm, linhas gráficas, impressão lenta para o detalhe.",
      "pt-BR": "Ombros e cabeça, ~15 cm, linhas gráficas, impressão lenta para o detalhe.",
      en: "Shoulders and head, ~15 cm, graphic lines, slow print for the detail."
    },
    description: {
      "pt-PT": "Busto estilo banda desenhada com sombras gravadas na superfície para ler como ilustração. Impresso a 0,08 mm no rosto. Pedestal com placa para o nome à escolha.",
      "pt-BR": "Busto estilo HQ com sombras gravadas na superfície para ler como ilustração. Impresso a 0,08 mm no rosto. Pedestal com placa para o nome à escolha.",
      en: "Comic-style bust with hatching engraved into the surface so it reads like an illustration. Face printed at 0.08 mm. Pedestal with an optional name plate."
    }
  },
  {
    id: "shadow-lamp",
    category: "figurines",
    status: "available",
    price: 34,
    compareAt: 49,
    featured: true,
    images: [],
    colors: ["#1a1410", "#f4ecdc"],
    specs: { size: "120 × 120 × 160 mm", material: "PLA + LED USB", parts: "2", weight: "180 g" },
    name: { "pt-PT": "Candeeiro de sombra", "pt-BR": "Luminária de sombra", en: "Shadow lamp" },
    blurb: {
      "pt-PT": "Silhueta original recortada que se projecta na parede com LED quente. USB.",
      "pt-BR": "Silhueta original recortada que se projeta na parede com LED quente. USB.",
      en: "Original cut-out silhouette that projects onto the wall with a warm LED. USB."
    },
    description: {
      "pt-PT": "Uma caixa de luz com uma silhueta original em relevo. Liga por USB, LED quente de 3000 K, e projecta a cena numa parede a até dois metros. Três cenas disponíveis: dragão, cidade nocturna e floresta.",
      "pt-BR": "Uma caixa de luz com uma silhueta original em relevo. Liga por USB, LED quente de 3000 K, e projeta a cena numa parede a até dois metros. Três cenas disponíveis: dragão, cidade noturna e floresta.",
      en: "A light box with an original raised silhouette. USB powered, 3000 K warm LED, projects the scene onto a wall up to two metres away. Three scenes available: dragon, night city and forest."
    }
  },
  {
    id: "wyrm-mini",
    category: "miniatures",
    status: "available",
    price: 18,
    compareAt: null,
    featured: true,
    images: [],
    colors: ["#f4ecdc", "#3dba9a"],
    specs: { size: "32 mm", material: "Resina-like PLA", parts: "1 + base", weight: "6 g" },
    name: { "pt-PT": "Wyrm 32 mm", "pt-BR": "Wyrm 32 mm", en: "Wyrm 32 mm" },
    blurb: {
      "pt-PT": "Miniatura de dragão-serpente, detalhe de escamas, base incluída.",
      "pt-BR": "Miniatura de dragão-serpente, detalhe de escamas, base inclusa.",
      en: "Serpent-dragon miniature, scale texture, base included."
    },
    description: {
      "pt-PT": "Dragão-serpente enrolado, escamas visíveis, pronta para primário e tinta. Base de 32 mm com textura de pedra. Compatível com D&D e a maioria dos wargames.",
      "pt-BR": "Dragão-serpente enrolado, escamas visíveis, pronta para primer e tinta. Base de 32 mm com textura de pedra. Compatível com D&D e a maioria dos wargames.",
      en: "Coiled serpent-dragon with visible scales, ready for primer and paint. 32 mm base with stone texture. Fits D&D and most wargames."
    }
  },
  {
    id: "hero-pack",
    category: "miniatures",
    status: "coming",
    price: 42,
    compareAt: 55,
    featured: true,
    images: [],
    colors: ["#f4ecdc"],
    specs: { size: "28 mm", material: "PLA", parts: "5", weight: "28 g" },
    name: { "pt-PT": "Pack de 5 heróis", "pt-BR": "Pack de 5 heróis", en: "Five-hero pack" },
    blurb: {
      "pt-PT": "Conjunto RPG 28 mm: mago, ladino, tanque, ranger e bardo.",
      "pt-BR": "Set de RPG 28 mm: mago, ladino, tanque, ranger e bardo.",
      en: "28 mm RPG set: mage, rogue, tank, ranger and bard."
    },
    description: {
      "pt-PT": "Cinco personagens originais para começar uma campanha: mago, ladino, tanque, ranger e bardo. Bases incluídas. Entra na lista para seres avisado quando estiver disponível.",
      "pt-BR": "Cinco personagens originais para começar uma campanha: mago, ladino, tanque, ranger e bardo. Bases inclusas. Entre na lista para ser avisado quando estiver disponível.",
      en: "Five original characters to start a campaign: mage, rogue, tank, ranger and bard. Bases included. Join the list to be told when it is available."
    }
  },
  {
    id: "dungeon-tiles",
    category: "miniatures",
    status: "available",
    price: 26,
    compareAt: null,
    featured: false,
    images: [],
    colors: ["#8a8a8a", "#1a1410"],
    specs: { size: "12 peças 50 × 50 mm", material: "PLA", parts: "12", weight: "160 g" },
    name: { "pt-PT": "Tiles de masmorra", "pt-BR": "Tiles de masmorra", en: "Dungeon tiles" },
    blurb: {
      "pt-PT": "Doze peças de chão de pedra que encaixam. Corredores, salas e uma escada.",
      "pt-BR": "Doze peças de chão de pedra que encaixam. Corredores, salas e uma escada.",
      en: "Twelve interlocking stone-floor tiles. Corridors, rooms and a staircase."
    },
    description: {
      "pt-PT": "Sistema modular com encaixe em cauda de andorinha. Texturas de pedra irregular, escada em duas peças. Expande com packs extra.",
      "pt-BR": "Sistema modular com encaixe em rabo de andorinha. Texturas de pedra irregular, escada em duas peças. Expanda com packs extras.",
      en: "Modular system with dovetail joints. Irregular stone textures, two-piece staircase. Expand with extra packs."
    }
  },
  {
    id: "geo-planter",
    category: "decor",
    status: "available",
    price: 16,
    compareAt: 22,
    featured: true,
    images: [],
    colors: ["#f4ecdc", "#3dba9a", "#f2c14e", "#1a1410"],
    specs: { size: "120 × 120 × 110 mm", material: "PLA", parts: "1", weight: "95 g" },
    name: { "pt-PT": "Vaso geométrico", "pt-BR": "Vaso geométrico", en: "Geometric planter" },
    blurb: {
      "pt-PT": "Faceta baixa, furo de drenagem opcional. ~12 cm.",
      "pt-BR": "Facetas baixas, furo de drenagem opcional. ~12 cm.",
      en: "Low facets, optional drain hole. ~12 cm."
    },
    description: {
      "pt-PT": "Vaso facetado em espiral, impresso em modo vaso (parede contínua, sem costuras). Prato incluído. Com ou sem furo de drenagem — diz-nos nas notas do pedido.",
      "pt-BR": "Vaso facetado em espiral, impresso em modo vaso (parede contínua, sem emendas). Prato incluso. Com ou sem furo de drenagem — avise nas notas do pedido.",
      en: "Spiral faceted planter printed in vase mode (continuous wall, no seams). Saucer included. With or without a drain hole — tell us in the order notes."
    }
  },
  {
    id: "cable-nest",
    category: "decor",
    status: "available",
    price: 11,
    compareAt: null,
    featured: false,
    images: [],
    colors: ["#f4ecdc", "#ff6b2c", "#1a1410"],
    specs: { size: "80 × 60 × 30 mm", material: "PETG", parts: "1", weight: "22 g" },
    name: { "pt-PT": "Ninho de cabos", "pt-BR": "Ninho de cabos", en: "Cable nest" },
    blurb: {
      "pt-PT": "Dobra o cabo de carregar sem nós. Secretária limpa.",
      "pt-BR": "Segura o cabo do carregador sem nó. Mesa limpa.",
      en: "Holds a charger cable without a knot. Clear desk."
    },
    description: {
      "pt-PT": "Organizador de cabos em PETG flexível com três ranhuras. Base antiderrapante. Serve cabos USB-C, Lightning e auscultadores.",
      "pt-BR": "Organizador de cabos em PETG flexível com três ranhuras. Base antiderrapante. Serve cabos USB-C, Lightning e fones.",
      en: "Flexible PETG cable organiser with three slots. Non-slip base. Fits USB-C, Lightning and headphone cables."
    }
  },
  {
    id: "desk-tray",
    category: "decor",
    status: "available",
    price: 22,
    compareAt: null,
    featured: false,
    images: [],
    colors: ["#f4ecdc", "#1a1410", "#3dba9a"],
    specs: { size: "220 × 140 × 35 mm", material: "PLA", parts: "1", weight: "150 g" },
    name: { "pt-PT": "Tabuleiro de secretária", "pt-BR": "Bandeja de mesa", en: "Desk tray" },
    blurb: {
      "pt-PT": "Canetas, cartões e um recorte para o telemóvel. PLA rígido.",
      "pt-BR": "Canetas, cartões e um recorte para o celular. PLA rígido.",
      en: "Pens, cards and a phone cutout. Rigid PLA."
    },
    description: {
      "pt-PT": "Tabuleiro de uma só peça com compartimentos para canetas, cartões, moedas e um suporte inclinado para o telemóvel. Aproveita toda a cama da A2L.",
      "pt-BR": "Bandeja de peça única com compartimentos para canetas, cartões, moedas e um suporte inclinado para o celular. Aproveita toda a mesa da A2L.",
      en: "Single-piece tray with compartments for pens, cards, coins and a tilted phone stand. Uses the full A2L bed."
    }
  },
  {
    id: "moon-lamp",
    category: "decor",
    status: "available",
    price: 29,
    compareAt: 39,
    featured: true,
    images: [],
    colors: ["#f4ecdc"],
    specs: { size: "Ø 120 mm", material: "PLA + LED USB", parts: "2", weight: "140 g" },
    name: { "pt-PT": "Candeeiro lua", "pt-BR": "Luminária lua", en: "Moon lamp" },
    blurb: {
      "pt-PT": "Relevo lunar litofânico, 12 cm, LED quente por USB. Base de madeira impressa.",
      "pt-BR": "Relevo lunar litofânico, 12 cm, LED quente por USB. Base estilo madeira impressa.",
      en: "Lithophane moon relief, 12 cm, warm USB LED. Printed wood-look base."
    },
    description: {
      "pt-PT": "Esfera oca em PLA branco com crateras impressas em espessura variável — quando acende, aparece a textura real da Lua. Cabo USB de 1,5 m e base incluídos.",
      "pt-BR": "Esfera oca em PLA branco com crateras impressas em espessura variável — quando acende, aparece a textura real da Lua. Cabo USB de 1,5 m e base inclusos.",
      en: "Hollow white PLA sphere with craters printed at variable thickness — switch it on and the real lunar texture appears. 1.5 m USB cable and base included."
    }
  },
  {
    id: "display-helm",
    category: "props",
    status: "coming",
    price: null,
    compareAt: null,
    featured: false,
    images: [],
    colors: ["#8a8a8a", "#1a1410"],
    specs: { size: "~300 × 260 × 280 mm", material: "PLA", parts: "6", weight: "700 g" },
    name: { "pt-PT": "Elmo de exposição", "pt-BR": "Elmo de exposição", en: "Display helm" },
    blurb: {
      "pt-PT": "Grande formato, várias peças, para vitrina ou cosplay leve.",
      "pt-BR": "Grande formato, várias peças, para vitrine ou cosplay leve.",
      en: "Large format, multi-part, for a cabinet or light cosplay."
    },
    description: {
      "pt-PT": "Elmo à escala real, impresso em seis partes e colado com juntas reforçadas. Interior com espuma. Pede orçamento com as tuas medidas.",
      "pt-BR": "Elmo em escala real, impresso em seis partes e colado com juntas reforçadas. Interior com espuma. Peça orçamento com as suas medidas.",
      en: "Life-size helm printed in six parts and bonded with reinforced joints. Foam lined. Request a quote with your measurements."
    }
  },
  {
    id: "stage-hilt",
    category: "props",
    status: "coming",
    price: 38,
    compareAt: null,
    featured: true,
    images: [],
    colors: ["#1a1410", "#8a8a8a", "#f2c14e"],
    specs: { size: "260 × 120 × 40 mm", material: "PETG", parts: "3", weight: "190 g" },
    name: { "pt-PT": "Empunhadura de palco", "pt-BR": "Empunhadura de palco", en: "Stage hilt" },
    blurb: {
      "pt-PT": "Guarda + punho, oco por dentro, para props de palco — não é arma.",
      "pt-BR": "Guarda + punho, oco por dentro, para prop de palco — não é arma.",
      en: "Guard + grip, hollow core, for stage props — not a weapon."
    },
    description: {
      "pt-PT": "Punho ergonómico com guarda em três peças e canal interno para LED. Sem lâmina. Pensado para teatro, cosplay e exposição.",
      "pt-BR": "Punho ergonômico com guarda em três peças e canal interno para LED. Sem lâmina. Pensado para teatro, cosplay e exposição.",
      en: "Ergonomic grip with three-piece guard and an internal LED channel. No blade. Made for theatre, cosplay and display."
    }
  },
  {
    id: "phone-stand",
    category: "decor",
    status: "available",
    price: 9,
    compareAt: null,
    featured: false,
    images: [],
    colors: ["#f4ecdc", "#ff6b2c", "#7b8cff", "#1a1410"],
    specs: { size: "90 × 70 × 80 mm", material: "PLA", parts: "1", weight: "35 g" },
    name: { "pt-PT": "Suporte de telemóvel", "pt-BR": "Suporte de celular", en: "Phone stand" },
    blurb: {
      "pt-PT": "Ângulo de 60°, passa-cabo por baixo, serve tablets pequenos.",
      "pt-BR": "Ângulo de 60°, passa-cabo por baixo, serve tablets pequenos.",
      en: "60° angle, cable pass-through, fits small tablets."
    },
    description: {
      "pt-PT": "Suporte de secretária de uma peça com rasgo para o cabo de carregamento. Testado com telemóveis até 7 polegadas com capa.",
      "pt-BR": "Suporte de mesa de peça única com rasgo para o cabo de carregamento. Testado com celulares até 7 polegadas com capa.",
      en: "Single-piece desk stand with a slot for the charging cable. Tested with phones up to 7 inches in a case.",
      es: "Soporte de escritorio de una pieza con ranura para el cable. Probado con móviles de hasta 7 pulgadas con funda."
    }
  }
];

function lamp(id, names, accentNote) {
  const name = typeof names === "string" ? { "pt-PT": names, "pt-BR": names, en: names, es: names } : names;
  const blurb = {
    "pt-PT": "Projecção de sombra na parede, painel frontal em alta definição, PLA+ e LED. " + (accentNote || ""),
    "pt-BR": "Projeção de sombra na parede, painel frontal em alta definição, PLA+ e LED. " + (accentNote || ""),
    en: "Wall shadow projection, high-definition front panel, PLA+ and LED. " + (accentNote || ""),
    es: "Proyección de sombra en pared, panel frontal en alta definición, PLA+ y LED. " + (accentNote || "")
  };
  const description = {
    "pt-PT": "Leva a silhueta para a parede. O foco LED interno projecta a sombra de forma definida. Painel frontal com ilustração original nítida de dia e de noite. Instalação sem fios (2× AA, não incluídas) ou USB nas versões com cabo. Polímero PLA+ de alta resistência. Inclui 1× lâmpada projector. Coloca-a num quarto escuro, contra uma parede lisa, para máxima nitidez. Medidas de projecção aproximadas (até 90 × 80 cm) e podem variar com cada silhueta.",
    "pt-BR": "Leva a silhueta para a parede. O foco LED interno projeta a sombra de forma definida. Painel frontal com ilustração original nítida de dia e de noite. Instalação sem fios (2× AA, não inclusas) ou USB. PLA+ de alta resistência. Inclui 1× lâmpada projetor. Use num quarto escuro, contra parede lisa. Medidas de projeção aproximadas.",
    en: "Puts the silhouette on the wall. The internal LED throws a sharp shadow. Original front illustration that reads by day and by night. Wireless (2× AA, not included) or USB. High-strength PLA+. Includes 1× projector lamp. Use in a dark room against a smooth wall. Projection size is approximate (up to 90 × 80 cm).",
    es: "Lleva la silueta a la pared. El LED interno proyecta la sombra nítida. Ilustración frontal original que luce de día y de noche. Inalámbrica (2× AA, no incluidas) o USB. PLA+ de alta resistencia. Incluye 1× lámpara proyector. Úsala en un ambiente oscuro, contra una pared lisa. Las medidas de proyección son aproximadas (hasta 90 × 80 cm)."
  };
  return {
    id,
    category: "figurines",
    status: "available",
    price: 20,
    compareAt: 35,
    featured: true,
    stock: 15,
    images: [],
    art: "shadow-lamp",
    colors: ["#1a1410", "#f4ecdc"],
    specs: { size: "150 × 100 × 100 mm", material: "PLA+ · LED", parts: "2", weight: "180 g" },
    name,
    blurb,
    description
  };
}

window.FORMA_PRODUCTS.push(
  lamp("lamp-sun-titan", {
    "pt-PT": "Candeeiro Titã Solar — projecção de sombra",
    "pt-BR": "Luminária Titã Solar — projeção de sombra",
    en: "Sun Titan lamp — shadow projection",
    es: "Lámpara Titán Solar — proyección de sombra"
  }, "Silhueta de libertação, pose aberta."),
  lamp("lamp-storm-fox", {
    "pt-PT": "Candeeiro Raposa da Tempestade — nove caudas",
    "pt-BR": "Luminária Raposa da Tempestade — nove caudas",
    en: "Storm Fox lamp — nine tails",
    es: "Lámpara Zorro de la Tormenta — nueve colas"
  }),
  lamp("lamp-void-eye", {
    "pt-PT": "Candeeiro Olho do Vazio — feiticeiro",
    "pt-BR": "Luminária Olho do Vazio — feiticeiro",
    en: "Void Eye lamp — sorcerer",
    es: "Lámpara Ojo del Vacío — hechicero"
  }),
  lamp("lamp-crimson-striker", {
    "pt-PT": "Candeeiro Striker Carmesim — celebração",
    "pt-BR": "Luminária Striker Carmesim — celebração",
    en: "Crimson Striker lamp — celebration",
    es: "Lámpara Striker Carmesí — celebración"
  }),
  lamp("lamp-neon-idol", {
    "pt-PT": "Candeeiro Ídolo Néon — palco",
    "pt-BR": "Luminária Ídolo Néon — palco",
    en: "Neon Idol lamp — stage",
    es: "Lámpara Ídolo Neón — escenario"
  }),
  lamp("lamp-flame-drake", {
    "pt-PT": "Candeeiro Drake de Fogo — chama",
    "pt-BR": "Luminária Drake de Fogo — chama",
    en: "Fire Drake lamp — blaze",
    es: "Lámpara Drake de Fuego — llamarada"
  }),
  lamp("lamp-sea-emperor", {
    "pt-PT": "Candeeiro Imperador do Mar — bigode",
    "pt-BR": "Luminária Imperador do Mar — bigode",
    en: "Sea Emperor lamp",
    es: "Lámpara Emperador del Mar"
  }),
  lamp("lamp-joker-overlord", {
    "pt-PT": "Candeeiro Senhor do Caos — sorriso",
    "pt-BR": "Luminária Senhor do Caos — sorriso",
    en: "Chaos Lord lamp — grin",
    es: "Lámpara Señor del Caos — sonrisa"
  }),
  lamp("lamp-pride-lion", {
    "pt-PT": "Candeeiro Leão do Orgulho",
    "pt-BR": "Luminária Leão do Orgulho",
    en: "Pride Lion lamp",
    es: "Lámpara León del Orgullo"
  }),
  lamp("lamp-spark-mouse", {
    "pt-PT": "Candeeiro Rato Relâmpago",
    "pt-BR": "Luminária Rato Relâmpago",
    en: "Spark Mouse lamp",
    es: "Lámpara Ratón Relámpago"
  }),
  lamp("lamp-awakened-warrior", {
    "pt-PT": "Candeeiro Guerreiro Desperto",
    "pt-BR": "Luminária Guerreiro Desperto",
    en: "Awakened Warrior lamp",
    es: "Lámpara Guerrero Despierto"
  }),
  lamp("lamp-boar-hunter", {
    "pt-PT": "Candeeiro Caçador Javali",
    "pt-BR": "Luminária Caçador Javali",
    en: "Boar Hunter lamp",
    es: "Lámpara Cazador Jabalí"
  }),
  lamp("lamp-thunder-blade", {
    "pt-PT": "Candeeiro Lâmina do Trovão",
    "pt-BR": "Luminária Lâmina do Trovão",
    en: "Thunder Blade lamp",
    es: "Lámpara Hoja del Trueno"
  }),
  lamp("lamp-shadow-monarch", {
    "pt-PT": "Candeeiro Monarca das Sombras",
    "pt-BR": "Luminária Monarca das Sombras",
    en: "Shadow Monarch lamp",
    es: "Lámpara Monarca de las Sombras"
  }),
  lamp("lamp-room-captain", {
    "pt-PT": "Candeeiro Capitão da Sala",
    "pt-BR": "Luminária Capitão da Sala",
    en: "Room Captain lamp",
    es: "Lámpara Capitán de la Sala"
  }),
  lamp("lamp-black-clover-mage", {
    "pt-PT": "Candeeiro Mago do Trevo Negro",
    "pt-BR": "Luminária Mago do Trevo Negro",
    en: "Black Trefoil Mage lamp",
    es: "Lámpara Mago del Trébol Negro"
  }),
  {
    id: "orb-ember",
    category: "keychains",
    status: "available",
    price: 14,
    compareAt: 18,
    featured: true,
    images: [],
    art: "pixel-mascot",
    colors: ["#ff6b2c", "#1a1410", "#f2c14e"],
    specs: { size: "Ø 52 mm", material: "PLA+", parts: "2", weight: "28 g" },
    name: { "pt-PT": "Orbe Brasa", "pt-BR": "Orbe Brasa", en: "Ember orb", es: "Orbe Brasa" },
    blurb: {
      "pt-PT": "Esfera coleccionável em duas cores, fecho de pressão, exposição ou chaveiro.",
      "pt-BR": "Esfera colecionável em duas cores, fecho de pressão, exposição ou chaveiro.",
      en: "Two-colour collectible sphere, snap fit, display or keychain.",
      es: "Esfera coleccionable bicolor, encaje a presión, vitrina o llavero."
    },
    description: {
      "pt-PT": "Orbe temático impresso em duas metades com tolerância apertada. Não é um produto licenciado — desenho original FORMA. Argola opcional.",
      "pt-BR": "Orbe temático impresso em duas metades com tolerância apertada. Design original FORMA. Argola opcional.",
      en: "Themed orb printed in two halves with a tight snap. Original FORMA design, not a licensed product. Optional ring.",
      es: "Orbe temático impreso en dos mitades con tolerancia alta. Diseño original FORMA, sin licencia. Anilla opcional."
    }
  },
  {
    id: "orb-tide",
    category: "keychains",
    status: "available",
    price: 14,
    compareAt: null,
    featured: true,
    images: [],
    colors: ["#66e0ff", "#1a1410", "#f4ecdc"],
    specs: { size: "Ø 52 mm", material: "PLA+", parts: "2", weight: "28 g" },
    name: { "pt-PT": "Orbe Maré", "pt-BR": "Orbe Maré", en: "Tide orb", es: "Orbe Marea" },
    blurb: {
      "pt-PT": "Metade clara, metade tinta. Coleccionável de secretária.",
      "pt-BR": "Metade clara, metade tinta. Colecionável de mesa.",
      en: "Half clear, half ink. Desk collectible.",
      es: "Mitad clara, mitad tinta. Coleccionable de escritorio."
    },
    description: {
      "pt-PT": "Segunda peça da linha de orbes. Encaixe de pressão, duas cores de filamento, sem licenças oficiais.",
      "pt-BR": "Segunda peça da linha de orbes. Encaixe de pressão, duas cores, sem licenças oficiais.",
      en: "Second piece in the orb line. Snap fit, two filament colours, no official licences.",
      es: "Segunda pieza de la línea de orbes. Encaje a presión, dos colores, sin licencias oficiales."
    }
  },
  {
    id: "tcg-deckbox",
    category: "miniatures",
    status: "available",
    price: 16,
    compareAt: 22,
    featured: true,
    images: [],
    art: "desk-tray",
    colors: ["#1a1410", "#f4ecdc", "#7b8cff"],
    specs: { size: "78 × 68 × 95 mm", material: "PLA", parts: "2", weight: "85 g" },
    name: { "pt-PT": "Caixa de mazo TCG", "pt-BR": "Caixa de deck TCG", en: "TCG deck box", es: "Caja de mazo TCG" },
    blurb: {
      "pt-PT": "60 cartas com sleeves, tampa de pressão, canto reforçado.",
      "pt-BR": "60 cartas com sleeves, tampa de pressão, canto reforçado.",
      en: "60 sleeved cards, snap lid, reinforced corner.",
      es: "60 cartas con fundas, tapa a presión, esquina reforzada."
    },
    description: {
      "pt-PT": "Caixa modular para TCG. Cabe um mazo de 60 com sleeves standard. Tampa com ressalto para não abrir na mochila.",
      "pt-BR": "Caixa modular para TCG. Cabe um deck de 60 com sleeves. Tampa com ressalto para não abrir na mochila.",
      en: "Modular TCG box. Fits a 60-card sleeved deck. Lid nib so it stays shut in a bag.",
      es: "Caja modular para TCG. Cabe un mazo de 60 con fundas. Tapa con resalte para que no se abra en la mochila."
    }
  },
  {
    id: "tcg-stand",
    category: "miniatures",
    status: "available",
    price: 9,
    compareAt: null,
    featured: true,
    images: [],
    colors: ["#1a1410", "#f4ecdc"],
    specs: { size: "70 × 24 × 42 mm", material: "PLA", parts: "1", weight: "18 g" },
    name: { "pt-PT": "Suporte de carta TCG", "pt-BR": "Suporte de carta TCG", en: "TCG card stand", es: "Soporte de carta TCG" },
    blurb: {
      "pt-PT": "Inclinação de 12°, para a carta activa no campo.",
      "pt-BR": "Inclinação de 12°, para a carta ativa no campo.",
      en: "12° tilt, for the active card on the board.",
      es: "Inclinación de 12°, para la carta activa en mesa."
    },
    description: {
      "pt-PT": "Stand baixo para uma carta com sleeve. Não risca o holográfico. Vende-se à unidade; packs de 4 no checkout.",
      "pt-BR": "Stand baixo para uma carta com sleeve. Não risca o holográfico.",
      en: "Low stand for one sleeved card. Won't scratch holofoil. Sold each; packs of 4 at checkout.",
      es: "Stand bajo para una carta con funda. No raya el holofoil. Se vende por unidad."
    }
  }
);

/*
  CATEGORIAS — a primeira com "hero: true" é a grande na página inicial.
*/
window.FORMA_CATEGORIES = [
  { id: "figurines", accent: "#7b8cff", hero: true },
  { id: "keychains", accent: "#ff6b2c" },
  { id: "miniatures", accent: "#3dba9a" },
  { id: "decor", accent: "#f2c14e" },
  { id: "props", accent: "#e85d8c" }
];

/* Compatibilidade com o estimador de orçamento */
window.FORMA_NICHES = window.FORMA_CATEGORIES;
window.FORMA_PRODUCTS.forEach((p) => {
  if (!p.niche) p.niche = p.category;
});

/*
  TESTEMUNHOS — mostrados na página inicial.
*/
window.FORMA_TESTIMONIALS = [
  { text: { "pt-PT": "Full recomendados, rápidos sobretudo.", "pt-BR": "Full recomendados, rápidos sobretudo.", en: "Fully recommended, especially fast.", es: "Full recomendados, rápidos sobretodo." }, name: "Benjamín R.", via: "WhatsApp" },
  { text: { "pt-PT": "Wena, super confiável a página. O meu irmão ficou mais que contente com o presente.", "pt-BR": "Wena, super confiável a página. Meu irmão ficou mais que contente com o presente.", en: "Super reliable shop. My brother was more than happy with the gift.", es: "Wena rey, super confiable la página. Mi hermano quedó más que contento con el regalo." }, name: "Carlos M.", via: "WhatsApp" },
  { text: { "pt-PT": "Olá, o candeeiro chegou e a minha filha está mais feliz que com outra coisa, está muito lindo. Obrigada.", "pt-BR": "Oi, a luminária chegou e minha filha está mais feliz que com outra coisa, está muito linda. Obrigada.", en: "The lamp arrived and my daughter is happier with it than with anything else. It's beautiful. Thank you.", es: "Hola, la lámpara llegó y mi hija está más feliz que con otra cosa, está muy linda. Gracias." }, name: "Valentina R.", via: "WhatsApp" },
  { text: { "pt-PT": "Súper rápido e confiável, de certeza que compro mais coisas.", "pt-BR": "Super rápido e confiável, com certeza vou comprar mais coisas.", en: "Super fast and reliable, I'll definitely buy more.", es: "Súper rápido y confiable todo, más que seguro que compraré más cositas." }, name: "Cata", via: "Instagram" },
  { text: { "pt-PT": "Adorei o meu candeeiro, muitíssimo obrigada.", "pt-BR": "Amei minha luminária, muitíssimo obrigada.", en: "Loved my lamp, thank you so much.", es: "Ame mi lámpara, muchísimas gracias." }, name: "Macarena H.", via: "WhatsApp" },
  { text: { "pt-PT": "Tudo excelente e de boa qualidade, obrigado.", "pt-BR": "Tudo excelente e de boa qualidade, obrigado.", en: "Everything excellent and good quality, thanks.", es: "Bro, todo excelente y de buena calidad, muchas gracias." }, name: "Rodrigo C.", via: "WhatsApp" }
];
