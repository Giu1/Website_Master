# Estúdio Lírio — Montra

Site completo de cabeleireiro e estética, expandido a partir da Amostra "Montra" (`sites/amostras/`).

A loja vista da rua: toldo, montra com o título, porta com a placa Aberto/Fechado (segue o horário real; tocar vira-a), frascos na prateleira para as cinco famílias, quadro de preços com separadores, o salão, equipa, marcação, bilhetes com opiniões, perguntas, horário e mapa.

O cliente (Estúdio Lírio, Coimbra) é fictício, tal como a morada e o telefone.

## Ficheiros

| Ficheiro | O que é |
| --- | --- |
| `index.html` | A página |
| `css/style.css` | Todo o aspeto, incluindo a marcação (classes `.bk-*`) |
| `js/cliente.js` | **Os dados do salão**: nome, morada, horário, tabela de preços, equipa, opiniões, perguntas |
| `js/marcar.js` | A marcação: serviço → pessoa → dia → hora → nome e telemóvel |
| `js/main.js` | Preenche a página a partir de `cliente.js` e trata das animações |
| `img/card.jpg` | Imagem do cartão no hub |

## Para outro cliente

Muda só `js/cliente.js`. Os três sites (`montra`, `rotulo`, `leque`) usam o mesmo formato, por isso o mesmo ficheiro serve nos três.

## Marcação

Não há servidor: cada marcação fica guardada no navegador (`localStorage`, chave `montra-marcacoes`) e aparece em "As suas marcações", onde se pode desmarcar. A ocupação da agenda é de exemplo e é sempre igual para o mesmo dia e pessoa. As folgas da equipa (`folga`) e o horário são respeitados. Para ligar a um sistema real, substitua `ler`/`gravar` e `ocupado` em `marcar.js`.

Um botão "Marcar" na tabela escolhe logo o serviço (`booking.escolher("Família/Nome")`).
