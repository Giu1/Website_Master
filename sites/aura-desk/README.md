# Aura Desk

Backoffice SPA for Aura. Login `demo` / `demo` (`sessionStorage["aura-desk-auth"]`).

**Page:** `index.html` — dashboard, bookings, services, staff, hours, site copy.

Writes `localStorage["aura-demo-store"]` through `js/store.js` (keep identical to `aura/js/store.js`). `js/app.js` re-renders tables on `langchange`. Same origin as Aura is required for the public site to see edits.

Not real auth. See root `HANDOFF.md`.
