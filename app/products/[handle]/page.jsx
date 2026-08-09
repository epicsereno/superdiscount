import Link from 'next/link';
import { notFound } from 'next/navigation';
import AddToCart from '@/components/AddToCart';
import PriceTag from '@/components/PriceTag';
import PunchTag from '@/components/PunchTag';
import ProductGrid from '@/components/ProductGrid';
import { allProducts, getProduct, getCollection, relatedProducts, shipping, shippingRate } from '@/lib/store';
import { money } from '@/lib/format';

export function generateStaticParams() {
  return allProducts().map((p) => ({ handle: p.handle }));
}

export async function generateMetadata({ params }) {
  const { handle } = await params;
  const product = getProduct(handle);
  if (!product) return {};
  return {
    title: product.title,
    description: product.description.slice(0, 155),
    alternates: { canonical: `/products/${product.handle}` },
    openGraph: { title: product.title, description: product.description.slice(0, 155), type: 'website' },
  };
}

export default async function ProductPage({ params }) {
  const { handle } = await params;
  const product = getProduct(handle);
  if (!product) notFound();

  const collection = getCollection(product.collection);
  const related = relatedProducts(product);
  const shipRate = shippingRate(product.shipping_tier);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    sku: product.sku,
    description: product.description,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.review_count,
    },
    offers: {
      '@type': 'Offer',
      price: product.price.sale.toFixed(2),
      priceCurrency: 'USD',
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <div className="wrap">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <p className="breadcrumb">
        <Link href="/">Home</Link> /{' '}
        <Link href={`/collections/${product.collection}`}>{collection?.title}</Link> / {product.title}
      </p>

      <div className="pdp-grid">
        <div className="pdp-media">
          <PunchTag pct={product.price.discount_pct} size="lg" />
          <span className="pdp-media-mark">{product.title}</span>
        </div>

        <div>
          <p className="eyebrow">{product.sku}</p>
          <h1 className="display" style={{ fontSize: 'clamp(1.7rem, 4vw, 2.6rem)' }}>{product.title}</h1>

          <div style={{ margin: '18px 0 6px' }}>
            <PriceTag price={product.price} size="lg" />
          </div>
          <p className="card-meta">
            {product.rating} ★ · {product.review_count} reviews · {product.price.discount_pct}% off list
          </p>

          {product.badges?.length > 0 && (
            <div className="badge-row">
              {product.badges.map((b) => (
                <span key={b} className="badge">{b}</span>
              ))}
            </div>
          )}

          <ul className="bullets">
            {product.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>

          <AddToCart product={product} />

          <p className="card-meta" style={{ marginTop: 14 }}>
            {money(shipRate)} shipping on this item, free over {money(shipping.free_threshold)}.{' '}
            {shipping.handling_note}
          </p>
        </div>
      </div>

      <section className="section" style={{ borderTop: '1px solid var(--line)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 40 }}>
          <div>
            <h2 className="display" style={{ fontSize: '1.3rem', marginBottom: 12 }}>What it is</h2>
            <p className="muted">{product.description}</p>
          </div>
          <div>
            <h2 className="display" style={{ fontSize: '1.3rem', marginBottom: 0 }}>Specs</h2>
            <table className="spec-table">
              <tbody>
                {Object.entries(product.specs).map(([k, v]) => (
                  <tr key={k}>
                    <th scope="row">{k}</th>
                    <td>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section" style={{ borderBottom: 0 }}>
          <div className="section-head">
            <h2 className="display">More from {collection?.title}</h2>
          </div>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
