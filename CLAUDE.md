# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository purpose

Public static website for **Super Discount**, a discount store in El Sereno, Los Angeles (spray paint/markers, party supplies, household goods, snacks, exotic sodas, table & chair rentals, novelties). Live at https://epicsereno.github.io/superdiscount/.

This repo holds the customer-facing static files served via GitHub Pages — marketing pages at the root, storefront under `shop/`. There is no backend, CMS, or build pipeline. Deploys happen by pushing HTML/CSS/JS directly to `main`.

## Tech stack

- Plain HTML5, hand-written CSS (custom properties, Grid/Flexbox, `clamp()` fluid type), vanilla JS. No framework, no bundler, no package.json.
- Hosted on GitHub Pages with Jekyll disabled (`.nojekyll`), served under the `/superdiscount/` path prefix (this is a project page, not a user/org page).

## Local development

No build tooling. Serve the directory root with any static file server:

```bash
python3 -m http.server 8000
# http://localhost:8000/index.html
# http://localhost:8000/shop/index.html
```

There is no test suite, linter, or build/typecheck command — verify changes by loading the page in a browser. Absolute-path links in `404.html` (e.g. `/superdiscount/favicon.ico`) only resolve when served from that path prefix (as GitHub Pages does), not from `localhost:8000/`.

## Deployment

GitHub Pages deploys automatically from `main`. Pushing to `main` is a live production deploy (no CI/staging gate), so treat commits to it accordingly.

---

## The storefront now lives in this repo — do not remove it

**This supersedes earlier guidance in this file's history.**

`shop/` was previously checked in here, then deleted, because a second copy of the same storefront was also published from the separate `epicsereno/superdiscount-shop` repo. With two live copies, customer-facing buttons pointed at the external URL while `sitemap.xml` told Google to index the local one, and the files disagreed about which host was canonical.

That ambiguity no longer exists:

- `epicsereno/superdiscount-shop` is **private and archived**. It serves no public GitHub Pages and is not reachable by a logged-out visitor.
- The storefront was consolidated into `shop/` in this repo. `/superdiscount/shop/` is now the **only** canonical storefront URL.
- All canonical tags, `og:image` URLs, and sitemap entries inside `shop/` were rewritten to the `/superdiscount/shop/` path.

Do not delete `shop/`, do not re-point it at the archived external repo, and do not restore the old "the store lives elsewhere" framing. If a storefront URL ever moves again, update this section in the same commit.

### Files that must NOT be duplicated inside `shop/`

GitHub Pages only honors these at the **repo root**. Copies inside a subdirectory are dead files that create drift:

- `404.html` — the root file handles all `/shop/*` misses
- `robots.txt`
- `.nojekyll`
- `favicon.ico`, `apple-touch-icon.png`

`shop/`'s copies were removed during consolidation. Don't re-add them.

---

## Architecture: pages, one stylesheet per area

### Marketing (repo root)

| Page | `css/styles.css` | `js/main.js` | Notes |
|---|---|---|---|
| `index.html` | yes (relative) | yes, `defer` | Live homepage; the canonical page |
| `preview.html` | yes (relative) | yes, **no `defer`** | Secondary/legacy page |
| `404.html` | yes (**absolute** `/superdiscount/…`) | **no** | Static-only; JS hooks would do nothing |

`404.html` deliberately ships no `main.js` and no nav/theme/menu controls — it hardcodes `data-theme="dark"` on `<html>` and still runs the inline theme-boot script, so a visitor's saved theme is honored but cannot be changed from that page. If you add a `data-*`-driven feature there, you must also add the `<script src="/superdiscount/js/main.js">` tag. Its asset URLs are absolute on purpose: GitHub Pages serves `404.html` at any path depth, so relative URLs would break.

`css/styles.css` (~840 lines) is organized as numbered comment sections — `1. Tokens`, `2. Base`, `3. Header / nav`, `4. Buttons`, `5. Hero`, `6. Sections`, `7. Deal cards`, `8. Shop band`, `9. About`, `10. Location + map facade`, `11. Contact`, `12. Footer`, `13. Motion & 404`, `14. preview.html only`. Keep new rules inside the matching section rather than appending at the end. Section 14 exists because `preview.html` uses a different markup vocabulary (`.service-grid`/`.service-card`, `.hero-media`, `.photo-grid`) than `index.html`'s (`.card-grid`/`.deal-card`, `.wordmark`) — changes to shared components can regress `preview.html`, so check both pages.

Section 8 (`.shop-band`) is currently **dead CSS** — no page carries that markup. It is kept intentionally because the shop band is expected to return now that `/superdiscount/shop/` is live. See "Known open work" below.

Brand tokens are defined once in `:root`, with theme overrides via `[data-theme="dark"|"light"]` on `<html>`. Dark is the default — note the combined `:root, [data-theme="dark"]` selector. An inline boot `<script>` in `<head>` on all root pages reads `localStorage['sd-theme']` (falling back to `prefers-color-scheme`) and sets `data-theme` before first paint to avoid a flash. That boot script is duplicated verbatim in each page — update all copies together.

`js/main.js` is progressive enhancement wired entirely through **`data-*` attribute hooks**, not classes:
- `[data-menu-toggle]` / `[data-nav]` — mobile nav open/close (also closes on link click, Escape, and clicks outside the header)
- `[data-header]` — adds `.is-scrolled` once scrolled past 4px
- `[data-theme-toggle]` / `[data-theme-label]` — light/dark switch, persists to `localStorage['sd-theme']`
- `[data-map]` + `[data-map-src]` / `[data-map-load]` — lazy-loads the Google Maps iframe on click (map facade pattern, avoids loading the ~1MB embed up front)
- `[data-year]` — footer copyright year

`preview.html` carries the same hooks except the map facade — its map iframe is inline and always loaded. Because `main.js` queries by attribute and null-checks every hook, a page missing a given `data-*` attribute silently skips that feature rather than erroring.

### Storefront (`shop/`)

Self-contained: its own `css/styles.css`, its own `js/` modules (`main.js`, `shop.js`, `product.js`, `cart.js`, `cart-page.js`, `wishlist.js`, `auth.js`, `login.js`), its own `data/` and `public/images/`. Pages: `index.html`, `product.html`, `cart.html`, `login.html`.

All internal paths are **relative** — this is what made consolidation safe, and it must stay that way. Do not introduce root-absolute (`/superdiscount/shop/…`) paths in `shop/`; they'd break local preview and any future path move.

Product pages are query-string addressed (`product.html?id=…`). `js/product.js` sets the canonical tag at runtime.

Data lives in `shop/data/products.json` and `shop/data/reviews.json`. `products.json` is the load-bearing schema for the whole storefront — search, thumbnails, planned i18n, and planned Snipcart all read from it. Treat schema changes as breaking and check every consumer.

---

## Image assets

- `assets/images/` — the image directory the **root marketing pages** reference.
  - Inline content images on `preview.html`: `storefront.png`, `sign.png`, `frontdoor.png`. Serve these through the `.webp` variants via `<picture>`; the PNGs are 8–14× larger and exist only as the fallback `src`.
  - Metadata images: `og-cover.png` (OG/Twitter on both `index.html` and `preview.html`) and `logo.png` (JSON-LD on `index.html`). If you swap an OG image, update the `og:image:width`/`height` tags to the new file's real pixel dimensions.
  - `og-image.png` (1.1 MB) is **orphaned** — nothing references it; superseded by `og-cover.png`.
- `shop/public/images/` — the image directory the **storefront** references. Product SVGs are numbered and slugged (`12-skittles-2-17oz.svg`).
- `public/images/` at the repo **root** (~8 MB) is **orphaned** — not referenced by any HTML, CSS, or JS. It is a staged asset set that partly duplicates both `assets/images/` and `shop/public/images/`. Do not wire pages to it without first deciding whether the file belongs in `assets/` (marketing) or `shop/public/` (storefront). It is a deletion candidate, not live inventory.
- Icons are at the repo root (`favicon.svg`, `favicon.ico`, `apple-touch-icon.png`), not under `assets/`. `favicon.ico` is a 32×32 PNG-in-ICO generated to match `favicon.svg`. `404.html` links only the `.ico`.
- `/scripts/` (a local image-generation helper) is gitignored and not part of the repo.

### Brand assets — hard rule

**Never ask an AI image tool to render the logo, wordmark, or any brand typography.** It reliably produces garbled text ("DISGCOUNT", "11os", "Supecier coverage"). Generate the scene only, reserve the bottom ~20% of the frame as a clean dark zone, and composite the real logo PNG as a separate layer afterward. Prefer image-to-image (denoise 0.3–0.45) over text-to-image for brand accuracy.

Some shipped hero/tray images contain garbled *product label* text. These are owner-approved and acceptable at display sizes; do not "fix" them by regenerating.

---

## SEO files

`sitemap.xml` at the repo root is the **single** sitemap for the whole site, marketing and storefront. `robots.txt` allows everything and points at it.

Current coverage is incomplete: the storefront's ~40 product URLs are not listed. Because product pages are query-string addressed and driven by `products.json`, these entries should be **generated** from that file rather than hand-written. Until then, do not hand-maintain a partial product list.

`lastmod` dates are hand-maintained — update when a page's content changes. `404.html` is intentionally absent and carries `<meta name="robots" content="noindex">`.

---

## Known open work

Recorded so agents don't rediscover these as bugs:

- **`preview.html` vs `index.html`** — two marketing pages with divergent markup vocabularies and contradictory inventory copy. `index.html` is the source of truth for positioning. Consolidating to one page is intended but not done; don't build new features against `preview.html`.
- **Shop links** — `index.html` has no "Shop Online" CTA. All three (nav, shop band, footer) were removed when the storefront was unreachable. They can now be restored pointing at `shop/` (relative). Verify in a private window before committing.
- **Root `public/images/`** — orphaned ~8 MB, pending a keep/delete decision.
- **Snipcart** — not integrated. Structure any wiring so zero third-party JS loads until a real API key is present, so staging stays clean.
- **i18n** — planned English/Spanish/Vietnamese, Spanish-priority. Not started.

---

## Content facts (keep in sync when editing copy)

- Address: 3118 N Eastern Ave, Los Angeles, CA 90032 (El Sereno)
- Phone: (323) 223-8115
- Hours: 9:30 AM – 9:00 PM daily
- Payments: Cash, EBT/SNAP, credit card
- Established 1998
- Instagram: `@superdiscount.99`

These facts appear in several independent places that must be updated together:

- `index.html` — visible copy (hero strip, location section, footer), `tel:` links, Google Maps URLs, Schema.org `Store` JSON-LD, Open Graph/Twitter metadata
- `preview.html` — visible copy, `tel:` links, its own (smaller) `Store` JSON-LD
- `shop/` — its own NAP copy and structured data
- `README.md` — the "Store info" section

Note that the pages describe inventory differently: `index.html` leads with spray paint/markers and exotic sodas, while `preview.html` and `README.md` still list "tobacco accessories". `index.html` is the current source of truth.

## Other content

`docs/graffiti-prompts.md` is a library of ready-to-use AI image-generation prompts (Flux/Midjourney/SDXL) for brand assets, banners, and apparel, matching the brand's red/gold/black palette. Not code — reference it when asked to generate new brand imagery.
