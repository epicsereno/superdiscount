# Super Discount El Sereno

Public static website for **Super Discount**, a neighborhood discount store in El Sereno, Los Angeles. Party supplies, household goods, snacks, table & chair rentals, tobacco accessories, novelties, ATM access, and EBT-friendly shopping.

🔗 **Live site:** https://epicsereno.github.io/superdiscount/

> **Note:** This repository contains only the customer-facing static files served via GitHub Pages. The source working repository remains private.

## Tech stack

- **HTML5** — semantic markup with skip links, ARIA, and Schema.org `Store` structured data (JSON-LD).
- **CSS** — single hand-written stylesheet (`css/styles.css`) using custom properties, Grid/Flexbox, and `clamp()` fluid typography. No framework, no build step.
- **JavaScript** — vanilla `js/main.js`: accessible mobile menu toggle and a scroll-aware header.
- **Hosting** — GitHub Pages (Jekyll disabled via `.nojekyll`).

## Project structure

```
index.html        Main landing page
preview.html      Secondary preview page
css/styles.css    All site styles
js/main.js        Mobile menu + header behavior
assets/           Images (hero, og-image, etc.)
robots.txt        Crawler directives
sitemap.xml       Sitemap for search engines
.nojekyll         Disables Jekyll processing on GitHub Pages
```

## Local development

No build tooling required — serve the directory with any static server:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deployment

The site deploys automatically from the default branch via GitHub Pages. To update the live site, commit changes to `main` and push:

```bash
git add .
git commit -m "Update site"
git push origin main
```

GitHub Pages rebuilds within a minute or two.

## Store info

- **Address:** 3118 N Eastern Ave, Los Angeles, CA 90032 (El Sereno)
- **Phone:** (323) 223-8115
- **Hours:** 9:30 AM – 9:00 PM daily
- **Payments:** Cash, EBT/SNAP, credit card

## License

Released under the [MIT License](LICENSE).
