# Super Discount El Sereno — Store v2

Static, no build, no framework. Drop into `superdiscount-shop` root (keep `.nojekyll`).
Do NOT merge into the marketing repo — commerce stays separated.

## Tree
```
index.html            store app (reads all JSON at runtime)
manifest.webmanifest  PWA — Android "Add to Home Screen" installs like an app
sw.js                 offline cache; network-first for JSON so prices stay fresh
tokens/               colors.json (ripped from logo pixels) · typography · layout · brand (NAP)
data/products.json    catalog — edit prices/stock here, nothing else to touch
i18n/                 en.json · es.json · vi.json — full UI strings
tools/assets.sh       ImageMagick pipeline + full asset list (hand to design dept)
img/products/         run assets.sh to fill; missing image = auto letter tile
```

## Test locally (Termux)
```
cd superdiscount-store && python3 -m http.server 8080
```
Open http://localhost:8080 — `fetch()` needs a server, `file://` won't load JSON.

## Rules baked in
- Colors from tokens/colors.json only — red #F60513, gold #B39E3D, ink #0A0A0A, paper #F8F8F8 (sampled from the real logo)
- NAP identical to marketing site; JSON-LD Store block included
- 360px min width, WCAG AA, keyboard + focus-visible, reduced-motion respected
- Smoke shop items: display-only, 21+ badge, excluded from cart
- Cart checkout = SMS/call order (zero fees); Snipcart can be rewired onto the same add buttons later

## Ownership
- Prices/stock → data/products.json
- Translations → i18n/*.json
- Brand/NAP → tokens/brand.json (single source)
- Photos → design dept runs tools/assets.sh
