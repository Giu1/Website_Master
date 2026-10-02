# Aura Desk

Backoffice for Aura, as a working demo. Sign in with `demo` / `demo` (`sessionStorage["aura-desk-auth"]`, not real security).

**Views**
- **Today** — bookings today, requests waiting, expected takings, free slots; a day timeline per stylist (‹ › to change day; click a booking to open it); a "Try the demo" checklist that ticks itself.
- **Requests** — pending bookings from the website: accept or decline.
- **Bookings** — upcoming / past / all, status filter, search; confirm, mark done or cancel. **New booking** (walk-in or phone) offers only free times.
- **Services** — edit names (EN + PT), category, price, minutes, on/off site; add and remove. Saves as you type.
- **Team** — name, role (EN + PT), colour, working days, which services each person does.
- **Hours** — open/closed and times per weekday.
- **Site copy** — announcement, headline, intro (EN + PT), address and phone.
- **Reset demo data** in the sidebar.

**The demo loop:** keep the Aura site open in another tab. A booking made there shows up here instantly with a notification; accepting it changes the status on the site without a reload. Prices, hours, team and copy edited here repaint the site live.

Data: `js/store.js` (`localStorage["aura-demo-store-v2"]`) — keep identical to `../aura/js/store.js`. Both sites must be served from the same origin.
