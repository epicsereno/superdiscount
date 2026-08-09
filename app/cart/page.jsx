import CartView from '@/components/CartView';
import { shipping, discounts } from '@/lib/store';

export const metadata = { title: 'Cart', robots: { index: false } };

export default function CartPage() {
  return (
    <div className="wrap">
      <CartView shippingConfig={shipping} codes={discounts.codes} />
    </div>
  );
}
