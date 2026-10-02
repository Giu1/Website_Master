# Brightline

Fictional home-cleaning company in Lisboa, Oeiras, Cascais and Almada. Paper, ink and one lime line; Plus Jakarta Sans. EN + PT-PT. One page (the old services, deep-clean, move-out, office, areas, quote and contact pages are now sections).

The quote drives everything:
- **Your price** — service (regular / deep / move-out / office), size (T0–T4 or office m²), bathrooms, frequency (weekly −20%, fortnightly −15%, monthly −10%; move-out is one-off) and extras. Shows a live price, cleaning hours, crew size and time at your place (`localStorage["brightline-quote"]`).
- **What's included** — room tabs with a task table comparing regular, deep and move-out; your chosen service's column is highlighted.
- **Areas** — postcode or neighbourhood check; Cascais and Almada add a travel fee, Amadora is "soon" (`localStorage["brightline-area"]`).
- **Book** — next 12 days (no Sundays) and three arrival windows. Each window has a stable made-up number of free cleaners; windows that can't fit your crew are disabled. Bookings get a `BL-XXXX` code, recurring ones list the next visits, and upcoming ones can be cancelled (`localStorage["brightline-bookings"]`).
- Reviews, the 48-hour promise, FAQ, and a sticky price-and-book bar on phones.

Rates, sizes, zones, room tasks, reviews and FAQ live at the top of `js/main.js`.
