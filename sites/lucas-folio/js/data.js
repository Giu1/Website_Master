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
      media: [{ w: 16, h: 9, src: "img/lucas-card.jpg", caption: "Freelancer" }]
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
      media: [{ w: 16, h: 9, src: "img/mare.jpg", caption: "Stage" }]
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
      media: [{ w: 16, h: 9, src: "img/largo.jpg", caption: "Shop" }]
    },
    {
      slug: "aura-desk",
      title: "Aura Desk",
      featured: true,
      year: "2026",
      client: "Backoffice",
      url: "../aura-desk/",
      awards: 0,
      summary: "Backoffice for the Aura salon. Bookings, services, staff and site copy. Login demo / demo.",
      media: [{ w: 16, h: 9, src: "img/largo.jpg", caption: "Desk" }]
    },
    {
      slug: "brightline",
      title: "Brightline",
      featured: true,
      year: "2026",
      client: "Cleaning",
      url: "../brightline/",
      awards: 0,
      summary: "Home cleaning. Sage pages, services, areas and a quote form built to convert.",
      media: [{ w: 16, h: 9, src: "img/estacao.jpg", caption: "Cleaning" }]
    },
    {
      slug: "nido",
      title: "Nido",
      featured: true,
      year: "2026",
      client: "Bakery",
      url: "../nido/",
      awards: 0,
      summary: "Neighbourhood bakery. Warm cocoa, the daily tray, weekend lists and catering.",
      media: [{ w: 16, h: 9, src: "img/mare.jpg", caption: "Bakery" }]
    },
    {
      slug: "aura",
      title: "Aura",
      featured: true,
      year: "2026",
      client: "Salon",
      url: "../aura/",
      awards: 0,
      summary: "Salon in Chiado. Cream pages, booking, team and gallery, fed by Aura Desk.",
      media: [{ w: 16, h: 9, src: "img/costa.jpg", caption: "Salon" }]
    },
    {
      slug: "vela",
      title: "Vela",
      featured: true,
      year: "2026",
      client: "Perfume",
      url: "../vela/",
      awards: 0,
      summary: "One perfume, one page. Night purple, type first, a sample request at the end.",
      media: [{ w: 16, h: 9, src: "img/nuno.jpg", caption: "Perfume" }]
    },
    {
      slug: "osteria",
      title: "Osteria Corvo",
      featured: true,
      year: "2026",
      client: "Restaurant",
      url: "../osteria/",
      awards: 0,
      summary: "A restaurant told as one service. Paper tones, editorial type and a reservation form.",
      media: [{ w: 16, h: 9, src: "img/calma.jpg", caption: "Restaurant" }]
    },
    {
      slug: "lumen",
      title: "Lumen",
      featured: true,
      year: "2026",
      client: "Photographer",
      url: "../lumen/",
      awards: 0,
      summary: "Photographer lookbook. Near-black, a horizontal rail, almost no copy.",
      media: [{ w: 16, h: 9, src: "img/bruma.jpg", caption: "Lookbook" }]
    },
    {
      slug: "atelier",
      title: "Atelier",
      featured: true,
      year: "2026",
      client: "Studio",
      url: "../atelier/",
      awards: 0,
      summary: "Sales studio for the handmade sites. Dark pages, demo grid and packages.",
      media: [{ w: 16, h: 9, src: "img/arquivo.jpg", caption: "Studio" }]
    }
  ]
};
