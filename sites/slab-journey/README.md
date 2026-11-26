# Slab Journey (past project)

Showcase page for Slab Journey, a price tracker for graded Pokémon cards. It appears on
`sites/lucas-folio/` under **Past projects**.

## What is here

| Path | What it is |
| --- | --- |
| `index.html`, `css/`, `js/phone.js` | Project page with a clickable phone that previews the Android app |
| `img/app/` | Card art cut from the app's own screenshots (plus the Charizard from the website hero) |
| `img/web-*.jpg` | Screenshots of the website used on the project page |
| `web/` | Archived static copy of slabjourney.com (10 pages) |

## The phone preview

`js/phone.js` rebuilds seven app screens in HTML: Welcome, Market Explorer, Card detail,
Set tracker, Portfolio, Community and Account. Colours, layout and wording come from the
app's Compose code (`shared/src/commonMain/.../ui/`, `ui/theme/SlabJourneyColors.kt`,
`ui/i18n/AppStringsEn.kt`). Card prices are the ones shown in the app's screenshots.
Collection, portfolio and community numbers are demo data.

## The archived website

`web/` was made by running the Next.js site locally with placeholder keys and saving each
rendered page with Playwright: scripts removed, links rewritten to `.html` files, CSS, fonts
and images copied into `web/assets/`. `web/archive.js` puts back the mobile menu, the FAQ
accordion and the dark mode toggle, and turns off the sign-up and sign-in forms. No keys or
secrets are in the copy.

To refresh it, run the site from the `slab-journey` repo (`npm run dev`) and repeat the
snapshot; the script used is described above.
