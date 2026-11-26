/**
 * Lucas Bastos — work stage.
 * Every site in this repository as a card. url is relative to this folder,
 * so each project's "Visit" chip opens the sibling site.
 * Field guide: sites/folio/README.md (same format).
 */
window.FOLIO = {
  name: "Lucas Bastos",
  role: "designer & developer",
  email: "ola@lucasbastos.pt",
  awards: "11 sites — one repository, no build step.",
  bio: [
    "Lucas Bastos designs and builds websites from Lisbon: hand-written HTML, CSS and JavaScript, with motion and interaction doing the work.",
    "Every card here is a live site from the same repository. Open one to see the case, then visit it."
  ],
  newsletter:
    "A short note when a new site goes up. This page only stores the address in this browser until a real form is connected.",
  links: [
    { label: "Instagram", href: "" },
    { label: "LinkedIn", href: "" },
    { label: "GitHub", href: "https://github.com/Giu1" }
  ],

  projects: [
    {
      slug: "lucas",
      title: "Lucas Bastos",
      featured: true,
      year: "2026",
      client: "Personal",
      url: "../lucas/",
      awards: 0,
      summary: "Personal portfolio. Four pages, curved panel transitions, a live photo switcher, English and Portuguese.",
      media: [
        { w: 16, h: 9, src: "img/shots/lucas-1.jpg", caption: "Home" },
        { w: 16, h: 9, src: "img/shots/lucas-2.jpg", caption: "About" },
        { w: 16, h: 9, src: "img/shots/lucas-3.jpg", caption: "Recent work" }
      ]
    },
    {
      slug: "folio",
      title: "Folio",
      featured: true,
      year: "2026",
      client: "Template",
      url: "../folio/",
      awards: 0,
      summary: "Design-engineer portfolio. A 3D stage with four card styles, an index lens and case sheets.",
      media: [
        { w: 16, h: 9, src: "img/shots/folio-1.jpg", caption: "Stage" }
      ]
    },
    {
      slug: "forma",
      title: "FORMA",
      featured: true,
      year: "2026",
      client: "Shop",
      url: "../forma/",
      awards: 0,
      summary: "3D-print shop. Catalogue, cart, checkout and a quote estimator, all in the browser.",
      media: [
        { w: 16, h: 9, src: "img/shots/forma-1.jpg", caption: "Home" },
        { w: 16, h: 9, src: "img/shots/forma-2.jpg", caption: "Categories" },
        { w: 16, h: 9, src: "img/shots/forma-3.jpg", caption: "Featured products" }
      ]
    },
    {
      slug: "aura-desk",
      title: "Aura Desk",
      featured: true,
      year: "2026",
      client: "Backoffice",
      url: "../aura-desk/",
      awards: 0,
      summary: "Aura's backoffice: requests, clients, insights, team and days off. Login demo / demo.",
      media: [
        { w: 16, h: 9, src: "img/shots/aura-desk-1.jpg", caption: "Today" },
        { w: 16, h: 9, src: "img/shots/aura-desk-2.jpg", caption: "Insights" },
        { w: 16, h: 9, src: "img/shots/aura-desk-3.jpg", caption: "Clients" }
      ]
    },
    {
      slug: "brightline",
      title: "Brightline",
      featured: true,
      year: "2026",
      client: "Cleaning",
      url: "../brightline/",
      awards: 0,
      summary: "Home cleaning. Instant quote, area check, booking by crew size.",
      media: [
        { w: 16, h: 9, src: "img/shots/brightline-1.jpg", caption: "Instant quote" },
        { w: 16, h: 9, src: "img/shots/brightline-2.jpg", caption: "Rooms" },
        { w: 16, h: 9, src: "img/shots/brightline-3.jpg", caption: "Booking" }
      ]
    },
    {
      slug: "nido",
      title: "Nido",
      featured: true,
      year: "2026",
      client: "Bakery",
      url: "../nido/",
      awards: 0,
      summary: "Bakery on the clock. Stock sells through the morning; pre-order for pick-up.",
      media: [
        { w: 16, h: 9, src: "img/shots/nido-1.jpg", caption: "Home" },
        { w: 16, h: 9, src: "img/shots/nido-2.jpg", caption: "Today's tray" },
        { w: 16, h: 9, src: "img/shots/nido-3.jpg", caption: "Catering" }
      ]
    },
    {
      slug: "aura",
      title: "Aura",
      featured: true,
      year: "2026",
      client: "Salon",
      url: "../aura/",
      awards: 0,
      summary: "Salon in Chiado. Live booking fed by Aura Desk.",
      media: [
        { w: 16, h: 9, src: "img/shots/aura-1.jpg", caption: "Home" },
        { w: 16, h: 9, src: "img/shots/aura-2.jpg", caption: "Services & prices" },
        { w: 16, h: 9, src: "img/shots/aura-3.jpg", caption: "The salon" }
      ]
    },
    {
      slug: "vela",
      title: "Vela",
      featured: true,
      year: "2026",
      client: "Perfume",
      url: "../vela/",
      awards: 0,
      summary: "One perfume, a drawn bottle that takes each note's colour, and a wear clock.",
      media: [
        { w: 16, h: 9, src: "img/shots/vela-1.jpg", caption: "Home" },
        { w: 16, h: 9, src: "img/shots/vela-2.jpg", caption: "The notes" },
        { w: 16, h: 9, src: "img/shots/vela-3.jpg", caption: "Gallery" }
      ]
    },
    {
      slug: "osteria",
      title: "Osteria Corvo",
      featured: true,
      year: "2026",
      client: "Restaurant",
      url: "../osteria/",
      awards: 0,
      summary: "One menu, two sittings. Wine pairing, cellar and live seat counts.",
      media: [
        { w: 16, h: 9, src: "img/shots/osteria-1.jpg", caption: "Home" },
        { w: 16, h: 9, src: "img/shots/osteria-2.jpg", caption: "Tonight's menu" },
        { w: 16, h: 9, src: "img/shots/osteria-3.jpg", caption: "The courses" }
      ]
    },
    {
      slug: "lumen",
      title: "Lumen",
      featured: true,
      year: "2026",
      client: "Photographer",
      url: "../lumen/",
      awards: 0,
      summary: "Photographer's light table. Viewfinder hero, filterable frames, loupe lightbox.",
      media: [
        { w: 16, h: 9, src: "img/shots/lumen-1.jpg", caption: "Viewfinder" },
        { w: 16, h: 9, src: "img/shots/lumen-2.jpg", caption: "The light table" },
        { w: 16, h: 9, src: "img/shots/lumen-3.jpg", caption: "Frames" }
      ]
    },
    {
      slug: "atelier",
      title: "Atelier Moura",
      featured: true,
      year: "2026",
      client: "showcase",
      url: "../atelier/",
      awards: 0,
      summary: "Bespoke tailor. Draw your jacket live, browse the cloth, book a fitting.",
      media: [
        { w: 16, h: 9, src: "img/shots/atelier-1.jpg", caption: "Home" },
        { w: 16, h: 9, src: "img/shots/atelier-2.jpg", caption: "Jacket designer" },
        { w: 16, h: 9, src: "img/shots/atelier-3.jpg", caption: "Cloth book" }
      ]
    }
  ]
};
