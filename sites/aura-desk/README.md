# Aura Desk

Backoffice for Aura, as a working demo. Sign in with `demo` / `demo` (`sessionStorage["aura-desk-auth"]`, not real security).

**Views**
- **Today** — bookings today, requests waiting, expected takings, free slots; a day timeline per stylist (‹ › to change day; click a booking to open it); a "Try the demo" checklist that ticks itself.
- **Requests** — pending bookings from the website: accept or decline.
- **Bookings** — upcoming / past / all, status filter, search; confirm, mark done or cancel. **New booking** (walk-in or phone) offers only free times.
- **Clients** — one row per client built from every booking (visits, last and next visit, usual service, spend). Click for history, rhythm ("comes every n days") and **Book again**, which opens New booking prefilled.
- **Insights** — six weeks of revenue per week, appointments, average ticket, online share, cancellations, what is booked ahead, most booked services and chair time booked per stylist this week.
- **Services** — edit names (EN + PT), category, price, minutes, on/off site; add and remove. Saves as you type.
- **Team** — a Compact / Spacious switch (remembered in `localStorage["aura-desk-team-layout"]`; Spacious gives each person a full-width row with a day-by-day strip of this week). Name, role (EN + PT), colour, working days, which services each person does, this week's load, and days off (refused if that day already has bookings). Days off close that stylist's times on the site.
- **Hours** — open/closed and times per weekday.
- **Site copy** — announcement, headline, intro (EN + PT), address and phone.
- **Reset demo data** in the sidebar.

**The demo loop:** keep the Aura site open in another tab. A booking made there shows up here instantly with a notification; accepting it changes the status on the site without a reload. Prices, hours, team and copy edited here repaint the site live.

Data: `js/store.js` (`localStorage["aura-demo-store-v2"]`, data `version: 3`, seeded with seven weeks of finished appointments) — keep identical to `../aura/js/store.js`. Both sites must be served from the same origin.
