import store from '@/data/store.json';

export const brand = store.brand;
export const meta = store.store;
export const nav = store.navigation;
export const seo = store.seo;
export const shipping = store.shipping;
export const discounts = store.discounts;
export const policies = store.policies;
export const faq = store.faq;
export const trustBadges = store.trust_badges;
export const emailCapture = store.email_capture;

export function allProducts() {
  return store.products;
}

export function allCollections() {
  return store.collections;
}

export function getProduct(handle) {
  return store.products.find((p) => p.handle === handle) ?? null;
}

export function getProductById(id) {
  return store.products.find((p) => p.id === id) ?? null;
}

export function getCollection(handle) {
  return store.collections.find((c) => c.handle === handle) ?? null;
}

/** Curated collections list explicit product_ids; the rest match on product.collection. */
export function productsInCollection(handle) {
  const col = getCollection(handle);
  if (!col) return [];
  if (col.curated && Array.isArray(col.product_ids)) {
    return col.product_ids.map(getProductById).filter(Boolean);
  }
  return store.products.filter((p) => p.collection === handle);
}

export function relatedProducts(product, limit = 4) {
  return store.products
    .filter((p) => p.id !== product.id && p.collection === product.collection)
    .slice(0, limit);
}

export function topDeals(limit = 8) {
  return [...store.products]
    .sort((a, b) => b.price.discount_pct - a.price.discount_pct)
    .slice(0, limit);
}

export function searchProducts(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return store.products.filter((p) => {
    const haystack = [p.title, p.description, p.collection, p.sku, ...(p.badges ?? []), ...(p.bullets ?? [])]
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });
}

export function shippingRate(tierId) {
  return shipping.tiers.find((t) => t.id === tierId)?.rate ?? shipping.tiers[0].rate;
}

/** Highest applicable shipping rate across the cart, waived above the free threshold. */
export function estimateShipping(lines, subtotal) {
  if (!lines.length) return 0;
  if (subtotal >= shipping.free_threshold) return 0;
  return Math.max(...lines.map((l) => shippingRate(l.shipping_tier)));
}

export function findDiscount(code) {
  if (!code) return null;
  return discounts.codes.find((c) => c.code.toUpperCase() === code.trim().toUpperCase()) ?? null;
}
