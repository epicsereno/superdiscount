import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="wrap">
      <div className="empty">
        <p className="eyebrow">404</p>
        <h1 className="display">That page isn&apos;t here</h1>
        <p>The link may be old, or the item sold out and came down.</p>
        <Link href="/" className="btn btn-primary">Back to the store</Link>
      </div>
    </div>
  );
}
