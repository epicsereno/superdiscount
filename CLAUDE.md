# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Static website for Super Discount El Sereno, a neighborhood discount store. No build tooling, no package manager, no framework. Served via GitHub Pages (Jekyll disabled by `.nojekyll`).

## Local development

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deployment

Push to `main` — GitHub Pages rebuilds automatically within a couple of minutes.

## Architecture

The repo contains **two separate page designs** with independent stylesheets and image directories:

| File | Stylesheet | Images | Status |
|---|---|---|---|
| `index.html` | `style.css` (root) | `public/images/` | **Live site (v2 dark brand)** |
| `preview.html` | `css/styles.css` | `assets/images/` | Older v1 light design |

`js/main.js` is used by `preview.html` (targets `#nav-links`). `index.html` has its own inline mobile menu script (targets `#primary-nav`). Don't confuse the two.

## Style conventions

`style.css` (the live stylesheet) uses CSS custom properties defined in `:root`:

- **Brand colors:** `--red: #e01b1b`, `--gold: #c9a227` — use these, not hardcoded hex values
- **Dark palette:** `--black: #0a0a0a` (body bg), `--panel: #141414`, `--panel-2: #1c1c1c` (section backgrounds), `--line: #2a2a2a` (borders)
- **Text:** `--text: #f4f1ea` (primary), `--muted: #a39f97` (secondary)
- **Fonts:** Anton (display headings via `.display` class), Inter (body), Oswald (display fallback)
- **Container max-width:** `--maxw: 1180px` via `.container`
- Use `clamp()` for fluid typography — existing headings show the pattern

Mobile nav breakpoint is `760px` in `style.css`. The `is-open` class on `#primary-nav` drives the slide-in mobile menu.

`css/styles.css` (preview.html only) uses a separate light-theme token set (`--color-primary: #D72B2B`, `--color-background: #F9F6F0`, etc.) — do not mix tokens between the two stylesheets.

## SEO / structured data

`preview.html` carries Schema.org `Store` JSON-LD. `index.html` has Open Graph tags but no JSON-LD — if adding structured data to the live page, follow the pattern in `preview.html`. `sitemap.xml` and `robots.txt` are hand-maintained.

## Store facts (for copy/content work)

- **Address:** 3118 N Eastern Ave, Los Angeles, CA 90032 (El Sereno)
- **Phone:** (323) 223-8115 / `tel:+13232238115`
- **Hours:** 9:30 AM – 9:00 PM daily
- **Payments:** Cash, EBT/SNAP, credit card
- **Instagram:** @superdiscount.99
- **Live URL:** https://epicsereno.github.io/superdiscount/
