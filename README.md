# Super Discount El Sereno

Public static GitHub Pages site for Super Discount, a neighborhood discount store in El Sereno, Los Angeles.

The source working repository remains private. This repository contains only the customer-facing static files needed for GitHub Pages.

## Live Site

https://epicsereno.github.io/superdiscount/

## What Is Included

- `index.html` - production page with SEO metadata, Open Graph tags, local business schema, navigation, store content, and embedded Google Map.
- `preview.html` - alternate preview page that shows the image-forward layout.
- `css/styles.css` - site styling, responsive layout, mobile menu states, and print-safe defaults.
- `js/main.js` - small enhancement script for the mobile menu and sticky header shadow.
- `assets/images/` - storefront, sign, front door, and social preview images.
- `favicon.ico`, `apple-touch-icon.png`, `robots.txt`, and `sitemap.xml` - publishing and discovery assets.

## Local Preview

Because this is a static site, it can be opened directly in a browser:

```sh
open index.html
```

For a closer match to GitHub Pages behavior, serve it locally:

```sh
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/
```

## Deployment

GitHub Pages serves the repository contents directly. Updating the published site is just a normal commit and push to the branch configured for Pages.

Before publishing, check:

- Store phone, address, hours, and map links in `index.html`.
- Canonical URL, Open Graph image URL, and structured data in the `<head>`.
- `sitemap.xml` URLs if the public path changes.
- Image filenames referenced by HTML and CSS.

## Store Details

- Name: Super Discount El Sereno
- Address: 3118 N Eastern Ave, Los Angeles, CA 90032
- Phone: (323) 223-8115
- Hours: 9:30 AM-9:00 PM daily
- Public URL: https://epicsereno.github.io/superdiscount/
