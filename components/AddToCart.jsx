'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from './CartProvider';
import { money, stockLabel } from '@/lib/format';

export default function AddToCart({ product }) {
  const { add } = useCart();
  const [variant, setVariant] = useState(product.variants?.[0] ?? null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const unitPrice = +(product.price.sale + (variant?.delta ?? 0)).toFixed(2);
  const stock = stockLabel(product.stock);
  const soldOut = product.stock <= 0;

  function handleAdd() {
    add({
      productId: product.id,
      variantId: variant?.id ?? null,
      variantLabel: variant?.label ?? null,
      handle: product.handle,
      title: product.title,
      sku: product.sku,
      unitPrice,
      msrp: product.price.msrp,
      shipping_tier: product.shipping_tier,
      stock: product.stock,
      qty,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2500);
  }

  return (
    <div>
      {product.variants?.length > 0 && (
        <>
          <p className="eyebrow" style={{ marginBottom: 6 }}>Option</p>
          <div className="variant-row" role="group" aria-label="Product options">
            {product.variants.map((v) => (
              <button
                key={v.id}
                type="button"
                className="variant-btn"
                aria-pressed={variant?.id === v.id}
                onClick={() => setVariant(v)}
              >
                {v.label}
                {v.delta > 0 && <span className="muted"> +{money(v.delta)}</span>}
              </button>
            ))}
          </div>
        </>
      )}

      <div className="qty-row">
        <div className="qty">
          <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
            −
          </button>
          <span aria-live="polite">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
        <span className={`stock stock-${stock.state}`}>{stock.text}</span>
      </div>

      <button type="button" className="btn btn-primary btn-block" onClick={handleAdd} disabled={soldOut}>
        {soldOut ? 'Sold out' : `Add to cart — ${money(unitPrice * qty)}`}
      </button>

      <div aria-live="polite" style={{ minHeight: 24, marginTop: 10 }}>
        {added && (
          <span className="note-ok">
            Added. <Link href="/cart" style={{ textDecoration: 'underline' }}>Go to cart</Link>
          </span>
        )}
      </div>
    </div>
  );
}
