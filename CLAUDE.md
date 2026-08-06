# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository purpose

Public static website for **Super Discount**, a discount store in El Sereno, Los Angeles (spray paint/markers, party supplies, household goods, snacks, exotic sodas, table & chair rentals, novelties). Live at https://epicsereno.github.io/superdiscount/.

This repo holds only the customer-facing static files served via GitHub Pages — there is no backend, CMS, or build pipeline. Deploys happen by pushing HTML/CSS/JS directly to `main`.

## Tech stack

- Plain HTML5, hand-written CSS (custom properties, Grid/Flexbox, `clamp()` fluid type), vanilla JS. No framework, no bundler, no package.json.
- Hosted on GitHub Pages with Jekyll disabled (`.nojekyll`), served under the `/superdiscount/` path prefix (this is a project page, not a user/org page).

## Local development

No build tooling. Serve the directory root with any static file server:

```bash
python3 -m http.server 8000
# http://localhost:8000/index.html
# http://localhost:8000/preview.html
```

There is no test suite, linter, or build/typecheck command in this repo — verify changes by loading the page in a browser. Note that absolute-path links in `404.html` (e.g. `/superdiscount/favicon.ico`) only resolve correctly when served from that path prefix (as GitHub Pages does), not from `localhost:8000/`.

## Deployment

GitHub Pages deploys automatically from `main`. Pushing to `main` is a live production deploy (no CI/staging gate), so treat commits to it accordingly.

## Architecture: three pages, one stylesheet, one script — but not every page loads both

| Page | `css/styles.css` | `js/main.js` | Notes |
|---|---|---|---|
| `index.html` | yes (relative) | yes, `defer` | Live homepage; the canonical page |
| `preview.html` | yes (relative) | yes, **no `defer`** | Secondary/legacy page |
| `404.html` | yes (**absolute** `/superdiscount/…`) | **no** | Static-only; JS hooks would do nothing |

`404.html` deliberately ships no `main.js` and no nav/theme/menu controls — it hardcodes `data-theme="dark"` on `<html>` and still runs the inline theme-boot script, so a visitor's saved theme is honored but cannot be changed from that page. If you add a `data-*`-driven feature there, you must also add the `<script src="/superdiscount/js/main.js">` tag. Its asset URLs are absolute on purpose: GitHub Pages serves `404.html` at any path depth, so relative URLs would break.

`css/styles.css` (~840 lines) is organized as numbered comment sections — `1. Tokens`, `2. Base`, `3. Header / nav`, `4. Buttons`, `5. Hero`, `6. Sections`, `7. Deal cards`, `8. Shop band`, `9. About`, `10. Location + map facade`, `11. Contact`, `12. Footer`, `13. Motion & 404`, `14. preview.html only`. Keep new rules inside the matching section rather than appending at the end. Section 14 exists because `preview.html` uses a different markup vocabulary (`.service-grid`/`.service-card`, `.hero-media`, `.photo-grid`) than `index.html`'s (`.card-grid`/`.deal-card`, `.wordmark`) — changes to shared components can regress `preview.html`, so check both pages. Section 8 (`.shop-band`) is currently **dead CSS**: no page carries that markup any more (see "The online store lives in a different repo"). It's kept intentionally so the band can be restored.

Brand tokens are defined once in `:root`, with theme overrides via `[data-theme="dark"|"light"]` on `<html>`. Dark is the default — note the combined `:root, [data-theme="dark"]` selector. An inline boot `<script>` in `<head>` on **all three** pages reads `localStorage['sd-theme']` (falling back to `prefers-color-scheme`) and sets `data-theme` before first paint to avoid a flash. That boot script is duplicated verbatim in each page — update all copies together.

`js/main.js` is progressive enhancement wired entirely through **`data-*` attribute hooks**, not classes:
- `[data-menu-toggle]` / `[data-nav]` — mobile nav open/close (also closes on link click, Escape, and clicks outside the header)
- `[data-header]` — adds `.is-scrolled` once scrolled past 4px
- `[data-theme-toggle]` / `[data-theme-label]` — light/dark switch, persists to `localStorage['sd-theme']`
- `[data-map]` + `[data-map-src]` / `[data-map-load]` — lazy-loads the Google Maps iframe on click (map facade pattern, avoids loading the ~1MB embed up front)
- `[data-year]` — footer copyright year

`preview.html` carries the same hooks except the map facade — its map iframe is inline and always loaded. Because `main.js` queries by attribute and null-checks every hook, a page missing a given `data-*` attribute silently skips that feature rather than erroring.

## Image assets

- `assets/images/` — the only image directory any page actually references.
  - Inline content images on `preview.html`: `storefront.png`, `sign.png`, `frontdoor.png`. Serve these through the `.webp` variants via `<picture>`; the PNGs are 8–14× larger and exist only as the fallback `src`.
  - Metadata images: `og-cover.png` (OG/Twitter on both `index.html` and `preview.html`) and `logo.png` (JSON-LD on `index.html`). If you swap an OG image, update the `og:image:width`/`height` tags to the new file's real pixel dimensions — `og-cover.png` is 1168×784, not the 1200×630 those tags once claimed.
  - `og-image.png` (1.1 MB) is **orphaned** — nothing references it; superseded by `og-cover.png`.
- Icons are at the repo root (`favicon.svg`, `favicon.ico`, `apple-touch-icon.png`), not under `assets/`. `favicon.ico` is a 32×32 PNG-in-ICO generated to match `favicon.svg`. `404.html` links only the `.ico`.
- `public/images/` (~8 MB) — **not referenced by any HTML, CSS, or JS in the repo.** Treat it as a staged/orphaned asset set, not live inventory, unless you're wiring it into a page yourself. It holds a `products/` catalog of ~80 numbered product images (`12-skittles-2-17oz.png` with an `.svg` sibling for each), loose shots (`colorful-spray-cans.jpg`, `spray-paint-box.jpg`, `sodas-with-banner.png`/`.webp`), duplicates of the `assets/images/` storefront photos, and empty placeholder subdirs (`banners/`, `categories/`, `logos/`, each holding only `.gitkeep`).
- `/scripts/` (a local image-generation helper) is gitignored and not part of the repo — it's the only entry in `.gitignore`.

## SEO files

`sitemap.xml` lists exactly two URLs — the homepage and `preview.html` — with hand-maintained `lastmod` dates. Update `lastmod` when a page's content changes, and add/remove entries when adding or deleting a page. `404.html` is intentionally absent from it and carries `<meta name="robots" content="noindex">`. `robots.txt` allows everything and points at the sitemap.

## The online store lives in a different repo

This repo is marketing-only, and **right now there is no online store to link to**.

`index.html` used to carry three "Shop Online" links (nav CTA, shop band, footer) pointing at `https://epicsereno.github.io/superdiscount-shop/`. That repo is **private and archived**, so it does not serve public GitHub Pages — all three were dead links on the live site and have been removed, along with the shop band section (an HTML comment in `index.html` marks where it stood). Don't re-add a "Shop Online" CTA until there's a storefront URL that actually loads for a logged-out visitor; check it in a private window first.

A copy of that storefront PWA used to be checked in at `shop/`, served at `/superdiscount/shop/`. It was removed because it duplicated the external store and pulled in the opposite direction: every customer-facing button went to the external URL while `sitemap.xml` told Google to index the local copy, and `shop/`'s own files disagreed with each other about which host was canonical. Its own README also said commerce should stay separated from this repo.

If you need that code, it's in git history (`git log -- shop/`) — but prefer the external repo, which is what customers actually reach. Don't re-add a storefront here without deciding first which URL is canonical.

## Other content

`docs/graffiti-prompts.md` is a library of ready-to-use AI image-generation prompts (Flux/Midjourney/SDXL) for brand assets, banners, and apparel, matching the brand's red/gold/black palette. Not code — reference it when asked to generate new brand imagery.

## Content facts (keep in sync when editing copy)

- Address: 3118 N Eastern Ave, Los Angeles, CA 90032 (El Sereno)
- Phone: (323) 223-8115
- Hours: 9:30 AM – 9:00 PM daily
- Payments: Cash, EBT/SNAP, credit card
- Established 1998
- Instagram: `@superdiscount.99`

These facts appear in several independent places that must be updated together if store info changes:

- `index.html` — visible copy (hero strip, location section, footer), `tel:` links, Google Maps URLs, Schema.org `Store` JSON-LD, Open Graph/Twitter metadata
- `preview.html` — visible copy, `tel:` links, its own (smaller) `Store` JSON-LD
- `README.md` — the "Store info" section

The separate storefront repo carries its own copy of the NAP data, so update it there too.

Note that the two pages describe the inventory differently: `index.html` leads with spray paint/markers and exotic sodas, while `preview.html` still lists "tobacco accessories" (as does `README.md`). `index.html` is the current source of truth for how the store is positioned.
