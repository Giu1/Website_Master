# Como mudar o catálogo (loja FORMA)

Só dois sítios: a pasta **images** e o ficheiro **js/products.js**.
Não mexas em mais nada para vender um produto.

- Marca, e-mail, WhatsApp, portes: `js/config.js` — ver [README.md](README.md)
- Testemunhos da página inicial: `window.FORMA_TESTIMONIALS` no fim de `js/products.js`

---

## 1. Pôr a foto

1. Copia a foto para a pasta `images`.
2. Nome simples, sem espaços: `chaveiro.jpg`

JPG, PNG ou WEBP. Uma foto de frente, fundo limpo, fica melhor. Podes pôr várias fotos do mesmo produto.

---

## 2. Ligar a foto e o texto

Abre `js/products.js`. Cada produto é um bloco `{ ... }`.

Muda só estas linhas:

```
images: ["images/chaveiro.jpg", "images/chaveiro-2.jpg"],
price: 8,
compareAt: 12,
name: {
  "pt-BR": "Chaveiro de iniciais",
  "pt-PT": "Chaveiro de iniciais",
  es: "Llavero de iniciales",
  en: "Initials keychain"
},
blurb: {
  "pt-BR": "Duas letras em relevo. PLA fosco.",
  "pt-PT": "Duas letras em relevo. PLA mate.",
  es: "Dos letras en relieve. PLA mate.",
  en: "Two raised letters. Matte PLA."
}
```

- `images` — lista de fotos. Se ficar `[]`, o site usa o desenho automático.
- `price` — número em euros. Sem preço: `null` (aparece “sob consulta”).
- `compareAt` — preço “antes”. Se for maior que `price`, aparece a etiqueta de desconto.
- `status` — `available` (pronto), `made-to-order` (sob encomenda) ou `coming` (em breve).
- `category` — `keychains` | `figurines` | `miniatures` | `decor` | `props`
- `featured` — `true` para aparecer na página inicial
- `colors` — cores de filamento em hex, ex. `["#f4ecdc", "#ff6b2c"]`
- `personalize` — `{ maxLength: 12 }` se o cliente puder gravar texto

Se só vendes em português, podes escrever assim (vale para todas as línguas):

```
name: "Chaveiro de iniciais",
blurb: "Duas letras em relevo. PLA fosco.",
```

---

## 3. Adicionar um produto novo

1. Copia um bloco inteiro, da `{` até `},`
2. Cola a seguir ao último produto (antes do `];`)
3. Muda o `id` — minúsculas, sem espaços: `vaso-lua`
4. Muda fotos, nome, texto e preço

---

## 4. Apagar um produto

Apaga o bloco `{ ... },` inteiro desse produto.

---

## 5. Ver no ecrã

Guarda o ficheiro. Recarrega o site (`F5`).

Se o site já está no GitHub: envia as fotos novas **e** o `js/products.js` atualizado. Espera cerca de 1 minuto.

---

## Foto noutro sítio (Imgur, Drive, Cloudinary)

Em vez de `images/...` podes colar um link direto da imagem:

```
images: ["https://i.imgur.com/xxxxxxxx.jpg"],
```

O link tem de abrir a foto sozinha (terminar em .jpg / .png), não a página do álbum.
