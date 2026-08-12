import Link from 'next/link';
import ProductGrid from '@/components/ProductGrid';
import EmailCapture from '@/components/EmailCapture';
import {
  topDeals,
  allCollections,
  productsInCollection,
  allProducts,
  trustBadges,
  faq,
  emailCapture,
  shipping,
  meta,
} from '@/lib/store';
import { money } from '@/lib/format';

export default function HomePage() {
  const deals = topDeals(8);
  const collections = allCollections().filter((c) => c.handle !== 'hot-deals');
  const products = allProducts();
  const best = Math.max(...products.map((p) => p.price.discount_pct));

  return (
    <>
      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <p className="eyebrow">{meta.positioning}</p>
            <h1 className="display">
              Real deals.
              <br />
              <span className="accent">No gimmicks.</span>
            </h1>
            <p className="lede">
              A short list of things people actually use, bought right and marked down honestly.
              Free shipping over {money(shipping.free_threshold)}, thirty-day returns, and a
              compare-at price you can go verify yourself.
            </p>
            <div className="hero-actions">
              <Link href="/collections/hot-deals" className="btn btn-primary">Shop the deals</Link>
              <Link href="/collections/clearance" className="btn btn-ghost">Clearance</Link>
            </div>
          </div>

          <dl className="hero-stats">
            <div className="hero-stat">
              <dt>Products</dt>
              <dd>{products.length}</dd>
            </div>
            <div className="hero-stat">
              <dt>Best markdown</dt>
              <dd>{best}%</dd>
            </div>
            <div className="hero-stat">
              <dt>Ships in</dt>
              <dd>1 day</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* ROGUE LUCY MORNINGSTAR FEATURE — chaotic commit energy */}
      <section className="section" style={{ background: 'linear-gradient(135deg, #1a0a2e 0%, #16213e 50%, #0f3460 100%)', color: '#e94560', borderTop: '4px solid #e94560', borderBottom: '4px solid #e94560' }}>
        <div className="wrap" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
          <p className="eyebrow" style={{ color: '#e94560', letterSpacing: '0.2em' }}>git init · git add . · git commit -m "chaos"</p>
          <h2 className="display" style={{ color: '#fff', margin: '0.5rem 0' }}>Lucy Morningstar Rogue Deal</h2>
          <p style={{ maxWidth: '40rem', margin: '0 auto 1.5rem', color: '#ccc' }}>
            One feature. One commit. One hour of pure digital rot. No roadmap. No standups. Just the feature that wakes up screaming.
          </p>
          <Link href="/collections/hot-deals" className="btn btn-primary" style={{ background: '#e94560', borderColor: '#e94560' }}>
            Claim the chaos →
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div>
              <p className="eyebrow">Sorted by markdown</p>
              <h2 className="display">Hot deals</h2>
            </div>
            <Link href="/collections/hot-deals" className="link-more">See all →</Link>
          </div>
          <ProductGrid products={deals} />
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div>
              <p className="eyebrow">Browse</p>
              <h2 className="display">Collections</h2>
            </div>
          </div>
          <div className="grid-collections">
            {collections.map((c) => (
              <Link key={c.id} href={`/collections/${c.handle}`} className="tile">
                <div>
                  <h3 className="display">{c.title}</h3>
                  <p className="muted" style={{ margin: '8px 0 0', fontSize: '0.88rem' }}>{c.subtitle}</p>
                </div>
                <span className="tile-count">{productsInCollection(c.handle).length} items</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="trust-row">
            {trustBadges.map((b) => (
              <div key={b.label} className="trust-item">
                <h3>{b.label}</h3>
                <p>{b.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div>
              <p className="eyebrow">Before you ask</p>
              <h2 className="display">Questions</h2>
            </div>
          </div>
          <div>
            {faq.map((f) => (
              <div key={f.q} className="faq-item">
                <h3>{f.q}</h3>
                <p>{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ borderBottom: 0 }}>
        <div className="wrap">
          <EmailCapture config={emailCapture} />
        </div>
      </section>
    </>
  );
}
