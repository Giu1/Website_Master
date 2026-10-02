# Aura

Fictional salon in Chiado. Cream and espresso, Newsreader + Figtree. EN + PT-PT.

**Pages**
- `index.html` — hero with a live "next free cut", services and prices (grouped, each row books that service), team with working days, salon photo strip, visit card with live "open now" and hours.
- `booking.html` — service → stylist (or first available) → day → time → details. Times come from real availability (opening hours, stylists' days, service length, existing bookings). A request is saved as **pending** with a reference (`AU-XXXX`); the thank-you screen and "Already booked?" lookup show its status, which updates live when Aura Desk accepts or declines it.

Links like `booking.html?service=cut&staff=ana&date=YYYY-MM-DD&time=HH:MM` arrive with those choices made.

**Data** comes from `js/store.js` (`localStorage["aura-demo-store-v2"]`), shared with `../aura-desk/` — keep both copies identical. Visitor-facing text is stored in both languages. Changes in another tab arrive through the storage event, so the site repaints itself while the desk is being used.

Scripts: `store.js` → `i18n.js` → `lang.js` → `main.js` (+ `booking.js` on the booking page).
