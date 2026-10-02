/**
 * FOLIO — design-engineer portfolio template
 * Edit this file to swap the person, projects, links and copy.
 * Field guide: sites/folio/README.md
 *
 * Example content is fictional. Replace it; do not paste someone else's
 * clients, films, or biography in here.
 */
window.FOLIO = {
  name: "Elena Voss",
  role: "design engineer",
  email: "ola@elenavoss.studio",
  awards: "Festival mentions go here — replace this line.",
  bio: [
    "Elena Voss is a design engineer working from Porto. She builds brand sites where motion and interaction carry the idea — drag, scroll, and the moment a page becomes a place.",
    "Usually the lead or only front-end developer, beside a studio or an in-house design team. Freelance, and open to work anywhere."
  ],
  newsletter:
    "A short note a few times a year about building interactive sites. This template only stores the address in this browser until you connect a real form.",
  links: [
    { label: "Instagram", href: "" },
    { label: "X", href: "" },
    { label: "LinkedIn", href: "" }
  ],

  /**
   * projects[]
   * featured: true  → card on the home stage and a case study
   * featured: false → name on the full index only
   * url:            → "Visit" chip, and index-only items open this link
   * media[0]        → the card. Later items stack inside the case.
   *   w, h          → aspect (card width follows this)
   *   colors        → [from, to] when there is no src
   *   kind          → "serif" | "sans" | "stack"
   *   word          → big type on the generated poster
   *   ink           → type color
   *   src           → optional image path, relative to folio/ (img/mare.jpg)
   *   caption       → line under the image in the case
   */
  projects: [
    {
      slug: "mare",
      title: "Maré",
      featured: true,
      year: "2025",
      client: "Maré Hotels",
      url: "",
      awards: 1,
      summary:
        "A booking site for a small coastal hotel. Rooms, tide times, and a lobby film, paced so the photography does the talking.",
      media: [
        { w: 1600, h: 900, src: "img/mare.jpg", kind: "serif", word: "Maré", colors: ["#16343c", "#d7b48a"], ink: "#f4efe6", caption: "Home" },
        { w: 1600, h: 1100, kind: "sans", word: "Rooms\nover the water", colors: ["#0e242b", "#8fb8b0"], ink: "#f3f6f4", caption: "Suites" },
        { w: 1400, h: 900, kind: "stack", word: "CHECK IN\nAFTER FOUR", colors: ["#e7d3b4", "#8c5a3c"], ink: "#2a160e", caption: "Arrival" }
      ]
    },
    {
      slug: "largo",
      title: "Tipo Largo",
      featured: true,
      year: "2025",
      client: "Largo Type",
      url: "",
      awards: 0,
      summary:
        "Specimen for a display serif drawn for posters and mastheads. The site is mostly the letters, at sizes that fill the window.",
      media: [
        { w: 1600, h: 900, src: "img/largo.jpg", kind: "serif", word: "Largo", colors: ["#c4b49a", "#efe4d4"], ink: "#2a241c", caption: "Specimen" },
        { w: 1400, h: 1400, kind: "serif", word: "Ag", colors: ["#1a1a1a", "#3a342c"], ink: "#f3ecdf", caption: "Detail" }
      ]
    },
    {
      slug: "arquivo",
      title: "O Arquivo",
      featured: true,
      year: "2026",
      client: "Oficina Sul",
      url: "",
      awards: 2,
      summary:
        "A year capsule for a studio: references, stills, and the work that shipped. Built as a slow horizontal read.",
      media: [
        { w: 1600, h: 900, src: "img/arquivo.jpg", kind: "stack", word: "ARQUIVO\n2026", colors: ["#efefef", "#cfcfcf"], ink: "#161616", caption: "Cover" },
        { w: 1600, h: 1000, kind: "sans", word: "What we kept", colors: ["#2b2b2b", "#8a8a8a"], ink: "#f5f5f5", caption: "Index" }
      ]
    },
    {
      slug: "calma",
      title: "Manual da Calma",
      featured: true,
      year: "2024",
      client: "Calma",
      url: "",
      awards: 0,
      summary:
        "A field guide for team leads who want fewer status meetings. Short chapters, one idea per screen, type you can actually read.",
      media: [
        { w: 1600, h: 900, src: "img/calma.jpg", kind: "serif", word: "Calma", colors: ["#dfe8d8", "#8ea584"], ink: "#1d2a1c", caption: "Cover" },
        { w: 1200, h: 1500, kind: "sans", word: "01\nRest", colors: ["#f4f1ea", "#d9d3c6"], ink: "#243024", caption: "Chapter" }
      ]
    },
    {
      slug: "estacao",
      title: "Estação",
      featured: true,
      year: "2024",
      client: "Estação",
      url: "",
      awards: 1,
      summary:
        "Identity site for a night-train supper club. A timetable, a menu, and a carriage that scrolls past the window.",
      media: [
        { w: 1600, h: 900, src: "img/estacao.jpg", kind: "sans", word: "ESTAÇÃO", colors: ["#0c1220", "#3d4d73"], ink: "#e8eefc", caption: "Night service" },
        { w: 1400, h: 1000, kind: "serif", word: "22:40", colors: ["#14110e", "#c4552b"], ink: "#f6e7d4", caption: "Menu" }
      ]
    },
    {
      slug: "nuno",
      title: "Nuno Vale",
      featured: true,
      year: "2023",
      client: "Nuno Vale",
      url: "",
      awards: 0,
      summary:
        "Portfolio for a Lisbon art director. Type-led pages, a project index that is just names, and case pages with almost no chrome.",
      media: [
        { w: 1600, h: 900, src: "img/nuno.jpg", kind: "serif", word: "Vale", colors: ["#e7d5d0", "#a56b73"], ink: "#2a1418", caption: "Home" },
        { w: 1500, h: 1000, kind: "stack", word: "SELECTED\nWORK", colors: ["#f7f4f1", "#ddd6cf"], ink: "#1a1a1a", caption: "Index" }
      ]
    },
    {
      slug: "costa",
      title: "Costa Clara",
      featured: true,
      year: "2025",
      client: "Costa Clara",
      url: "",
      awards: 0,
      summary:
        "Story site for a string of guesthouses along one coast. Map, houses, and a film per bay — same grid, different light.",
      media: [
        { w: 1600, h: 900, src: "img/costa.jpg", kind: "serif", word: "Clara", colors: ["#e6d2b8", "#6e8c9a"], ink: "#1c2a30", caption: "Coast" },
        { w: 1400, h: 1050, kind: "sans", word: "House 04", colors: ["#f3efe7", "#c9845a"], ink: "#2c2118", caption: "House" }
      ]
    },
    {
      slug: "bruma",
      title: "Bruma",
      featured: true,
      year: "2023",
      client: "Bruma",
      url: "",
      awards: 1,
      summary:
        "Site for a strategy and design studio. A long list of work, a short manifesto, and pages that stay quiet on purpose.",
      media: [
        { w: 1600, h: 900, src: "img/bruma.jpg", kind: "sans", word: "BRUMA", colors: ["#d9dde2", "#8b939c"], ink: "#1b1e22", caption: "Studio" },
        { w: 1300, h: 1300, kind: "stack", word: "DESIGN\n&\nSTRATEGY", colors: ["#111214", "#2c3036"], ink: "#f2f3f5", caption: "Manifesto" }
      ]
    },

    { slug: "rua-norte", title: "Rua Norte", featured: false, year: "2024", client: "Rua Norte", url: "", awards: 0, summary: "Shop site for a ceramics studio. Catalog, kiln calendar, and a visit page.", media: [{ w: 1400, h: 1000, kind: "serif", word: "Norte", colors: ["#e8dcc8", "#b4532a"], ink: "#2a140c" }] },
    { slug: "atelier-19", title: "Atelier 19", featured: false, year: "2024", client: "Atelier 19", url: "", awards: 0, summary: "Archive site for a photography duo. Contact sheets as the navigation.", media: [{ w: 4, h: 5, kind: "sans", word: "19", colors: ["#111", "#444"], ink: "#eee" }] },
    { slug: "pico", title: "Pico", featured: false, year: "2023", client: "Pico", url: "", awards: 0, summary: "Launch page for a trail race on the island. One map, three distances.", media: [{ w: 16, h: 9, kind: "stack", word: "PICO\n42K", colors: ["#12362b", "#d6c7a1"], ink: "#f4f1e6" }] },
    { slug: "serra", title: "Serra", featured: false, year: "2023", client: "Serra", url: "", awards: 0, summary: "Wine label and a one-page story for a small quinta.", media: [{ w: 3, h: 4, kind: "serif", word: "Serra", colors: ["#4a1c24", "#e6d2b0"], ink: "#f8f1e4" }] },
    { slug: "leme", title: "Leme Studio", featured: false, year: "2022", client: "Leme", url: "", awards: 0, summary: "Portfolio index for an architecture office. Drawings first, words second.", media: [{ w: 16, h: 10, kind: "sans", word: "LEME", colors: ["#e8e4dc", "#9aa0a6"], ink: "#1c1c1c" }] },
    { slug: "patio", title: "Casa Pátio", featured: false, year: "2022", client: "Casa Pátio", url: "", awards: 0, summary: "Guesthouse site with a courtyard plan you can scroll through.", media: [{ w: 5, h: 4, kind: "serif", word: "Pátio", colors: ["#f0e6d4", "#7d8c6a"], ink: "#24301c" }] },
    { slug: "vela", title: "Vela", featured: false, year: "2022", client: "Vela", url: "", awards: 0, summary: "Campaign page for a sailcloth bag. Three products, one film.", media: [{ w: 1, h: 1, kind: "sans", word: "VELA", colors: ["#f7f7f5", "#b9c3c9"], ink: "#102028" }] },
    { slug: "linha", title: "Linha 7", featured: false, year: "2021", client: "Linha 7", url: "", awards: 0, summary: "Editorial site for a weekly city paper. Masthead, then the issue.", media: [{ w: 16, h: 9, kind: "stack", word: "LINHA\nSETE", colors: ["#f4f1ea", "#111"], ink: "#111" }] }
  ]
};
