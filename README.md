# Website Master

Every site in one repo, plus a master hub for visual reference and testing. Static HTML/CSS/JS only: no build, no package.json.

The root `index.html` is the **master hub**: a scrollable stage with one card per site. Click a card to open that site. **Full** shows the same sites as a list.

## Run locally

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\_serve.ps1
```

Open http://127.0.0.1:4173/ (pass `-Port 5000` to use another port). Python and Node are not needed.

Always serve from the repo root. The hub, the sibling links between demos, and the Aura ↔ Aura Desk shared `localStorage` all depend on one origin.

## Sites

| Folder | Site | Kind | Language |
| --- | --- | --- | --- |
| `sites/atelier/` | Atelier | Hub / sales studio, links to the other demos | EN + PT-PT |
| `sites/lumen/` | Lumen | Photographer: viewfinder hero, light table, lightbox loupe, date check | EN + PT-PT |
| `sites/osteria/` | Osteria Corvo | SPA · restaurant | EN + PT-PT |
| `sites/vela/` | Vela | SPA · perfume | EN + PT-PT |
| `sites/aura/` | Aura | Salon: live availability booking fed by the desk | EN + PT-PT |
| `sites/nido/` | Nido | Complete bakery | EN + PT-PT |
| `sites/brightline/` | Brightline | Complete home cleaning | EN + PT-PT |
| `sites/aura-desk/` | Aura Desk | Working backoffice demo: requests, bookings, services, team, hours, copy (login `demo` / `demo`) | EN + PT-PT |
| `sites/forma/` | FORMA | 3D-print shop: catalog, cart, checkout, quote | PT-PT, PT-BR, ES, EN |
| `sites/pulse/` | PULSE | Motion portfolio template (hidden from the hub: `hidden: true` in `js/data.js`) | PT + EN |
| `sites/folio/` | Folio | Design-engineer portfolio template (Three.js stage) | EN |
| `sites/lucas/` | Lucas Bastos | Personal portfolio: 4 pages, curved transitions, looping name, hero photo switcher | EN |
| `sites/lucas-folio/` | Lucas Bastos — Work | Lucas's header, a scroll-driven page change, then the Folio stage with every site in this repo as a card | EN + PT-PT header, EN stage |

Each site has its own `README.md`. FORMA's catalog guide is `sites/forma/COMO-EDITAR.md`.

## Master hub

| File | What it is |
| --- | --- |
| `index.html` | The page |
| `css/site.css` | Look |
| `js/site.js` | Stage, scroll, hover, click |
| `js/data.js` | One entry per site: title, summary, `url`, card picture |
| `img/` | Card backgrounds |

To add a site, put it in `sites/<name>/`, then copy a project block in `js/data.js` and set `url: "sites/<name>/"`.

## Rules

- **Each site is fully contained in its own folder.** No shared build and no imports across folders. The only links between sites are relative links between siblings (`../atelier/`, `../aura-desk/`), so keep all sites directly inside `sites/`.
- Forms stay on the page. There is no backend.
- PT copy is Portugal Portuguese: *contacto, equipa, guardar, telemóvel, ementa*. Never *contato, salvar, celular, cardápio*.

### Showcase demos (atelier … aura-desk)

- `js/i18n.js` is copied into all eight sites. If you change it, copy the new version into every site.
- Language preference is shared across these sites via `localStorage["portfolio-lang"]`.
- `sites/aura/js/store.js` and `sites/aura-desk/js/store.js` must stay identical. They share `localStorage["aura-demo-store-v2"]` and update each other live across tabs.
- Script order: `store.js` (if any) → `i18n.js` → `lang.js` → `main.js` / `app.js`.
- Mobile-first: test at 390×844 and check there is no horizontal scroll. Wrap entrance animations in `@media (prefers-reduced-motion: no-preference)`.
- Vela's hero must stay vertically centred on small screens. Don't add a grain overlay back to Atelier: it hid the cream text.

### Known leftovers


## Verification checklist

- [ ] The hub opens every card's site
- [ ] EN/PT toggle works on the site you touched
- [ ] Phone viewport 390×844: header, menu and forms work, no horizontal scroll
- [ ] Aura Desk edits show up on Aura (same origin)
