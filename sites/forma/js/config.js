/**
 * FORMA — site config
 *
 * 1. ownerEmail: where orders, contact messages and waitlist signups arrive
 *    (FormSubmit.co, free, works on GitHub Pages). The first real submission
 *    sends you a confirmation link — click it once.
 * 2. formspreeId: optional alternative to ownerEmail (https://formspree.io).
 * 3. whatsapp: international number, digits only (e.g. "351912345678").
 *    Used for the floating button, checkout via WhatsApp and the footer.
 */
window.FORMA_CONFIG = {
  brand: "FORMA",
  tagline: "atelier 3D",
  domain: "forma3d.pt",
  ownerEmail: "",
  formspreeId: "",
  contactEmail: "ola@forma3d.pt",
  whatsapp: "",
  instagram: "",
  tiktok: "",
  shopYear: "2026",
  currency: "EUR",
  /** Shipping zones shown at checkout. price in EUR, freeFrom = free shipping threshold (null = never). */
  shipping: {
    freeFrom: 60,
    zones: [
      { id: "pt", price: 4.5, days: "2–4" },
      { id: "eu", price: 9.5, days: "5–9" },
      { id: "br", price: 19, days: "10–20" },
      { id: "pickup", price: 0, days: "—" }
    ]
  },
  /** Payment methods listed at checkout (informational; payment is confirmed by e-mail/WhatsApp). */
  payments: ["mbway", "transfer", "paypal"],
  quote: {
    currency: "EUR",
    minPrice: 8,
    markup: 2.15,
    setupFee: 3.5,
    hourlyMachine: 4.5,
    laborHour: 12,
    waste: 0.12,
    cm3PerHour: 18,
    bed: { x: 330, y: 320, z: 325 },
    materials: {
      pla: { density: 1.24, pricePerKg: 22 },
      petg: { density: 1.27, pricePerKg: 28 }
    }
  }
};
