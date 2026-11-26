# Amostras

Página de proposta para um cliente: várias amostras de site para escolher, com pré-visualização ao vivo e alternância **Computador / Telemóvel**. HTML, CSS e JS estáticos, sem build.

## Ficheiros

| Ficheiro | O que é |
| --- | --- |
| `index.html`, `css/style.css`, `js/main.js` | A página de escolha |
| `js/data.js` | A proposta: título, texto de abertura e a lista de amostras (nome, resumo, descrição, Movimento, Técnica, `url`, `thumb`) |
| `js/cliente.js` | Os dados públicos do cliente (nome, morada, telefone, horário, serviços). Todas as amostras leem daqui |
| `amostras/<id>/index.html` | Cada amostra, uma página só, com o CSS e o JS lá dentro |
| `img/<id>.png` | Miniaturas 1280×800. Se faltar uma, o cartão mostra a própria página em miniatura |

## Para um cliente novo

1. Copia a pasta `sites/amostras/` para `sites/<cliente>/`.
2. Muda `js/cliente.js` (dados do cliente) e `js/data.js` (título e textos).
3. Ajusta ou troca as amostras em `amostras/`. Para acrescentar uma, cria `amostras/<id>/index.html` e junta um bloco à lista em `js/data.js`.
4. Refaz as miniaturas (captura 1280×800 do topo de cada amostra) ou apaga o `thumb` para usar a miniatura ao vivo.

O link `#<id>` abre a página já com essa amostra escolhida, por exemplo `sites/amostras/#montra`.

## Amostras incluídas

1. **Espelho**: espelho de bancada com lâmpadas que acendem quando o salão está aberto.
2. **Azulejo**: fachada de azulejo em SVG; os serviços são azulejos que viram.
3. **Montra**: toldo às riscas e placa Aberto/Fechado que segue o horário.
4. **Rótulo**: grelha tipográfica, como uma embalagem profissional.
5. **Leque**: leque de amostras de cor; cada lâmina é um serviço ou um tom.
6. **Trança**: três fios em SVG que se desenham ao descer a página.

O cliente de exemplo (Estúdio Lírio, Coimbra) é fictício, tal como o telefone e a morada.
