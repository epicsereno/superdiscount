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

## Architecture: three pages share one stylesheet/script; one CSS file is dead code

`index.html` (live homepage), `preview.html` (secondary/legacy page), and `404.html` all load the **same** `css/styles.css` and `js/main.js`. The repo-root `style.css` is **not linked from any page** — it's leftover from an earlier design pass; don't assume editing it affects anything live.

`css/styles.css` defines brand tokens once in `:root` and theme overrides via `[data-theme="dark"|"light"]` on `<html>` (dark is the default — see the `:root, [data-theme="dark"]` selector). An inline boot `<script>` in `<head>` on `index.html`/`404.html` reads `localStorage['sd-theme']` (falling back to `prefers-color-scheme`) and sets `data-theme` before first paint to avoid a flash.

`js/main.js` is progressive enhancement wired entirely through **`data-*` attribute hooks**, not classes:
- `[data-menu-toggle]` / `[data-nav]` — mobile nav open/close
- `[data-header]` — adds `.is-scrolled` on scroll
- `[data-theme-toggle]` / `[data-theme-label]` — light/dark switch
- `[data-map]` / `[data-map-load]` — lazy-loads the Google Maps iframe on click (map facade pattern, avoids loading the embed up front)
- `[data-year]` — footer copyright year

`preview.html` carries the same `data-*` hooks, so the menu, header shadow, theme toggle, and footer year all work there too. It has no `[data-map]` facade — its map iframe is inline and always loaded. Because `main.js` queries by attribute and null-checks every hook, adding a page without a given `data-*` attribute silently skips that feature rather than erroring.

## Image assets

- `assets/images/` — used by `preview.html` for inline content images (`storefront.png`, `sign.png`, `frontdoor.png`) and by `index.html`/`preview.html` for OG/Twitter meta tags and JSON-LD (`og-cover.png`, `logo.png`). Serve the content images through the `.webp` variants via `<picture>`; the PNGs are 8–14× larger and exist only as the fallback `src`. If you swap an OG image, update the `og:image:width`/`height` tags to the new file's real pixel dimensions — `og-cover.png` is 1168×784, not the 1200×630 those tags once claimed.
- Icons are at the repo root (`favicon.svg`, `favicon.ico`, `apple-touch-icon.png`), not under `assets/`. `favicon.ico` is a 32×32 PNG-in-ICO generated to match `favicon.svg`.
- `public/images/` — a `products/` catalog of ~80 numbered product images (`12-skittles-2-17oz.png`/`.svg`) plus empty placeholder subdirs (`banners/`, `categories/`, `logos/`, each holding only `.gitkeep`). **Not currently referenced by any HTML page** — treat it as a staged/orphaned asset set, not live inventory, unless you're wiring it into a page yourself.
- `/scripts/` (a local image-generation helper) is gitignored and not part of the repo.

## The online store lives in a different repo

This repo is marketing-only, and **right now there is no online store to link to**.

`index.html` used to carry three "Shop Online" links (nav CTA, shop band, footer) pointing at `https://epicsereno.github.io/superdiscount-shop/`. That repo is **private and archived**, so it does not serve public GitHub Pages — all three were dead links on the live site and have been removed, along with the shop band section. Don't re-add a "Shop Online" CTA until there's a storefront URL that actually loads for a logged-out visitor; check it in a private window first.

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

These facts appear in multiple independent places that must be updated together if store info changes: `index.html`'s visible copy + Schema.org `Store` JSON-LD + Open Graph metadata, and `preview.html`'s JSON-LD. The separate storefront repo carries its own copy of the NAP data, so update it there too.
