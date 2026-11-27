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
      slug: "mysticlis",
      group: "live",   // examples | live | past (the buttons at the top of the stage)
      title: "Mystic Lis",
      featured: true,
      year: "2026",
      client: "Candles",
      url: "https://giu1.github.io/MysticLis_Website_-_LinkTree/",
      awards: 0,
      summary: "Handmade candles and event favours, live on GitHub Pages. A link-tree home, a filterable shop of real pieces, a photo gallery, an events page and a guided order form. Growing into a full shop.",
      media: [
        { w: 16, h: 9, src: "img/shots/mysticlis-1.jpg", caption: "Home" },
        { w: 16, h: 9, src: "img/shots/mysticlis-2.jpg", caption: "Shop" },
        { w: 16, h: 9, src: "img/shots/mysticlis-3.jpg", caption: "Gallery" },
        { w: 16, h: 9, src: "img/shots/mysticlis-4.jpg", caption: "Events" }
      ]
    },
    {
      slug: "slab-journey",
      group: "past",   // examples | live | past (the buttons at the top of the stage)
      title: "Slab Journey",
      featured: true,
      year: "2026",
      client: "Slab Journey",
      url: "../slab-journey/web/index.html",
      app: "../slab-journey/app.html",   // the "App" button in the live preview swaps the site for this
      awards: 0,
      summary: "Price tracker and trading community for graded Pokémon cards: live market prices, set completion, portfolio profit and loss, and trades between collectors and shops. Windows, Android and iOS ready. Press App in the preview to try it, or open the screenshots for a full tour.",
      // the case sheet shows the first 4; the overlay steps through all of them
      media: [
        { w: 16, h: 10, src: "../slab-journey/img/screens/03-explorer-grid.jpg", caption: "Market Explorer, card grid" },
        { w: 16, h: 10, src: "../slab-journey/img/screens/08-card-market-data.jpg", caption: "Prices by grade" },
        { w: 16, h: 10, src: "../slab-journey/img/screens/12-set-detail.jpg", caption: "Set completion" },
        { w: 16, h: 10, src: "../slab-journey/img/screens/17-portfolio-gallery.jpg", caption: "Portfolio gallery" },
        { w: 16, h: 10, src: "../slab-journey/img/screens/01-welcome.jpg", caption: "Welcome" },
        { w: 16, h: 10, src: "../slab-journey/img/screens/02-explorer-list.jpg", caption: "Market Explorer" },
        { w: 16, h: 10, src: "../slab-journey/img/screens/04-explorer-filters.jpg", caption: "Filter and sort" },
        { w: 16, h: 10, src: "../slab-journey/img/screens/05-market-movers.jpg", caption: "Market movers" },
        { w: 16, h: 10, src: "../slab-journey/img/screens/06-set-value-index.jpg", caption: "Set value index" },
        { w: 16, h: 10, src: "../slab-journey/img/screens/07-card-detail.jpg", caption: "Card detail" },
        { w: 16, h: 10, src: "../slab-journey/img/screens/09-sets-grid.jpg", caption: "Set tracker" },
        { w: 16, h: 10, src: "../slab-journey/img/screens/10-sets-list.jpg", caption: "Set tracker, list" },
        { w: 16, h: 10, src: "../slab-journey/img/screens/11-sets-compact.jpg", caption: "Set tracker, compact" },
        { w: 16, h: 10, src: "../slab-journey/img/screens/13-portfolio-overview.jpg", caption: "Portfolio" },
        { w: 16, h: 10, src: "../slab-journey/img/screens/14-holdings-bulk.jpg", caption: "Holdings, bulk edit" },
        { w: 16, h: 10, src: "../slab-journey/img/screens/15-holdings-detailed.jpg", caption: "Holdings, detailed" },
        { w: 16, h: 10, src: "../slab-journey/img/screens/16-holdings-grid.jpg", caption: "Holdings, grid" },
        { w: 16, h: 10, src: "../slab-journey/img/screens/18-portfolio-performance.jpg", caption: "Performance" },
        { w: 16, h: 10, src: "../slab-journey/img/screens/19-community.jpg", caption: "Community" },
        { w: 16, h: 10, src: "../slab-journey/img/screens/20-community-view-2.jpg", caption: "Community, shops" },
        { w: 16, h: 10, src: "../slab-journey/img/screens/21-community-view-3.jpg", caption: "Community, collectors" },
        { w: 16, h: 10, src: "../slab-journey/img/screens/22-community-view-4.jpg", caption: "Community, compact" },
        { w: 16, h: 10, src: "../slab-journey/img/screens/23-collector-profile.jpg", caption: "Collector profile" },
        { w: 16, h: 10, src: "../slab-journey/img/screens/24-collector-profile-view-2.jpg", caption: "Collector sets" },
        { w: 16, h: 10, src: "../slab-journey/img/screens/25-collector-profile-view-3.jpg", caption: "Collector cards" },
        { w: 16, h: 10, src: "../slab-journey/img/screens/26-shop-storefront.jpg", caption: "Shop storefront" },
        { w: 16, h: 10, src: "../slab-journey/img/screens/27-following.jpg", caption: "Following" },
        { w: 16, h: 10, src: "../slab-journey/img/screens/28-trades-open.jpg", caption: "Open trades" },
        { w: 16, h: 10, src: "../slab-journey/img/screens/29-trades-public-board.jpg", caption: "Public trade board" },
        { w: 16, h: 10, src: "../slab-journey/img/screens/30-trades-history.jpg", caption: "Trade history" },
        { w: 16, h: 10, src: "../slab-journey/img/screens/31-my-public-trade.jpg", caption: "My public trade" },
        { w: 16, h: 10, src: "../slab-journey/img/screens/32-my-public-trade-grid.jpg", caption: "My public trade, grid" },
        { w: 16, h: 10, src: "../slab-journey/img/screens/33-public-trade-from-collector.jpg", caption: "Trade from a collector" },
        { w: 16, h: 10, src: "../slab-journey/img/screens/34-propose-trade.jpg", caption: "Propose a trade" },
        { w: 16, h: 10, src: "../slab-journey/img/screens/35-offer-received.jpg", caption: "Offer received" },
        { w: 16, h: 10, src: "../slab-journey/img/screens/36-offer-sent.jpg", caption: "Offer sent" },
        { w: 16, h: 10, src: "../slab-journey/img/screens/37-trade-agreed.jpg", caption: "Trade agreed" },
        { w: 16, h: 10, src: "../slab-journey/img/screens/38-trade-completed.jpg", caption: "Trade completed" },
        { w: 16, h: 10, src: "../slab-journey/img/screens/39-create-public-trade.jpg", caption: "Create a public trade" },
        { w: 16, h: 10, src: "../slab-journey/img/screens/40-transaction-history.jpg", caption: "Transaction history" },
        { w: 16, h: 10, src: "../slab-journey/img/screens/41-transaction-history-trades.jpg", caption: "Transactions, trades" },
        { w: 16, h: 10, src: "../slab-journey/img/screens/42-shop-buy-counter-offer.jpg", caption: "Shop counter-offer" },
        { w: 16, h: 10, src: "../slab-journey/img/screens/43-shop-buy-request.jpg", caption: "Buy from a shop" },
        { w: 16, h: 10, src: "../slab-journey/img/screens/44-sell-to-shop.jpg", caption: "Sell to a shop" },
        { w: 16, h: 10, src: "../slab-journey/img/screens/45-notifications.jpg", caption: "Notifications" },
        { w: 16, h: 10, src: "../slab-journey/img/screens/46-listing-alerts.jpg", caption: "Listing alerts" },
        { w: 16, h: 10, src: "../slab-journey/img/screens/47-guide.jpg", caption: "In-app guide" },
        { w: 16, h: 10, src: "../slab-journey/img/screens/48-account.jpg", caption: "Account" }
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
