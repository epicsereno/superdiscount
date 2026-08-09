import Link from 'next/link';
import ProductGrid from '@/components/ProductGrid';
import { searchProducts } from '@/lib/store';

export const metadata = { title: 'Search', robots: { index: false } };

export default async function SearchPage({ searchParams }) {
  const { q = '' } = await searchParams;
  const results = searchProducts(q);

  return (
    <div className="wrap">
      <section className="section" style={{ borderBottom: 0 }}>
        <div className="section-head">
          <div>
            <p className="eyebrow">{q ? `${results.length} results` : 'Search'}</p>
            <h1 className="display">{q ? `“${q}”` : 'Search the store'}</h1>
          </div>
        </div>

        {results.length > 0 ? (
          <ProductGrid products={results} />
        ) : (
          <div className="empty">
            <h2 className="display">{q ? 'No matches' : 'Type something to search'}</h2>
            <p>{q ? 'Try a broader word — “drill”, “cable”, “dog”.' : 'Use the search box in the header.'}</p>
            <Link href="/collections/hot-deals" className="btn btn-primary">Browse the deals</Link>
          </div>
        )}
      </section>
    </div>
  );
}
