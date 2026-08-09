'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCart } from './CartProvider';

/** Nav data is passed in from the server layout so store.json never enters the client bundle. */
export default function Header({ announcement, primary }) {
  const { count, ready } = useCart();
  const [q, setQ] = useState('');
  const router = useRouter();

  function onSearch(e) {
    if (e.key !== 'Enter' || !q.trim()) return;
    router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  }

  return (
    <header className="site-header">
      <div className="announce">{announcement}</div>

      <div className="wrap header-bar">
        <Link href="/" className="logo" aria-label="Super Discount Store home">
          Super<span>Discount</span>
        </Link>

        <div className="header-search">
          <input
            className="search-input"
            type="search"
            placeholder="Search products"
            aria-label="Search products"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onSearch}
          />
        </div>

        <div className="header-actions">
          <Link href="/cart" className="cart-link">
            Cart
            {/* Renders 0 until the stored cart loads, so server and client markup match. */}
            <span className="cart-count">{ready ? count : 0}</span>
          </Link>
        </div>
      </div>

      <nav className="nav-strip" aria-label="Collections">
        <ul className="nav-list wrap">
          {primary.map((item) => (
            <li key={item.url}>
              <Link href={item.url}>{item.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
