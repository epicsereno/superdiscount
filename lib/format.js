export const money = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n ?? 0);

export const pct = (n) => `${Math.round(n)}%`;

/** Deterministic on server and client — avoids hydration drift on stock counters. */
export const stockLabel = (stock) => {
  if (stock <= 0) return { text: 'Sold out', state: 'out' };
  if (stock <= 40) return { text: `Only ${stock} left`, state: 'low' };
  return { text: 'In stock', state: 'ok' };
};
