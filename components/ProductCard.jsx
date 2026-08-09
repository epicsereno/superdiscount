import Link from 'next/link';
import PriceTag from './PriceTag';
import PunchTag from './PunchTag';
import { stockLabel } from '@/lib/format';

export default function ProductCard({ product }) {
  const stock = stockLabel(product.stock);

  return (
    <article className="card">
      <Link href={`/products/${product.handle}`} aria-label={product.title}>
        <div className="card-media">
          <PunchTag pct={product.price.discount_pct} />
          {/* Replace with <Image /> once real photography exists — see README. */}
          <span className="card-media-mark">{product.title.split(',')[0]}</span>
        </div>
      </Link>

      <div className="card-body">
        <h3 className="card-title">
          <Link href={`/products/${product.handle}`}>{product.title}</Link>
        </h3>
        <div className="card-meta">
          {product.rating} ★ · {product.review_count} reviews
        </div>
        <div className="card-foot">
          <PriceTag price={product.price} />
          <div style={{ marginTop: 8 }}>
            <span className={`stock stock-${stock.state}`}>{stock.text}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
