# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository purpose

Public static website for **Super Discount**, a discount store in El Sereno, Los Angeles (party supplies, household goods, snacks, spray paint/markers, table & chair rentals, novelties). Live at https://epicsereno.github.io/superdiscount/.

This repo holds only the customer-facing static files served via GitHub Pages — there is no separate backend, CMS, or build pipeline. Deploys happen by pushing HTML/CSS/JS directly to `main`.

## Tech stack

- Plain HTML5, hand-written CSS (custom properties, Grid/Flexbox, `clamp()` fluid type), vanilla JS. No framework, no bundler, no package.json.
- Hosted on GitHub Pages with Jekyll disabled (`.nojekyll`).

## Local development

No build tooling. Serve the directory root with any static file server and open it in a browser:

```bash
python3 -m http.server 8000
# http://localhost:8000/index.html
# http://localhost:8000/preview.html
```

There is no test suite, linter, or build/typecheck command in this repo — verify changes by loading the page in a browser.

## Deployment

GitHub Pages deploys automatically from `main`. Pushing to `main` is a live production deploy (no CI/staging gate), so treat commits to it accordingly.

## Architecture: two parallel front ends — do not cross-wire them

The repo currently contains **two independent page/stylesheet/asset pairings** that must not be mixed:

| Page | Stylesheet | Image source | Design |
|---|---|---|---|
| `index.html` (live homepage) | `style.css` (repo root) | `public/images/` | "v2" dark brand redesign — black/red/gold, Anton/Oswald/Inter fonts |
| `preview.html` (secondary/legacy page) | `css/styles.css` | `assets/images/` | Older cream/red/gold design, DM Sans/Poppins fonts |

Both pages load the shared `js/main.js` (mobile menu toggle + scroll-aware header, targeting `.menu-toggle` / `#nav-links` / `.site-header`). When editing styles or images, check which page you're actually changing — `css/styles.css` and `assets/images/` only affect `preview.html`, not the live site.

`index.html` also has a small inline `<script>` duplicating menu-toggle logic against a `#primary-nav` id that doesn't exist in the DOM (it's a no-op guarded by a null check); the real behavior comes from `js/main.js`.

## Image assets

- `public/images/` — used by the live `index.html`. Includes a `products/` catalog (numbered files like `12-skittles-2-17oz.png`/`.svg`) plus placeholder subdirs (`banners/`, `categories/`, `logos/`) each holding only a `.gitkeep`.
- `assets/images/` — legacy set, only referenced by `preview.html` and `css/styles.css`.
- `/scripts/` (a local image-generation helper) is gitignored and not part of the repo.

## Content facts (keep in sync when editing copy)

- Address: 3118 N Eastern Ave, Los Angeles, CA 90032 (El Sereno)
- Phone: (323) 223-8115
- Hours: 9:30 AM – 9:00 PM daily
- Payments: Cash, EBT/SNAP, credit card
- Established 1998
- Instagram: `@superdiscount.99`

`index.html` carries Schema.org `Store` JSON-LD and Open Graph metadata reflecting these facts — update both the visible copy and the structured data together if store info changes.
