import Link from 'next/link';
import { notFound } from 'next/navigation';
import ProductGrid from '@/components/ProductGrid';
import { allCollections, getCollection, productsInCollection } from '@/lib/store';

export function generateStaticParams() {
  return allCollections().map((c) => ({ handle: c.handle }));
}

export async function generateMetadata({ params }) {
  const { handle } = await params;
  const col = getCollection(handle);
  if (!col) return {};
  return {
    title: col.title,
    description: col.subtitle,
    alternates: { canonical: `/collections/${col.handle}` },
  };
}

const SORTS = {
  discount: (a, b) => b.price.discount_pct - a.price.discount_pct,
  'price-asc': (a, b) => a.price.sale - b.price.sale,
  'price-desc': (a, b) => b.price.sale - a.price.sale,
  rating: (a, b) => b.rating - a.rating,
};

export default async function CollectionPage({ params, searchParams }) {
  const { handle } = await params;
  const { sort } = await searchParams;

  const col = getCollection(handle);
  if (!col) notFound();

  const active = SORTS[sort] ? sort : 'discount';
  const products = [...productsInCollection(handle)].sort(SORTS[active]);

  return (
    <div className="wrap">
      <p className="breadcrumb">
        <Link href="/">Home</Link> / {col.title}
      </p>

      <section className="section" style={{ paddingTop: 28 }}>
        <div className="section-head">
          <div>
            <p className="eyebrow">{products.length} items</p>
            <h1 className="display">{col.title}</h1>
            <p className="lede">{col.subtitle}</p>
          </div>
        </div>

        <nav className="badge-row" aria-label="Sort products" style={{ margin: '0 0 24px' }}>
          {[
            ['discount', 'Biggest markdown'],
            ['price-asc', 'Price: low to high'],
            ['price-desc', 'Price: high to low'],
            ['rating', 'Best rated'],
          ].map(([key, label]) => (
            <Link
              key={key}
              href={`/collections/${col.handle}?sort=${key}`}
              className="badge"
              style={active === key ? { borderColor: 'var(--accent)', color: 'var(--accent)' } : undefined}
              aria-current={active === key ? 'true' : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>

        {products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <div className="empty">
            <h2 className="display">Nothing here yet</h2>
            <p>This collection is empty. Try the deals page.</p>
            <Link href="/collections/hot-deals" className="btn btn-primary">Shop the deals</Link>
          </div>
        )}
      </section>
    </div>
  );
}
