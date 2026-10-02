# Lucas Bastos — Work

Lucas's header on top of the Folio stage. Vanilla HTML/CSS/JS; Three.js comes from a CDN for the stage.

## How it plays

1. **Header** — the same header as `../lucas/`: wide photo (never zoomed past 16:9), photo switcher (temporary, every visit starts on photo 1), "Located in Portugal" pill, caption, looping name, EN / PT toggle. A small "Scroll" cue sits at the bottom.
2. **Scroll down** — the page does not move. The wheel (or a swipe, or ↓ / Page Down / Space) drives the page-change panel by hand: the dark panel rises with a curved top edge and names the next view ("• Work"), then lifts off with a curved bottom edge. Scrolling back up runs it in reverse; letting go part-way finishes the move in the direction you were going. "Work" in the top bar plays the whole move.
3. **Stage** — as the panel lifts, the cards rise in. From here it is Folio: Featured / Full / Traditional, Profile and case sheets. The cards always use **Style 5**: Folio's Style 4 still, deep wave with a bold title and summary (no style switcher on this page). Each card is a site in this repository; its sheet's ↗ chip opens the site.

Clicking **Lucas Bastos** (top left) or **↑ Top** (top centre) plays the panel in reverse and brings the header back. The newsletter is gone; bottom right is a **Contact me** button in pixel bricks (PULSE-style; yellow Silkscreen on near-black, one brick per font pixel so every letter stays crisp): bricks near the pointer scatter and spring back, and a click plays the panel up ("• Contact") and opens this site's own **contact page** (`contact.html`). A link with a hash (`#full`, `#traditional`, `#p/forma`) skips the header and opens the stage directly.

## About and contact pages

`about.html` and `contact.html` are the Lucas about and contact pages (EN / PT, menu, footer), with their links pointed at this site: **Work** goes back to the stage (`index.html#work`), **Home** and the © credit to the header, **About** and **Contact** to each other. The header's About / Contact links and the Contact me button open them too. Moving between the two pages uses the same curved panel both ways; the stage lifts its panel off on arrival.

## Files

| File | What it is |
| --- | --- |
| `index.html` | Header, panel and greeting on top; Folio's markup below |
| `css/hero.css` | Header, panel and greeting styles (scoped, so they never touch the stage) |
| `css/site.css` | Folio's stage styles (copied from `../folio/`) |
| `js/hero.js` | Greeting, photo switcher, looping name, scroll-driven panel |
| `js/contact-px.js` | The pixel-brick Contact me button |
| `about.html`, `contact.html` | About and contact pages |
| `css/lucas.css`, `js/lucas.js`, `js/lang.js` | Styles, script and EN / PT text for those pages (copied from `../lucas/`) |
| `js/hero-lang.js` | Header text, EN + PT-PT |
| `js/i18n.js` | Shared language helper (keep identical to the other sites) |
| `js/data.js` | The cards: one entry per site, `url` relative to this folder |
| `js/site.js` | Folio's stage (copied), told to wait for the header |
| `img/hero/` | Web copies of Lucas's photos |

To add a site: copy a block in `js/data.js`, set `url: "../<folder>/"` and an image in `img/`.
