'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useCart } from './CartProvider';
import { money } from '@/lib/format';

export default function CartView({ shippingConfig, codes }) {
  const { lines, ready, subtotal, setQty, remove, clear } = useCart();
  const [codeInput, setCodeInput] = useState('');
  const [applied, setApplied] = useState(null);
  const [codeError, setCodeError] = useState('');
  const [checkoutState, setCheckoutState] = useState({ status: 'idle', message: '' });

  const totals = useMemo(() => {
    const discount =
      applied?.type === 'percent' && subtotal >= applied.min_subtotal
        ? +(subtotal * (applied.value / 100)).toFixed(2)
        : 0;

    const discounted = subtotal - discount;

    let ship = 0;
    if (lines.length > 0 && discounted < shippingConfig.free_threshold) {
      const rates = lines.map(
        (l) => shippingConfig.tiers.find((t) => t.id === l.shipping_tier)?.rate ?? shippingConfig.tiers[0].rate
      );
      ship = Math.max(...rates);
    }
    if (applied?.type === 'free_shipping' && subtotal >= applied.min_subtotal) ship = 0;

    return {
      discount,
      ship,
      total: +(discounted + ship).toFixed(2),
      toFreeShipping: Math.max(0, shippingConfig.free_threshold - discounted),
    };
  }, [lines, subtotal, applied, shippingConfig]);

  function applyCode() {
    const match = codes.find((c) => c.code.toUpperCase() === codeInput.trim().toUpperCase());
    if (!match) {
      setApplied(null);
      setCodeError(`No code named ${codeInput.trim().toUpperCase()}.`);
      return;
    }
    if (subtotal < match.min_subtotal) {
      setApplied(null);
      setCodeError(`${match.code} needs a subtotal of ${money(match.min_subtotal)} or more.`);
      return;
    }
    setApplied(match);
    setCodeError('');
  }

  async function checkout() {
    setCheckoutState({ status: 'working', message: '' });
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lines: lines.map((l) => ({ productId: l.productId, variantId: l.variantId, qty: l.qty })),
          code: applied?.code ?? null,
        }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      setCheckoutState({ status: 'error', message: data.error || 'Checkout is unavailable right now.' });
    } catch {
      setCheckoutState({ status: 'error', message: 'Could not reach the server. Check your connection.' });
    }
  }

  if (!ready) {
    return (
      <div className="empty">
        <p className="muted">Loading your cart…</p>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="empty">
        <h1 className="display">Your cart is empty</h1>
        <p>Pick something from the deals page and it lands here.</p>
        <Link href="/collections/hot-deals" className="btn btn-primary">Shop the deals</Link>
      </div>
    );
  }

  const freePct = Math.min(100, (Math.max(0, subtotal - totals.discount) / shippingConfig.free_threshold) * 100);

  return (
    <div className="cart-grid">
      <div>
        <div className="section-head" style={{ marginBottom: 4 }}>
          <h1 className="display">Cart</h1>
          <button type="button" className="link-more" onClick={clear} style={{ background: 'none', border: 0, cursor: 'pointer' }}>
            Empty cart
          </button>
        </div>

        {lines.map((line) => (
          <div key={line.key} className="cart-line">
            <div className="cart-thumb" aria-hidden="true" />

            <div>
              <h2 style={{ fontSize: '0.98rem', margin: '0 0 4px' }}>
                <Link href={`/products/${line.handle}`}>{line.title}</Link>
              </h2>
              <p className="card-meta" style={{ margin: 0 }}>
                {line.sku}
                {line.variantLabel ? ` · ${line.variantLabel}` : ''}
              </p>

              <div className="qty-row" style={{ margin: '12px 0 0' }}>
                <div className="qty">
                  <button type="button" onClick={() => setQty(line.key, line.qty - 1)} aria-label={`Decrease ${line.title}`}>
                    −
                  </button>
                  <span>{line.qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty(line.key, line.qty + 1)}
                    aria-label={`Increase ${line.title}`}
                    disabled={line.qty >= line.stock}
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  className="card-meta"
                  onClick={() => remove(line.key)}
                  style={{ background: 'none', border: 0, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Remove
                </button>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div className="mono" style={{ fontSize: '1rem' }}>{money(line.unitPrice * line.qty)}</div>
              {line.qty > 1 && <div className="card-meta">{money(line.unitPrice)} each</div>}
            </div>
          </div>
        ))}
      </div>

      <aside className="receipt" aria-label="Order summary">
        <p className="eyebrow">Order summary</p>

        {totals.toFreeShipping > 0 ? (
          <>
            <p className="card-meta" style={{ margin: '0 0 4px' }}>
              {money(totals.toFreeShipping)} more for free shipping
            </p>
            <div className="freeship-meter"><i style={{ width: `${freePct}%` }} /></div>
          </>
        ) : (
          <p className="note-ok" style={{ display: 'block', margin: '0 0 12px' }}>Free shipping unlocked</p>
        )}

        <div className="code-row">
          <input
            className="search-input"
            placeholder="Discount code"
            aria-label="Discount code"
            value={codeInput}
            onChange={(e) => { setCodeInput(e.target.value); setCodeError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && applyCode()}
          />
          <button type="button" className="btn btn-ghost" onClick={applyCode}>Apply</button>
        </div>

        <div aria-live="polite" style={{ marginBottom: 8 }}>
          {codeError && <span className="note-bad">{codeError}</span>}
          {applied && !codeError && <span className="note-ok">{applied.code} applied — {applied.note}</span>}
        </div>

        <hr className="receipt-rule" />

        <div className="receipt-row">
          <span className="label">Subtotal</span>
          <span>{money(subtotal)}</span>
        </div>
        {totals.discount > 0 && (
          <div className="receipt-row">
            <span className="label">Discount ({applied.code})</span>
            <span style={{ color: 'var(--success)' }}>−{money(totals.discount)}</span>
          </div>
        )}
        <div className="receipt-row">
          <span className="label">Shipping</span>
          <span>{totals.ship === 0 ? 'Free' : money(totals.ship)}</span>
        </div>
        <div className="receipt-row">
          <span className="label">Tax</span>
          <span className="muted">Calculated at checkout</span>
        </div>

        <hr className="receipt-rule" />

        <div className="receipt-total">
          <span className="eyebrow" style={{ margin: 0 }}>Total</span>
          <span className="amount">{money(totals.total)}</span>
        </div>

        <button type="button" className="btn btn-primary btn-block" onClick={checkout} disabled={checkoutState.status === 'working'}>
          {checkoutState.status === 'working' ? 'Starting checkout…' : 'Checkout'}
        </button>

        <div aria-live="polite" style={{ marginTop: 10 }}>
          {checkoutState.status === 'error' && <span className="note-bad">{checkoutState.message}</span>}
        </div>

        <p className="card-meta" style={{ marginTop: 14 }}>
          Prices are re-checked on the server at checkout. Totals shown here are an estimate.
        </p>
      </aside>
    </div>
  );
}
