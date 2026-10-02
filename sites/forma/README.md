# FORMA — loja 3D

Site estático, sem build. Faz parte do repositório Website Master, na pasta `sites/forma/`.

Local: http://127.0.0.1:4173/sites/forma/ (servidor `_serve.ps1` na raiz do repositório).

- Catálogo da loja: [COMO-EDITAR.md](COMO-EDITAR.md)

---

## FORMA — loja

Atelier de impressão 3D (marca **FORMA**). Visual tipo loja premium: header escuro, fundo cream, Unbounded + Inter, CTAs em gradiente pastel. Línguas: **PT-PT**, **PT-BR**, **ES**, **EN**. Peças originais, sem licenças oficiais.

### Páginas

| Ficheiro | Função |
| --- | --- |
| `index.html` | Início: hero, categorias, destaques, sobre, testemunhos, CTA |
| `loja.html` | Catálogo: filtro, pesquisa, ordenação, disponibilidade |
| `produto.html` | Ficha: galeria, cor, quantidade, tabs, relacionados |
| `carrinho.html` | Carrinho + progresso de portes grátis |
| `checkout.html` | Dados, envio, pagamento (MB WAY / transferência / PayPal) |
| `pedidos.html` | Histórico neste browser + procura por número e e-mail |
| `contacto.html` | Formulário + FAQ |
| `orcamento.html` | Estimativa STL / foto no browser |
| `privacidade.html` / `cookies.html` | Políticas |
| `404.html` | Página não encontrada (GitHub Pages) |

### O que editar

| Queres mudar | Ficheiro |
| --- | --- |
| Marca, e-mail, WhatsApp, portes, pagamentos | `js/config.js` |
| Produtos, fotos, preços, testemunhos | `js/products.js` + pasta `images/` — ver [COMO-EDITAR.md](COMO-EDITAR.md) |
| Textos PT/BR/ES/EN | `js/i18n.js` |
| Estilo | `styles.css` |

Não precisas de mexer em `js/core.js`, `layout.js`, `shop.js`, etc. para o dia-a-dia.

### `js/config.js`

```js
window.FORMA_CONFIG = {
  brand: "FORMA",
  domain: "forma3d.pt",
  ownerEmail: "",          // FormSubmit.co — pedidos e contacto chegam aqui
  formspreeId: "",         // alternativa a ownerEmail
  contactEmail: "ola@forma3d.pt",
  whatsapp: "",            // "351912345678" — FAB, checkout e rodapé
  instagram: "",
  tiktok: "",
  currency: "EUR",
  shipping: {
    freeFrom: 60,          // null = nunca grátis
    zones: [
      { id: "pt", price: 4.5, days: "2–4" },
      { id: "eu", price: 9.5, days: "5–9" },
      { id: "br", price: 19, days: "10–20" },
      { id: "pickup", price: 0, days: "—" }
    ]
  },
  payments: ["mbway", "transfer", "paypal"]
};
```

- Primeiro envio pelo FormSubmit pede confirmação no e-mail — clica no link uma vez.
- Sem `ownerEmail` / Formspree, o pedido fica no `localStorage` e pode abrir WhatsApp se o número estiver preenchido.
- O botão flutuante de WhatsApp só aparece com `whatsapp` preenchido.

### Carrinho, checkout, encomendas

Tudo corre no browser (`localStorage`). Não há gateway de pagamento: o cliente confirma e recebe dados de MB WAY, transferência ou PayPal por e-mail/WhatsApp.

Chaves típicas: idioma, carrinho, pedidos, cookies aceites. Limpar o histórico do site apaga o carrinho neste aparelho.

### Scripts da loja

`config.js` → `i18n.js` → `products.js` → `core.js` → `layout.js` → página (`home.js`, `shop.js`, `product.js`, `cart.js`, `checkout.js`, `orders.js`, `contact.js`, `quote.js` + `quote-page.js`, `policy.js`).

### Orçamento

`orcamento.html` estima volume de um STL (ou uma faixa a partir de foto) no browser. Ficheiros não são enviados. Parâmetros em `FORMA_CONFIG.quote` (preço/kg, markup, cama A2L, PLA/PETG).

---

## Notas

- Loja: peças originais, sem licenças oficiais de anime, HQ ou jogos.
- Sem cookies de rastreio. Idioma, carrinho e pedidos usam `localStorage`.
- Os outros sites deste repositório (incluindo PULSE e Folio) não partilham o carrinho da loja.
