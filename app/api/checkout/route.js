import { NextResponse } from 'next/server';
import { getProductById, findDiscount, shipping, shippingRate } from '@/lib/store';

export const runtime = 'nodejs';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

/**
 * Prices are recomputed here from data/store.json. Nothing the browser sends about
 * price, discount value or shipping is trusted — only product ids, variant ids and
 * quantities. Changing this is how stores get charged $0.01 for a $60 item.
 */
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Malformed request body.' }, { status: 400 });
  }

  const incoming = Array.isArray(body?.lines) ? body.lines : [];
  if (incoming.length === 0) {
    return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 });
  }

  const items = [];
  for (const line of incoming) {
    const product = getProductById(line.productId);
    if (!product) {
      return NextResponse.json({ error: 'One of these items is no longer available.' }, { status: 409 });
    }

    const qty = Number.parseInt(line.qty, 10);
    if (!Number.isInteger(qty) || qty < 1) {
      return NextResponse.json({ error: 'Quantity must be a whole number of at least 1.' }, { status: 400 });
    }
    if (qty > product.stock) {
      return NextResponse.json(
        { error: `Only ${product.stock} left of ${product.title}. Lower the quantity to continue.` },
        { status: 409 }
      );
    }

    const variant = line.variantId ? product.variants?.find((v) => v.id === line.variantId) : null;
    if (line.variantId && !variant) {
      return NextResponse.json({ error: 'That option is no longer offered.' }, { status: 409 });
    }

    const unitPrice = +(product.price.sale + (variant?.delta ?? 0)).toFixed(2);
    items.push({
      name: variant ? `${product.title} — ${variant.label}` : product.title,
      sku: product.sku,
      unitPrice,
      qty,
      shipping_tier: product.shipping_tier,
    });
  }

  const subtotal = items.reduce((n, i) => n + i.unitPrice * i.qty, 0);
  const discount = findDiscount(body?.code);
  const validDiscount = discount && subtotal >= discount.min_subtotal ? discount : null;

  const discountAmount =
    validDiscount?.type === 'percent' ? +(subtotal * (validDiscount.value / 100)).toFixed(2) : 0;

  let shipAmount = 0;
  const discounted = subtotal - discountAmount;
  if (discounted < shipping.free_threshold) {
    shipAmount = Math.max(...items.map((i) => shippingRate(i.shipping_tier)));
  }
  if (validDiscount?.type === 'free_shipping') shipAmount = 0;

  const totals = {
    subtotal: +subtotal.toFixed(2),
    discount: discountAmount,
    shipping: shipAmount,
    total: +(discounted + shipAmount).toFixed(2),
    code: validDiscount?.code ?? null,
  };

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return NextResponse.json(
      {
        error: 'Payments are not connected yet. Add STRIPE_SECRET_KEY to your environment.',
        totals,
      },
      { status: 501 }
    );
  }

  // Stripe Checkout Session via the REST API — avoids adding the SDK as a dependency.
  const form = new URLSearchParams();
  form.set('mode', 'payment');
  form.set('success_url', `${siteUrl}/?checkout=success`);
  form.set('cancel_url', `${siteUrl}/cart?checkout=cancelled`);
  form.set('shipping_address_collection[allowed_countries][0]', 'US');
  // Stripe Tax must be turned on in the dashboard first, so this stays opt-in.
  if (process.env.STRIPE_AUTOMATIC_TAX === 'true') {
    form.set('automatic_tax[enabled]', 'true');
  }

  items.forEach((item, i) => {
    form.set(`line_items[${i}][quantity]`, String(item.qty));
    form.set(`line_items[${i}][price_data][currency]`, 'usd');
    form.set(`line_items[${i}][price_data][unit_amount]`, String(Math.round(item.unitPrice * 100)));
    form.set(`line_items[${i}][price_data][product_data][name]`, item.name);
    form.set(`line_items[${i}][price_data][product_data][metadata][sku]`, item.sku);
  });

  if (shipAmount > 0) {
    form.set('shipping_options[0][shipping_rate_data][type]', 'fixed_amount');
    form.set('shipping_options[0][shipping_rate_data][display_name]', 'Standard shipping');
    form.set('shipping_options[0][shipping_rate_data][fixed_amount][amount]', String(Math.round(shipAmount * 100)));
    form.set('shipping_options[0][shipping_rate_data][fixed_amount][currency]', 'usd');
  }

  try {
    // A percent discount has to reach Stripe as a coupon or it is only cosmetic.
    // Created per session, single redemption, so nothing reusable leaks out.
    if (validDiscount?.type === 'percent') {
      const couponForm = new URLSearchParams({
        percent_off: String(validDiscount.value),
        duration: 'once',
        max_redemptions: '1',
        name: validDiscount.code,
      });
      const couponRes = await fetch('https://api.stripe.com/v1/coupons', {
        method: 'POST',
        headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: couponForm,
      });
      const coupon = await couponRes.json();
      if (couponRes.ok) {
        form.set('discounts[0][coupon]', coupon.id);
      } else {
        console.error('Coupon creation failed:', coupon?.error?.message);
        return NextResponse.json({ error: 'That code could not be applied. Remove it and try again.' }, { status: 502 });
      }
    }

    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form,
    });

    const session = await res.json();
    if (!res.ok) {
      console.error('Stripe rejected the session:', session?.error?.message);
      return NextResponse.json({ error: 'Checkout could not start. Try again in a moment.' }, { status: 502 });
    }

    return NextResponse.json({ url: session.url, totals });
  } catch (err) {
    console.error('Stripe request failed:', err);
    return NextResponse.json({ error: 'Checkout could not start. Try again in a moment.' }, { status: 502 });
  }
}
