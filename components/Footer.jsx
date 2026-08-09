import Link from 'next/link';
import { nav, meta } from '@/lib/store';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <div className="logo" style={{ marginBottom: 8 }}>
              Super<span>Discount</span>
            </div>
            <p className="muted" style={{ margin: 0, fontSize: '0.86rem' }}>{meta.tagline}</p>
          </div>

          <nav className="footer-links" aria-label="Store policies">
            {nav.footer.map((item) => (
              <Link key={item.url} href={item.url}>{item.label}</Link>
            ))}
          </nav>
        </div>

        <p className="footer-fine">
          © {new Date().getFullYear()} {meta.name}. Compare-at prices reference the manufacturer&apos;s
          list price, not a price this store previously charged. Replace this line with your verified
          reference-pricing basis before launch — US FTC rules require it to be accurate.
        </p>
      </div>
    </footer>
  );
}
