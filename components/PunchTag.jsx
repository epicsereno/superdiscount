/** Signature element: the markdown sticker. One per product image, nowhere else. */
export default function PunchTag({ pct, size }) {
  return (
    <div className={`punch-tag${size === 'lg' ? ' punch-tag-lg' : ''}`} aria-hidden="true">
      {pct}%
      <small>off</small>
    </div>
  );
}
