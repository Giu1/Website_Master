# Nido

Fictional neighbourhood bakery in Campo de Ourique. Cream, cocoa and crust; Young Serif + Outfit. EN + PT-PT. One page (the old menu, events, catering and contact pages are now sections).

Everything runs on the clock:
- **Open / closed** pill in the header, from the real opening hours.
- **Out of the oven today** — each bake's time, marked as out or next.
- **The tray** — each product has a daily batch that sells through the morning, so counts fall over time and items show when they sold out. Orders placed for today come off the count too.
- **Basket** — a slide-in drawer: quantities, pick-up today or tomorrow, a time slot (past slots hidden), name and phone. Sold-out items become pre-orders for tomorrow. Orders get a code and a status that moves from *received* to *in the oven* to *on the shelf* as pick-up approaches (`localStorage["nido-orders"]`).
- **Weekends** — classes and the Sunday cinnamon list with places left; sign up or remove yourself (`localStorage["nido-events"]`).
- **Catering** — people slider and light/full boxes give boxes, mix and total; the quote request stays on the page.

Products, hours and events live at the top of `js/main.js`.
