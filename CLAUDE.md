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
# http://localhost:8000/shop/index.html   -- needs the server; fetch() can't read JSON over file://
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

`preview.html`'s header/nav markup now carries the same `data-*` attributes as `index.html` (`data-header`, `data-menu-toggle`, `data-nav`, `data-theme-toggle`, `data-year`), so the mobile menu toggle, scroll-shadow header, theme toggle, and footer year all work there too — it also has its own copy of the pre-paint theme boot script.

## Image assets

- `assets/images/` — used by `preview.html` for inline content images (`storefront.png`, `sign.png`, `frontdoor.png`, plus `.webp` variants) and by `index.html` for OG/Twitter meta tags and JSON-LD (`og:image`, `logo`). `og:image`/`twitter:image`/JSON-LD `image` point to `assets/images/og-cover.png` (renamed from an unused `og-image.png` that was already sized 1200x630 to match the `og:image:width`/`height` tags — it just had the wrong filename). **Two referenced files still don't exist**: `assets/images/logo.png` (JSON-LD `logo`) and `assets/icons/apple-touch-icon.png` (the `assets/icons/` directory doesn't exist at all) — both need real artwork, not just a repoint. The repo-root `favicon.ico` that `index.html` links to is also present but a 0-byte empty file, so the favicon is broken too.
- `public/images/` — a `products/` catalog of ~80 numbered product images (`12-skittles-2-17oz.png`/`.svg`) plus empty placeholder subdirs (`banners/`, `categories/`, `logos/`, each holding only `.gitkeep`). **Not currently referenced by any HTML page** — treat it as a staged/orphaned asset set, not live inventory, unless you're wiring it into a page yourself.
- `/scripts/` (a local image-generation helper) is gitignored and not part of the repo.

## `shop/` — separate online-store PWA, checked in but treated as a foreign module

`shop/` is a self-contained, no-build static storefront (product grid, cart, i18n, PWA) with its own README stating it should **not** be merged into this marketing repo ("commerce stays separated") — but it currently *is* checked in here, under this repo's GitHub Pages, at `/superdiscount/shop/`. Be aware of the inconsistency before "fixing" it either way:
- `index.html`'s nav/CTA "Shop Online" links point to an **external** URL, `https://epicsereno.github.io/superdiscount-shop/` (a different, separate GitHub Pages repo) — not to this repo's own `/shop/` path.
- `shop/tokens/brand.json`'s `sites.shop` field, by contrast, says `https://epicsereno.github.io/superdiscount/shop/` (this repo's path).
- Don't assume which one is "correct" — ask before reconciling them, since it determines whether `shop/` here is live inventory or a stale copy.

Structure (from `shop/README.md`):
```
shop/index.html            store app — reads all JSON at runtime, renders client-side
shop/manifest.webmanifest  PWA metadata (Android "Add to Home Screen")
shop/sw.js                 service worker — network-first for *.json (fresh prices), cache-first otherwise
shop/tokens/                colors.json (from the logo) · typography.json · layout.json · brand.json (NAP + checkout config)
shop/data/products.json    the catalog — categories + products; edit prices/stock/tags here
shop/i18n/{en,es,vi}.json  all UI strings, full parity across languages
shop/tools/assets.sh       ImageMagick asset pipeline (favicons/OG/product images) — needs a `source/` folder not in this repo; hand to design
shop/tools/gen_snipcart.py rebuilds shop/snipcart-products.html from products.json
shop/img/products/         populated by assets.sh; missing images fall back to an auto letter tile in the UI
```

Rules baked into `shop/`:
- Colors come from `tokens/colors.json` only (sampled from the real logo) — don't hardcode hex values in `shop/index.html`.
- Cart checkout is SMS/call-based (zero fees) via `sms:` links; Snipcart is wired but disabled by default (`tokens/brand.json` → `checkout.snipcart.enabled`, needs a real `api_key` to activate).
- **After any edit to `shop/data/products.json`, rerun `python3 shop/tools/gen_snipcart.py`** — Snipcart's crawler validates prices against the static `snipcart-products.html` it generates, since it can't see the JS-rendered store.
- "Smoke shop" (21+) items are display-only and excluded from cart/Snipcart by convention (`age21`/`inStoreOnly` flags in `products.json`).
- 360px min width, WCAG AA, keyboard + `:focus-visible`, `prefers-reduced-motion` respected.

## Other content

`docs/graffiti-prompts.md` is a library of ready-to-use AI image-generation prompts (Flux/Midjourney/SDXL) for brand assets, banners, and apparel, matching the brand's red/gold/black palette. Not code — reference it when asked to generate new brand imagery.

## Content facts (keep in sync when editing copy)

- Address: 3118 N Eastern Ave, Los Angeles, CA 90032 (El Sereno)
- Phone: (323) 223-8115
- Hours: 9:30 AM – 9:00 PM daily
- Payments: Cash, EBT/SNAP, credit card
- Established 1998
- Instagram: `@superdiscount.99`

These facts appear in multiple independent places that must be updated together if store info changes: `index.html`'s visible copy + Schema.org `Store` JSON-LD + Open Graph metadata, `preview.html`'s JSON-LD, and `shop/tokens/brand.json` (the single source of truth for NAP within `shop/`, consumed by `shop/index.html` at runtime and duplicated into `shop/index.html`'s own inline JSON-LD).
