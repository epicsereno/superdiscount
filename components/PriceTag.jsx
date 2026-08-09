import { money } from '@/lib/format';

/** The price block. `size="lg"` is the product-page treatment. */
export default function PriceTag({ price, size }) {
  return (
    <div className={`price${size === 'lg' ? ' price-lg' : ''}`}>
      <span className="price-now">{money(price.sale)}</span>
      <span className="price-was" aria-label={`List price ${money(price.msrp)}`}>{money(price.msrp)}</span>
      <span className="price-save">Save {money(price.savings)}</span>
    </div>
  );
}
