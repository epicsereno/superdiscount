# Super Discount Store — Next.js / Vercel

Storefront built on the Next.js 15 App Router. All content comes from a single file,
`data/store.json`, so you can restyle or re-merchandise the whole site without touching
components.

## Run it

```bash
npm install
cp .env.example .env.local     # fill in what you have
npm run dev                    # http://localhost:3000
```

## Deploy to Vercel

```bash
npm i -g vercel
vercel                         # first run links the project
vercel --prod
```

Or push to GitHub and import the repo at vercel.com/new. Set these in
**Project → Settings → Environment Variables**:

| Variable | Needed for | Notes |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | canonical tags, sitemap, Stripe redirects | Set it or links point at localhost |
| `STRIPE_SECRET_KEY` | checkout | Without it `/api/checkout` returns a clear 501 |
| `STRIPE_AUTOMATIC_TAX` | sales tax | Only `true` after enabling Stripe Tax in the dashboard |

## What's in here

```
app/
  page.jsx                     home — hero, deals, collections, trust, FAQ
  collections/[handle]/        one page per collection, statically generated, sortable
  products/[handle]/           product detail with Product JSON-LD
  cart/                        cart, discount codes, order summary
  search/                      substring search across the catalog
  info/[slug]/                 shipping, returns, contact, privacy, terms
  api/checkout/route.js        Stripe Checkout session — prices recomputed server-side
  sitemap.js, robots.js        generated from the catalog
components/
  CartProvider.jsx             cart state, persisted to localStorage
  CartView.jsx                 cart UI and totals
  AddToCart.jsx                variant + quantity picker
  ProductCard / PriceTag / PunchTag / ProductGrid / EmailCapture / Header / Footer
data/store.json                the entire catalog, brand tokens, policies, discounts
lib/store.js                   read helpers over store.json
lib/format.js                  currency and stock formatting
```

Everything except the cart is a server component. `store.json` is never sent to the
browser — nav and config are passed into client components as props.

### Design

Tokens in `data/store.json → brand.tokens` are mirrored as CSS custom properties at the
top of `app/globals.css`. Nothing else hardcodes a color. Type is Archivo Black for
display, Inter for body, JetBrains Mono for prices, SKUs and receipt math.

The one loud element is the **punch tag** — the rotated yellow markdown sticker with the
punched hole, on product images only. Everything else stays quiet on purpose. If you
add a second attention-grabber, kill this one first.

Product images are hatched placeholders. When you have real photos, swap the
`.card-media` and `.pdp-media` blocks for `next/image` and add your CDN hostname to
`remotePatterns` in `next.config.mjs`.

## What is NOT production-ready

Read this before you take money.

1. **Inventory is a number in a JSON file.** `stock` never decrements. Two people can
   buy the last unit. You need a real datastore (Vercel Postgres, Neon, or move the
   catalog into Shopify/Medusa) plus a Stripe webhook that decrements on
   `checkout.session.completed`.

2. **There is no order record.** After Stripe redirects back, nothing is written
   anywhere. You cannot fulfil, refund, or answer "where's my order" until you add a
   webhook handler and a database.

3. **Compare-at pricing is your biggest legal exposure.** Every `msrp` in the JSON is a
   placeholder. Under US FTC rules a compare-at price has to be a genuine former or
   prevailing market price. Invented MSRPs are the most common deceptive-pricing claim
   against small stores, and the footer currently carries a disclaimer you must replace
   with your actual verified basis.

4. **Every `cost` figure is a guess.** Margins compute to 51–65%, which looks great and
   means nothing until real supplier quotes land. Verify before you commit to a price.

5. **Privacy and Terms are labelled placeholders, not policies.** They will not satisfy
   CCPA, GDPR or state disclosure law. Get real ones written.

6. **Email capture goes nowhere.** `EmailCapture.jsx` validates the address and stops.
   Wire it to a route handler that posts to Klaviyo, Resend or Mailchimp.

7. **Discount codes are client-visible.** They live in `store.json`, which reaches the
   browser through the cart page's props. Anyone can read `SAVE10` in the page source.
   The server does re-validate `min_subtotal` at checkout, so they can't be abused
   beyond their terms — but they aren't secret. Move them server-only if that matters.

8. **A percent code creates a single-use Stripe coupon per checkout.** That works, but
   it accumulates coupon objects in your Stripe account. At volume, pre-create the
   coupons and map code → coupon ID by environment variable instead.

9. **Free shipping is calculated on the post-discount subtotal.** A $40 order with
   FIRST15 drops to $34 and pays shipping. That's a deliberate choice in
   `app/api/checkout/route.js` — flip it to pre-discount if you'd rather not surprise
   people at checkout.

10. **No rate limiting on `/api/checkout`.** It hits Stripe on every call. Add
    Vercel's firewall rules or an Upstash rate limiter before launch.

## Editing the catalog

Add a product by appending to `products` in `data/store.json`. Required fields:
`id`, `handle`, `title`, `collection` (must match a collection handle), `sku`,
`price` (`msrp`, `sale`, `cost`, plus computed `discount_pct`, `savings`, `margin_pct`),
`stock`, `rating`, `review_count`, `shipping_tier`, `bullets`, `description`, `specs`,
`variants`.

To recompute the derived price fields after editing:

```bash
node -e '
const fs=require("fs"); const d=JSON.parse(fs.readFileSync("data/store.json","utf8"));
for (const p of d.products) { const q=p.price;
  q.margin_pct=+(((q.sale-q.cost)/q.sale)*100).toFixed(1);
  q.discount_pct=Math.round((1-q.sale/q.msrp)*100);
  q.savings=+(q.msrp-q.sale).toFixed(2);
}
fs.writeFileSync("data/store.json",JSON.stringify(d,null,2)+"\n"); console.log("recomputed");'
```

Routes are statically generated from the catalog, so a new product needs a rebuild —
which a `git push` to Vercel does automatically.

## Building in Termux

`next build` needs the SWC native binary, and there's no Android build of it. Editing
and committing from Termux is fine; let Vercel do the build. If you want a local dev
server, run it on a machine with a supported platform or inside proot-distro.
