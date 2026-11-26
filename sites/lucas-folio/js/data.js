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
  awards: "12 sites — one repository, no build step.",
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
      slug: "forma",
      group: "examples",   // examples | live | past (the buttons at the top of the stage)
      title: "3D Print Store",
      featured: true,
      year: "2026",
      client: "Shop",
      url: "../forma/",
      awards: 0,
      summary: "3D-print shop. Catalogue, cart, checkout and a quote estimator, all in the browser.",
      media: [
        { w: 16, h: 9, src: "img/shots/forma-1.jpg", caption: "Home" },
        { w: 16, h: 9, src: "img/shots/forma-2.jpg", caption: "Categories" },
        { w: 16, h: 9, src: "img/shots/forma-3.jpg", caption: "Featured products" },
        { w: 16, h: 9, src: "img/shots/forma-4.jpg", caption: "More products" }
      ]
    },
    {
      slug: "montra",
      group: "examples",   // examples | live | past (the buttons at the top of the stage)
      title: "Salon Storefront",
      featured: true,
      year: "2026",
      client: "Salon",
      url: "../montra/",
      awards: 0,
      summary: "Hair and beauty salon as a shopfront: awning, a door sign that really says open or closed, price board and online booking.",
      media: [
        { w: 16, h: 9, src: "img/shots/montra-1.jpg", caption: "Shopfront" },
        { w: 16, h: 9, src: "img/shots/montra-2.jpg", caption: "Price board" },
        { w: 16, h: 9, src: "img/shots/montra-3.jpg", caption: "Booking" },
        { w: 16, h: 9, src: "img/shots/montra-4.jpg", caption: "Team" }
      ]
    },
    {
      slug: "rotulo",
      group: "examples",   // examples | live | past (the buttons at the top of the stage)
      title: "Salon Label",
      featured: true,
      year: "2026",
      client: "Salon",
      url: "../rotulo/",
      awards: 0,
      summary: "Hair and beauty salon as a product label: bold grid, counted facts, the full price table and online booking.",
      media: [
        { w: 16, h: 9, src: "img/shots/rotulo-1.jpg", caption: "Label" },
        { w: 16, h: 9, src: "img/shots/rotulo-2.jpg", caption: "Price table" },
        { w: 16, h: 9, src: "img/shots/rotulo-3.jpg", caption: "Booking" },
        { w: 16, h: 9, src: "img/shots/rotulo-4.jpg", caption: "Team" }
      ]
    },
    {
      slug: "leque",
      group: "examples",   // examples | live | past (the buttons at the top of the stage)
      title: "Salon Colour Fan",
      featured: true,
      year: "2026",
      client: "Salon",
      url: "../leque/",
      awards: 0,
      summary: "Hair and beauty salon on a colour fan: services and tones as blades, a house palette and online booking.",
      media: [
        { w: 16, h: 9, src: "img/shots/leque-1.jpg", caption: "Colour fan" },
        { w: 16, h: 9, src: "img/shots/leque-2.jpg", caption: "Services" },
        { w: 16, h: 9, src: "img/shots/leque-3.jpg", caption: "Palette" },
        { w: 16, h: 9, src: "img/shots/leque-4.jpg", caption: "Booking" }
      ]
    },
    {
      slug: "slab-journey",
      group: "past",   // examples | live | past (the buttons at the top of the stage)
      title: "Slab Journey",
      featured: true,
      year: "2026",
      client: "Slab Journey",
      url: "../slab-journey/",
      awards: 0,
      summary: "Price tracker for graded Pokémon cards: an Android and Windows app in Kotlin Multiplatform, and its Next.js website. Try the app in a clickable phone and browse the archived site.",
      media: [
        { w: 16, h: 9, src: "img/shots/slab-journey-1.jpg", caption: "Project" },
        { w: 16, h: 9, src: "img/shots/slab-journey-2.jpg", caption: "App" },
        { w: 16, h: 9, src: "img/shots/slab-journey-3.jpg", caption: "Website" },
        { w: 16, h: 9, src: "img/shots/slab-journey-4.jpg", caption: "Pricing" }
      ]
    },
    {
      slug: "aura-desk",
      group: "examples",   // examples | live | past (the buttons at the top of the stage)
      title: "Store BackOffice",
      featured: true,
      year: "2026",
      client: "Backoffice",
      url: "../aura-desk/",
      awards: 0,
      summary: "Aura's backoffice: requests, clients, insights, team and days off. Login demo / demo.",
      media: [
        { w: 16, h: 9, src: "img/shots/aura-desk-1.jpg", caption: "Today" },
        { w: 16, h: 9, src: "img/shots/aura-desk-2.jpg", caption: "Insights" },
        { w: 16, h: 9, src: "img/shots/aura-desk-3.jpg", caption: "Clients" },
        { w: 16, h: 9, src: "img/shots/aura-desk-4.jpg", caption: "Services" }
      ]
    },
    {
      slug: "brightline",
      group: "examples",   // examples | live | past (the buttons at the top of the stage)
      title: "House Cleaning Services",
      featured: true,
      year: "2026",
      client: "Cleaning",
      url: "../brightline/",
      awards: 0,
      summary: "Home cleaning. Instant quote, area check, booking by crew size.",
      media: [
        { w: 16, h: 9, src: "img/shots/brightline-1.jpg", caption: "Instant quote" },
        { w: 16, h: 9, src: "img/shots/brightline-2.jpg", caption: "Rooms" },
        { w: 16, h: 9, src: "img/shots/brightline-3.jpg", caption: "Booking" },
        { w: 16, h: 9, src: "img/shots/brightline-4.jpg", caption: "What's included" }
      ]
    },
    {
      slug: "nido",
      group: "examples",   // examples | live | past (the buttons at the top of the stage)
      title: "Bakery Website",
      featured: true,
      year: "2026",
      client: "Bakery",
      url: "../nido/",
      awards: 0,
      summary: "Bakery on the clock. Stock sells through the morning; pre-order for pick-up.",
      media: [
        { w: 16, h: 9, src: "img/shots/nido-1.jpg", caption: "Home" },
        { w: 16, h: 9, src: "img/shots/nido-2.jpg", caption: "Today's tray" },
        { w: 16, h: 9, src: "img/shots/nido-3.jpg", caption: "Catering" },
        { w: 16, h: 9, src: "img/shots/nido-4.jpg", caption: "Weekends" }
      ]
    },
    {
      slug: "aura",
      group: "examples",   // examples | live | past (the buttons at the top of the stage)
      title: "Hairdresser Website",
      featured: true,
      year: "2026",
      client: "Salon",
      url: "../aura/",
      awards: 0,
      summary: "Salon in Chiado. Live booking fed by Aura Desk.",
      media: [
        { w: 16, h: 9, src: "img/shots/aura-1.jpg", caption: "Home" },
        { w: 16, h: 9, src: "img/shots/aura-2.jpg", caption: "Services & prices" },
        { w: 16, h: 9, src: "img/shots/aura-3.jpg", caption: "The salon" },
        { w: 16, h: 9, src: "img/shots/aura-4.jpg", caption: "Specialists" }
      ]
    },
    {
      slug: "osteria",
      group: "examples",   // examples | live | past (the buttons at the top of the stage)
      title: "Restaurant Website",
      featured: true,
      year: "2026",
      client: "Restaurant",
      url: "../osteria/",
      awards: 0,
      summary: "One menu, two sittings. Wine pairing, cellar and live seat counts.",
      media: [
        { w: 16, h: 9, src: "img/shots/osteria-1.jpg", caption: "Home" },
        { w: 16, h: 9, src: "img/shots/osteria-2.jpg", caption: "Tonight's menu" },
        { w: 16, h: 9, src: "img/shots/osteria-3.jpg", caption: "The courses" },
        { w: 16, h: 9, src: "img/shots/osteria-4.jpg", caption: "The garden" }
      ]
    },
    {
      slug: "lumen",
      group: "examples",   // examples | live | past (the buttons at the top of the stage)
      title: "Photographer Website",
      featured: true,
      year: "2026",
      client: "Photographer",
      url: "../lumen/",
      awards: 0,
      summary: "Photographer's light table. Viewfinder hero, filterable frames, loupe lightbox.",
      media: [
        { w: 16, h: 9, src: "img/shots/lumen-1.jpg", caption: "Viewfinder" },
        { w: 16, h: 9, src: "img/shots/lumen-2.jpg", caption: "The light table" },
        { w: 16, h: 9, src: "img/shots/lumen-3.jpg", caption: "Frames" },
        { w: 16, h: 9, src: "img/shots/lumen-4.jpg", caption: "Series" }
      ]
    },
    {
      slug: "atelier",
      group: "examples",   // examples | live | past (the buttons at the top of the stage)
      title: "HandBuilt/Rustic Item Store",
      featured: true,
      year: "2026",
      client: "showcase",
      url: "../atelier/",
      awards: 0,
      summary: "Bespoke tailor. Draw your jacket live, browse the cloth, book a fitting.",
      media: [
        { w: 16, h: 9, src: "img/shots/atelier-1.jpg", caption: "Home" },
        { w: 16, h: 9, src: "img/shots/atelier-2.jpg", caption: "Jacket designer" },
        { w: 16, h: 9, src: "img/shots/atelier-3.jpg", caption: "Cloth book" },
        { w: 16, h: 9, src: "img/shots/atelier-4.jpg", caption: "Process" }
      ]
    }
  ]
};
