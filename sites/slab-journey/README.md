# Slab Journey (past project)

Slab Journey, a price tracker for graded Pokémon cards. It appears on `sites/lucas-folio/`
under **Past projects**. The live preview opens on the website; the **App** button beside
Desktop/Mobile swaps it for the app on a phone.

## What is here

| Path | What it is |
| --- | --- |
| `index.html` | Redirects to `web/index.html` |
| `web/` | Archived static copy of slabjourney.com (10 pages) |
| `app.html`, `css/`, `js/phone.js` | The Android app rebuilt for the web: fills the screen on a phone, shows a phone frame on wider screens |
| `img/app/` | Card art cut from the app's own screenshots (plus the Charizard from the website hero) |
| `img/screens/` | 48 full-screen app screenshots (1920×1200) in app order; the Past projects card shows 4 and the screenshot viewer steps through all of them |

The App button is driven by the `app` field of the project in `sites/lucas-folio/js/data.js`.
Any project with an `app` URL gets the button.

## The app

`js/phone.js` rebuilds seven app screens: Welcome, Market Explorer, Card detail, Set tracker,
Portfolio, Community and Account. Colours, layout and wording come from the app's Compose
code (`shared/src/commonMain/.../ui/`, `ui/theme/SlabJourneyColors.kt`,
`ui/i18n/AppStringsEn.kt`). Card prices are the ones shown in the app's screenshots.
Collection, portfolio and community numbers are demo data.

## The archived website

`web/` was made by running the Next.js site locally with placeholder keys and saving each
rendered page with Playwright: scripts removed, links rewritten to `.html` files, CSS, fonts
and images copied into `web/assets/`. `web/archive.js` puts back the mobile menu, the FAQ
accordion and the dark mode toggle, and turns off the sign-up and sign-in forms. No keys or
secrets are in the copy.
