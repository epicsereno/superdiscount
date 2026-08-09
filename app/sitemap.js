import { allProducts, allCollections, policies } from '@/lib/store';

const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export default function sitemap() {
  const now = new Date();
  return [
    { url: base, lastModified: now, priority: 1 },
    ...allCollections().map((c) => ({ url: `${base}/collections/${c.handle}`, lastModified: now, priority: 0.8 })),
    ...allProducts().map((p) => ({ url: `${base}/products/${p.handle}`, lastModified: now, priority: 0.7 })),
    ...Object.keys(policies).map((s) => ({ url: `${base}/info/${s}`, lastModified: now, priority: 0.3 })),
  ];
}
