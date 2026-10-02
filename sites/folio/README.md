# FOLIO — portefólio de design engineer

Site em `sites/folio/`, separado da loja FORMA e do portefólio motion. Palco preto, fila de cartões curvos sobre uma grelha em perspetiva, perfil, índice, newsletter e ficha de caso.

O conteúdo de exemplo (Elena Voss e clientes fictícios) existe para **substituíres**. Não copies nomes, textos, filmes ou imagens de outro portefólio.

| | |
| --- | --- |
| Local | http://127.0.0.1:4173/sites/folio/ |
| Ficheiro a editar | **`js/data.js`** (`window.FOLIO`) |

A partir da raiz do repo: `powershell -NoProfile -ExecutionPolicy Bypass -File .\_serve.ps1`

O palco 3D usa Three.js a partir de um CDN (`cdn.jsdelivr.net`, via import map no `index.html`). Sem rede/WebGL, em ecrã estreito, ou com “reduzir movimento” ligado, os mesmos projetos aparecem numa fila simples.

Fonte: Inter Tight (Google Fonts). Tamanhos em `vw`, para o layout escalar com a janela.

---

## Ficheiros

| Ficheiro | Função |
| --- | --- |
| `index.html` | Estrutura (palco, chrome, perfil, índice, caso) |
| `js/data.js` | **Tudo o que é conteúdo** |
| `js/site.js` | Palco, arrasto, overlays, ficha |
| `css/site.css` | Visual |
| `.nojekyll` | GitHub Pages serve a pasta tal como está |

---

## Trocar a pessoa

Abre `js/data.js` e muda:

| Campo | Efeito |
| --- | --- |
| `name` | Canto superior esquerdo, `<title>` na home |
| `role` | Texto escondido para leitores de ecrã |
| `email` | Link “Email” no perfil (`mailto:`) |
| `bio` | Parágrafos centrados do perfil (array de strings) |
| `awards` | Linha pequena por baixo da bio |
| `newsletter` | Texto do painel Newsletter |
| `links` | Instagram, X, LinkedIn… `{ label, href }`. `href` vazio mostra o nome sem link |

O botão do perfil passa a **Close** enquanto o painel está aberto. Esc fecha o painel, a newsletter ou a ficha.

---

## Projetos — `projects[]`

A ordem do array é a ordem no palco e no índice.

```js
{
  slug: "mare",                 // único, minúsculas, vira #p/mare
  title: "Maré",
  featured: true,               // cartão no palco + ficha
  year: "2025",
  client: "Maré Hotels",        // pílula na ficha
  url: "",                      // site ao vivo; vazio = sem botão Visit
  awards: 1,                    // 0 esconde a pílula
  summary: "Uma frase sobre o trabalho.",
  media: [
    {
      w: 1600, h: 900,           // tamanho da imagem na ficha; o cartão no palco é sempre 1.42:1 (recorte)
      src: "img/mare.jpg",      // photograph behind the card
      kind: "serif",            // "serif" | "sans" | "stack"
      word: "Maré",             // tipo grande do póster gerado
      colors: ["#16343c", "#d7b48a"],
      ink: "#f4efe6",
      caption: "Home",          // legenda na ficha
      src: "img/mare.jpg",      // opcional — substitui o póster
      video: "vid/mare.mp4"     // opcional — na ficha, em vez da imagem
    }
  ]
}
```

**Destaque (`featured: true`):** entra na fila 3D. O primeiro `media` é o cartão. Os seguintes empilham-se na ficha branca.

**Só no índice (`featured: false`):** o nome aparece em Full. Se `url` estiver preenchido, o nome abre esse site. Sem `url`, abre a ficha.

**Adicionar:** copia um bloco `{ … },`. **Apagar:** remove o bloco. O `slug` não se pode repetir.

Todos os cartões do palco têm a mesma proporção (1.42:1); a fotografia é recortada para caber. O cartão mostra só o título e um botão redondo com seta.

### Imagens e vídeo

```
folio/img/     jpg, png, webp
folio/vid/     mp4
```

Caminhos em `data.js` são relativos a `folio/` (`img/mare.jpg`). Sem `src`, o site desenha um póster com `colors`, `kind` e `word`.

---

## O que o visitante pode fazer

- **Entrada:** três traços enchem enquanto as imagens carregam; os títulos aparecem onde os cartões vão aterrar, e os cartões sobem do chão.
- **Palco:** fila infinita de cartões numa fita ondulada sobre uma grelha em perspetiva. Roda ou arrasto percorrem; a fita ondula mais com a velocidade e assenta num cartão. Hover puxa o cartão para a frente. Clique abre a ficha.
- **Estilos (Style 1 / 2 / 3):** só na vista Featured. A escolha fica guardada no browser (`localStorage`, `folio-style`); o padrão é o 2.
  - **Style 1:** painéis largos 16:9 num arco, faixa de legenda em cima, título forte + resumo, botões ‹ › ao lado do cartão da frente. Tem princípio e fim.
  - **Style 2:** a fita ondulada (cartões 1.42:1, título + seta).
  - **Style 3:** fita mais funda e inclinada, cartões encostados. A imagem de cada cartão está sempre a mexer (zoom e deriva lentos, no shader). Ao passar o rato, o cartão abaúla na direção do ponteiro, a imagem aproxima-se e espalha-se uma onda suave a partir do cursor.
  - Ao trocar, os cartões antigos desaparecem, a câmara ajusta-se ao estilo novo e os novos sobem do chão, sempre com o mesmo projeto à frente.
- **Setas do teclado:** movem a fila; dentro da ficha, mudam de projeto. Esc fecha.
- **Full:** todos os nomes centrados, separados por `·`. Ao passar o rato num nome, uma lente líquida deforma o texto à volta e mostra a imagem do projeto (WebGL; sem WebGL fica um hover simples).
- **Traditional:** grelha clássica com todos os projetos (imagem, título, ano, cliente). Clique abre a ficha; projetos só-índice com `url` abrem o site.
- **Seletor de vista:** Featured / Full / Traditional num interruptor em pílula; a pílula branca desliza para a vista ativa.
- **Profile:** um anel cromado entra a rodar, com o interior preto, formas pretas brilhantes a flutuar, e a bio, prémios e redes ao centro. O botão passa a **Close**.
- **Newsletter:** o mesmo, com um anel rosa e um campo com contorno em gradiente. O endereço fica em `localStorage` (`folio-news`); não envia e-mail.
- **Ficha:** folha branca que sobe do fundo. Coluna esquerda fixa (título, texto, pílulas, prémios), imagens à direita, anel de progresso em baixo à esquerda. As fichas vizinhas espreitam nas margens; clicar nelas ou usar as setas desliza para o lado. O X volta à vista anterior.

O nome no canto volta a `#featured`.

---

## Ecrã estreito

Abaixo de 860px a fila 3D não monta: os destaques empilham-se em cartões, os anéis passam a CSS, e a ficha ocupa o ecrã sem vizinhas. Ao atravessar os 860px a página recarrega para montar o modo certo.
