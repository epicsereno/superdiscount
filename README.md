# Super Discount El Sereno — Bare Bones Site

This is the **Super Discount Bare Bones Site** — a lightweight, zero-dependency, barebones static HTML/CSS/JS site for **Super Discount**, a neighborhood discount store in El Sereno, Los Angeles.

Party supplies, household goods, snacks, table & chair rentals, spray paint, markers, novelties, ATM access, and EBT-friendly shopping.

🔗 **Live Site:** https://epicsereno.github.io/superdiscount/

## Highlights

- **Bare Bones & Zero Dependencies** — Hand-crafted vanilla HTML5, CSS3, and JavaScript. No build step, frameworks, or heavy bundlers required.
- **Fast & Responsive** — Fluid typography with CSS `clamp()`, semantic markup, and instant loading.
- **GitHub Pages Ready** — Direct static deployment with Jekyll disabled (`.nojekyll`).

## Project Structure

```
index.html        Main landing page
catalog.html      Showcase catalog page ("What We Carry")
services.html     Counter services & party rental calculator
404.html          Custom 404 page
css/styles.css    All site styles
js/main.js        Mobile menu, header, theme & map behavior
assets/           Images (storefront, logo, catalog photos, og-cover)
data/             Static dataset (catalog.json)
docs/             Brand documentation & image generation prompts
robots.txt        Crawler directives
sitemap.xml       Sitemap for search engines
.nojekyll         Disables Jekyll processing on GitHub Pages
```

## Local Development

No build tooling required — serve the directory with any static server:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deployment

The site deploys automatically from the `main` branch via GitHub Pages. To update the live site:

```bash
git add .
git commit -m "Update site"
git push origin main
```

## Store Information

- **Address:** 3118 N Eastern Ave, Los Angeles, CA 90032 (El Sereno)
- **Phone:** (323) 223-8115
- **Hours:** 9:30 AM – 9:00 PM daily
- **Payments:** Cash, EBT/SNAP, credit card

## License

Released under the [MIT License](LICENSE).

