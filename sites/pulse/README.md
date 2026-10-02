# PULSE — portefólio de motion

Site em `sites/pulse/`, separado da loja FORMA. Recria o tipo de portefólio “chão de recreio”: barra vermelha, tipo pixel, stickers arrastáveis, curva de easing, grelha/lista de trabalho, overlay de caso, Lab, Sobre, Contacto, PT/EN.

O conteúdo de exemplo (Rui Vale, Inês Mar, clientes fictícios) existe para **substituíres por pessoas e trabalhos reais**. Não copies nomes, e-mails, filmes ou marcas de outro portefólio.

| | |
| --- | --- |
| Local | http://127.0.0.1:4173/sites/pulse/ |
| Ficheiro a editar | **`js/data.js`** (`window.SITE`) |

A partir da raiz do repo: `powershell -NoProfile -ExecutionPolicy Bypass -File .\_serve.ps1`

---

## Ficheiros

| Ficheiro | Função |
| --- | --- |
| `index.html` | Estrutura (hero, work, lab, about, contact, overlay) |
| `js/data.js` | **Tudo o que é conteúdo** — pessoas, projetos, textos, links |
| `js/site.js` | Motor: pixel hero, stickers, curva, grelha, casos, ladrilhos |
| `css/site.css` | Visual (não precisas disto para mudar nomes) |
| `.nojekyll` | GitHub Pages serve a pasta tal como está |

Não edites `site.js` no dia-a-dia. Se o site partir, foi provavelmente uma vírgula em `data.js`.

Textos bilingues usam o helper `ptEn("português", "english")`. Podes passar uma string simples (`"Norte"`) quando PT e EN são iguais.

---

## Trocar as pessoas (o fluxo mais comum)

1. Abre `js/data.js`.
2. Muda `name`, `studio`, `mark`, `email`, `heroLines`, `people`, `creditHighlight`.
3. Substitui `projects`, `lab`, `brands` pelos trabalhos reais.
4. Ajusta `i18n.pt` / `i18n.en` (`lede`, `bio1`, `bio2`, `contact.h`, `clients`).
5. Guarda e dá F5.

Exemplo mínimo para um único motion designer:

```js
name: "Ana Silva",
studio: "ANA",
mark: "AS",
heroLines: [
  ["ANA SILVA", 0.4],
  ["MOTION", 1],
  ["DESIGNER", 1]
],
creditHighlight: ["Ana Silva"],
people: [
  {
    name: "Ana Silva",
    role: ptEn("Motion", "Motion"),
    blurb: ptEn("Animação de marca e social.", "Brand and social motion.")
  }
],
email: "ana@exemplo.pt",
```

`heroLines`: cada linha é `[TEXTO EM MAIÚSCULAS, escala]`. A primeira linha (nome) usa escala menor (~0.4). Mantém o texto curto — o canvas amostra o tipo Pixelify Sans.

---

## Campos de `window.SITE`

### Identidade

| Campo | Efeito |
| --- | --- |
| `storage` | Prefixo do `localStorage` (`pulse-lang`, `pulse-curve`, …). Muda se instalares outro clone no mesmo domínio. |
| `name` | Barra de estado, `<title>`, H1 escondido |
| `studio` | Copyright no rodapé (`© 2026 PULSE`) |
| `mark` | Iniciais no sticker redondo do hero |
| `role` | Subtítulo na barra (`Motion Designer`) |
| `rec` | Linha tipo After Effects no topo do hero (`….aep · 1920×1080 · 25 fps`) |
| `year` | Ano do rodapé |
| `timezone` / `clockPrefix` | Relógio da barra (`PT 16:48`, fuso `Europe/Lisbon`) |
| `email` | Contacto + botão copiar |
| `creditHighlight` | Nomes destacados nos créditos do caso |
| `heroLines` | As 3 linhas pixel do hero |
| `heroColors` | Cores das linhas pixel `[nome, MOTION, DESIGNER]` |
| `links` | Botões no contacto `{ label, href }` |
| `facts.base` / `facts.now` | Lista “Base” / “Agora” no Sobre |

### Equipa — `people[]`

Cartões na secção Sobre.

```js
{ name: "Inês Mar", role: ptEn("Direção de arte", "Art direction"), blurb: ptEn("…", "…") }
```

Acrescenta ou apaga objetos. Com uma pessoa, fica um cartão.

### Marcas — `brands[]`

Faixa a deslizar debaixo do hero.

```js
{ n: "Norte", h: 0.55 }                    // palavra em Pixelify
{ n: "Adidas", src: "img/logos/x.svg", h: 0.58 }  // logótipo (opcional)
```

`h` = altura relativa na faixa (0.3–0.7). Sem `src`, usa o nome.

### Filtros — `filters[]`

Chips acima da grelha. O primeiro deve ser `all`. Os outros IDs (`brand`, `2d`, `mixed`, `ai`, `social`, `led`) têm de bater com `tags` dos projetos. Um filtro sem projetos desaparece.

### Capacidades — `caps[]`

Lista “Fazemos”: `[ptEn("Animação de marca", "Brand motion"), "After Effects · Illustrator"]`.

### Stickers — `stickers[]`

Ímanes no hero. `x`/`y` = centro (0–1). `m: [x,y]` = posição no telemóvel. `r` = rotação. `nm: 1` = esconder em ecrãs estreitos.

| `k` | O que é |
| --- | --- |
| `badge` | Círculo com o texto `i18n.badge` e `mark` |
| `curve` | Editor da curva de easing do site |
| `ae`, `ai`, `resolve`, `claude`, `krea` | Logos pixel (`px`) |

Podes apagar stickers `px`; não apagues `curve` nem `badge` se quiseres o mesmo comportamento.

### Ovos de Páscoa — `eggs[]`

Sete ladrilhos soltos no chão. Encontrar todos liga o “modo recreio” (chão às cores).

```js
{ id: "kf", ico: "◆", m: ptEn("Mensagem PT", "Message EN") }
```

`id` tem de ser único. `ico` pode ser texto ou HTML.

---

## Projetos — `projects[]`

Alimentam Trabalho (destaques + grelha + lista) e o overlay de caso. `slug` vira URL `#norte`.

```js
{
  slug: "norte",                 // único, minúsculas, para #norte
  feat: true,                    // bloco grande a 16:9 (só 1–2)
  badge: ptEn("Breakdown", "Breakdown"), // etiqueta extra no destaque (opcional)
  title: "Norte",
  sub: ptEn("Encomendas B2B", "B2B orders"),
  client: "Norte Logistics",
  market: "Porto",
  year: "2025",
  c1: "#111111",                 // tipo / UI do caso
  c2: "#ececec",                 // fundo da capa
  ac: "#f2f2f2",                 // sombra no hover
  tags: ["brand", "2d"],
  thumb: "img/thumbs/norte.webp", // opcional; senão capa pixel
  pos: "50% 40%",                // object-position da capa (opcional)
  loop: "vid/loop/norte.mp4",    // loop mudo na grelha (opcional)
  teaser: V("vid/norte-teaser.mp4", "16/9", "Teaser"), // no destaque (opcional)
  hero: V("vid/norte-teaser.mp4", "16/9", "Teaser"),   // banner no caso (opcional)
  videos: [V("vid/norte.mp4", "16/9", ptEn("Filme", "Film"))],
  brief: ptEn("…", "…"),
  role: ptEn(["Animação em AE"], ["Animation in AE"]),
  tools: ["After Effects", "Illustrator"],
  credits: [
    ["Studio", "PULSE"],
    ["Motion", "Rui Vale"],
    ["Client", "Norte Logistics"]
  ]
}
```

Helper de vídeo:

```js
const V = (src, ar, cap) => ({ src: src || "", ar: ar || "16/9", cap, thumb: "" });
```

| Campo vídeo | Notas |
| --- | --- |
| `src` | Caminho relativo (`vid/filme.mp4`) ou URL. `""` = “vídeo em breve” + capa pixel |
| `ar` | `"16/9"`, `"4/5"`, `"1/1"`, `"3/2"`… dois retratos lado a lado no caso |
| `cap` | Legenda do player |
| `thumb` | Poster (webp/jpg). Vazio = pixel |

**Adicionar um projeto:** copia um bloco `{ … },`, cola antes do `]` de `projects`, muda `slug` e o resto.

**Apagar:** remove o bloco inteiro.

**Ordem:** a lista é a ordem no site. Os `feat: true` sobem como blocos grandes; os outros são cartões.

---

## Lab — `lab[]`

Experiências pessoais (só média, sem overlay de caso).

```js
{
  slug: "clay",
  title: "Clay LipSync",
  c1: "#e9a46a",
  c2: "#2a1409",
  ac: "#e9a46a",
  ar: "1/1",
  video: "vid/clay.mp4",     // opcional
  sound: true,               // botão “ver com som”
  vimeo: "695404817",        // em vez de MP4 (opcional)
  thumb: "img/thumbs/x.webp",
  d: ptEn("Descrição PT", "EN")  // para ti / futuro; o Lab mostra sobretudo o media
}
```

---

## Textos da interface — `i18n.pt` / `i18n.en`

Qualquer chave usada com `data-i18n` no HTML. As que mais mudas:

| Chave | Onde |
| --- | --- |
| `lede` | Parágrafo do hero (podes usar `<b>…</b>`) |
| `bio1` `bio2` | Sobre |
| `contact.h` | Título grande do contacto (`<br>` permitido) |
| `clients` | Linha escondida / acessível com a lista de clientes |
| `badge` | Texto a girar no sticker (termina com espaço e ✦) |
| `cta.work` `cta.contact` | Botões do hero |

O idioma grava-se em `localStorage` (`pulse-lang`). O site escolhe PT se o browser for `pt*`, senão EN.

---

## Vídeos e imagens

Cria pastas se precisares:

```
motion/vid/           filmes e teasers .mp4
motion/vid/loop/      loops curtos mudos para a grelha
motion/img/thumbs/    posters .webp / .jpg
motion/img/logos/     SVG/PNG da faixa de marcas
```

Caminhos em `data.js` são relativos a `motion/` (`vid/norte.mp4`, não `/vid/...`).

Sem ficheiro, a capa é um dither das cores `c1`/`c2` — chega para um template.

---

## O que o visitante pode fazer

- **Hero:** o rato empurra os pixels; clique rebenta a letra; stickers arrastam-se com inércia.
- **Curva (sticker ciano / dock no canto):** as bolas laranja mudam o easing de scroll e animações. Duplo clique repõe. A primeira visita mostra uma dica.
- **Trabalho:** filtros, Grelha / Lista, hover com preview na lista, “ver caso”.
- **Caso:** Esc fecha; setas mudam de projeto; Tab fica dentro do diálogo.
- **Ladrilhos:** alguns levantam; ao encontrares todos, o chão pinta-se. O contador no canto liga/desliga o recreio.
- **Contacto:** copiar e-mail.

`prefers-reduced-motion` desliga a maior parte das animações.

---

## localStorage (`pulse-*`)

| Chave | |
| --- | --- |
| `lang` | `pt` / `en` |
| `view` | `grid` / `list` |
| `curve` | Bézier `[x1,y1,x2,y2]` |
| `curve-intro` / `dock-tip` | Dicas já vistas |
| `eggs` / `recreio` | Ladrilhos encontrados e modo recreio |

Não partilha dados com a loja FORMA.

---

## Checklist para um portefólio novo

1. `name`, `studio`, `mark`, `heroLines`, `email`, `links`
2. `people` (uma ou várias)
3. `projects` reais + `slug` únicos
4. `brands` (nomes ou `src`)
5. `lede`, `bio1`, `bio2`, `clients` em PT e EN
6. MP4s em `vid/` quando existirem
7. F5. Depois `git push` para atualizar `/motion/` no GitHub Pages
